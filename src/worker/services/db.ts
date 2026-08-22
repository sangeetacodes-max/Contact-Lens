import { Env, D1Database, SurveyConfig, TrackingEvent, SurveyResponse, DomainVerificationRecord } from '../types';
import { Logger } from '../utils/logger';

export class DatabaseService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  private ensureDatabase(): D1Database {
    if (!this.env.D1_DATABASE) {
      throw new Error('DATABASE ERROR: Cloudflare D1 Database is not configured');
    }
    return this.env.D1_DATABASE;
  }

  /** Get Site/Workspace details by siteId */
  async getSiteById(siteId: string): Promise<{ id: string; userId: string; name?: string; verified?: boolean; status?: string } | null> {
    if (!siteId) return null;
    const db = this.ensureDatabase();

    try {
      const row = await db.prepare(`
        SELECT * FROM sites WHERE id = ? OR domain = ? LIMIT 1
      `).bind(siteId, siteId).first<any>();
      if (row) {
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          verified: Boolean(row.verified),
          status: row.status || (Boolean(row.verified) ? 'LIVE' : 'UNVERIFIED')
        };
      }

      const ws = await db.prepare(`
        SELECT * FROM workspaces WHERE site_id = ? OR id = ? LIMIT 1
      `).bind(siteId, siteId).first<any>();
      if (ws) {
        return {
          id: ws.id,
          userId: ws.user_id,
          name: ws.business_name,
          verified: Boolean(ws.verified),
          status: Boolean(ws.verified) ? 'LIVE' : 'UNVERIFIED'
        };
      }

      const dv = await db.prepare(`
        SELECT * FROM domain_verifications WHERE site_id = ? OR domain = ? LIMIT 1
      `).bind(siteId, siteId).first<any>();
      if (dv) {
        return {
          id: dv.site_id || dv.id,
          userId: dv.user_id,
          name: dv.domain,
          verified: Boolean(dv.verified),
          status: Boolean(dv.verified) ? 'LIVE' : 'UNVERIFIED'
        };
      }
      return null;
    } catch (err: any) {
      Logger.error('D1 Database getSiteById error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Save or update a Survey */
  async saveSurvey(survey: SurveyConfig): Promise<void> {
    const db = this.ensureDatabase();
    try {
      await db.prepare(`
        INSERT INTO surveys (id, workspace_id, headline, questions_json, colors_json, placement, triggers_json, font_family, logo_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          headline = excluded.headline,
          questions_json = excluded.questions_json,
          colors_json = excluded.colors_json,
          placement = excluded.placement,
          triggers_json = excluded.triggers_json,
          font_family = excluded.font_family,
          logo_url = excluded.logo_url,
          status = excluded.status,
          updated_at = excluded.updated_at
      `).bind(
        survey.id,
        survey.workspaceId || 'default_workspace',
        survey.headline,
        JSON.stringify(survey.questions),
        JSON.stringify(survey.colors),
        survey.placement || 'Exit Intent Popup',
        JSON.stringify(survey.triggers || []),
        survey.fontFamily || 'Inter',
        survey.logoUrl || '',
        survey.status || 'active',
        survey.createdAt || new Date().toISOString(),
        new Date().toISOString()
      ).run();
      Logger.info('Saved survey to Cloudflare D1 Database', { surveyId: survey.id });
    } catch (err: any) {
      Logger.error('D1 Database saveSurvey error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get active Survey by Site ID or Workspace ID */
  async getSurveyBySiteId(siteId: string): Promise<SurveyConfig | null> {
    const db = this.ensureDatabase();
    try {
      const result = await db.prepare(`
        SELECT * FROM surveys WHERE workspace_id = ? OR id = ? ORDER BY updated_at DESC LIMIT 1
      `).bind(siteId, siteId).first<any>();

      if (result) {
        return {
          id: result.id,
          workspaceId: result.workspace_id,
          headline: result.headline,
          questions: JSON.parse(result.questions_json || '[]'),
          colors: JSON.parse(result.colors_json || '{"background":"#09090b","text":"#ffffff","accent":"#3b82f6"}'),
          placement: result.placement,
          triggers: JSON.parse(result.triggers_json || '[]'),
          fontFamily: result.font_family,
          logoUrl: result.logo_url,
          status: result.status,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        };
      }
      return null;
    } catch (err: any) {
      Logger.error('D1 Database getSurveyBySiteId error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Record a Tracking Event */
  async recordEvent(event: TrackingEvent): Promise<void> {
    const db = this.ensureDatabase();
    try {
      await db.prepare(`
        INSERT INTO events (id, site_id, session_id, event_type, page_url, referrer, timestamp, time_on_page, device, browser, payload_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        event.id,
        event.siteId,
        event.sessionId,
        event.eventType,
        event.pageUrl || '',
        event.referrer || '',
        event.timestamp,
        event.timeOnPage || 0,
        event.device || 'Desktop',
        event.browser || 'Chrome',
        JSON.stringify(event.payload || {})
      ).run();
    } catch (err: any) {
      Logger.error('D1 Database recordEvent error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Record a Survey Response */
  async recordResponse(response: SurveyResponse): Promise<void> {
    const db = this.ensureDatabase();
    const metaWithSignal = {
      ...(response.visitorMeta || {}),
      aiSignal: response.aiSignal || response.visitorMeta?.aiSignal
    };

    try {
      await db.prepare(`
        INSERT INTO responses (id, site_id, survey_id, session_id, answers_json, page_url, visitor_meta_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        response.id,
        response.siteId,
        response.surveyId,
        response.sessionId || 'sess_submitted',
        JSON.stringify(response.answers),
        response.pageUrl || '',
        JSON.stringify(metaWithSignal),
        response.timestamp
      ).run();
    } catch (err: any) {
      Logger.error('D1 Database recordResponse error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get Recent Responses for Site */
  async getRecentResponses(siteId: string, limit: number = 30): Promise<SurveyResponse[]> {
    const db = this.ensureDatabase();
    try {
      const res = await db.prepare(`
        SELECT * FROM responses WHERE site_id = ? ORDER BY timestamp DESC LIMIT ?
      `).bind(siteId, limit).all<any>();
      if (res.results) {
        return res.results.map((r: any) => {
          const visitorMeta = JSON.parse(r.visitor_meta_json || '{}');
          return {
            id: r.id,
            siteId: r.site_id,
            surveyId: r.survey_id,
            sessionId: r.session_id,
            answers: JSON.parse(r.answers_json || '[]'),
            pageUrl: r.page_url,
            visitorMeta,
            timestamp: r.timestamp,
            aiSignal: visitorMeta.aiSignal
          };
        });
      }
      return [];
    } catch (err: any) {
      Logger.error('D1 Database getRecentResponses error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get Analytics Summary Data */
  async getAnalytics(siteId: string) {
    const db = this.ensureDatabase();
    try {
      const eventsRes = await db.prepare(`
        SELECT event_type, COUNT(*) as count FROM events WHERE site_id = ? GROUP BY event_type
      `).bind(siteId).all<any>();

      const responsesRes = await db.prepare(`
        SELECT COUNT(*) as count FROM responses WHERE site_id = ?
      `).bind(siteId).first<any>();

      const eventsMap: Record<string, number> = {};
      (eventsRes.results || []).forEach((row: any) => {
        eventsMap[row.event_type] = row.count;
      });

      const totalPageviews = eventsMap['pageview'] || 0;
      const exitIntents = eventsMap['exit_intent'] || 0;
      const cartActions = eventsMap['cart_action'] || 0;
      const totalResponses = responsesRes?.count || 0;

      return {
        siteId,
        totalEvents: Object.values(eventsMap).reduce((a, b) => a + b, 0),
        totalPageviews,
        exitIntents,
        cartActions,
        totalResponses,
        responseRate: totalPageviews > 0 ? ((totalResponses / totalPageviews) * 100).toFixed(1) + '%' : '0.0%'
      };
    } catch (err: any) {
      Logger.error('D1 Database getAnalytics error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Update Workspace Verification Status */
  async setWorkspaceVerified(siteId: string, verified: boolean, method: string) {
    const db = this.ensureDatabase();
    try {
      await db.prepare(`
        UPDATE workspaces SET verified = ?, verification_method = ?, verified_at = ? WHERE site_id = ? OR id = ?
      `).bind(verified ? 1 : 0, method, new Date().toISOString(), siteId, siteId).run();
    } catch (err: any) {
      Logger.error('D1 Database setWorkspaceVerified error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Save Shopify Installation to Cloudflare D1 */
  async saveShopifyInstallation(installation: {
    shop: string;
    accessToken: string;
    scope?: string;
    shopDetails: any;
    host?: string;
    userId?: string;
    installedAt: string;
  }): Promise<void> {
    const db = this.ensureDatabase();
    try {
      await db.prepare(`
        INSERT INTO shopify_installations (shop, access_token, scope, shop_details_json, host, user_id, installed_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(shop) DO UPDATE SET
          access_token = excluded.access_token,
          scope = excluded.scope,
          shop_details_json = excluded.shop_details_json,
          host = excluded.host,
          user_id = excluded.user_id,
          updated_at = excluded.updated_at
      `).bind(
        installation.shop,
        installation.accessToken,
        installation.scope || '',
        JSON.stringify(installation.shopDetails || {}),
        installation.host || '',
        installation.userId || '',
        installation.installedAt,
        new Date().toISOString()
      ).run();
      Logger.info('Saved Shopify merchant installation to D1 Database', { shop: installation.shop });
    } catch (err: any) {
      Logger.error('D1 Database saveShopifyInstallation error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get Shopify Installation from Cloudflare D1 */
  async getShopifyInstallation(shop: string): Promise<any | null> {
    const db = this.ensureDatabase();
    try {
      const row = await db.prepare(`
        SELECT * FROM shopify_installations WHERE shop = ? LIMIT 1
      `).bind(shop).first<any>();

      if (row) {
        return {
          shop: row.shop,
          accessToken: row.access_token,
          scope: row.scope,
          shopDetails: JSON.parse(row.shop_details_json || '{}'),
          host: row.host,
          userId: row.user_id,
          installedAt: row.installed_at
        };
      }
      return null;
    } catch (err: any) {
      Logger.error('D1 Database getShopifyInstallation error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Save Notification */
  async saveNotification(userId: string, title: string, message: string, type = 'info') {
    const notif = { id: 'notif_' + Math.random().toString(36).substring(2, 9), userId, title, message, type, isRead: false, createdAt: new Date().toISOString() };
    const db = this.ensureDatabase();
    try {
      await db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `).bind(notif.id, userId, title, message, type, notif.createdAt).run();
      return notif;
    } catch (err: any) {
      Logger.error('D1 Database saveNotification error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get Notifications for User */
  async getNotifications(userId: string) {
    const db = this.ensureDatabase();
    try {
      const res = await db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
      `).bind(userId).all<any>();
      return res.results || [];
    } catch (err: any) {
      Logger.error('D1 Database getNotifications error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Save or Update PayPal Order in D1 */
  async savePayPalOrder(order: {
    id: string;
    userId?: string;
    planId: string;
    amount: string;
    currency?: string;
    status: string;
    captureId?: string;
    payerEmail?: string;
    payerId?: string;
    customId?: string;
    createdAt?: string;
  }): Promise<void> {
    const createdAt = order.createdAt || new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const currency = order.currency || 'USD';
    const db = this.ensureDatabase();

    try {
      await db.prepare(`
        INSERT INTO paypal_orders (id, user_id, plan_id, amount, currency, status, capture_id, payer_email, payer_id, custom_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          capture_id = COALESCE(excluded.capture_id, paypal_orders.capture_id),
          payer_email = COALESCE(excluded.payer_email, paypal_orders.payer_email),
          payer_id = COALESCE(excluded.payer_id, paypal_orders.payer_id),
          updated_at = excluded.updated_at
      `).bind(
        order.id,
        order.userId || '',
        order.planId,
        order.amount,
        currency,
        order.status,
        order.captureId || null,
        order.payerEmail || null,
        order.payerId || null,
        order.customId || null,
        createdAt,
        updatedAt
      ).run();
      Logger.info('Recorded PayPal order in Cloudflare D1', { orderId: order.id, status: order.status });
    } catch (err: any) {
      Logger.error('D1 Database savePayPalOrder error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get PayPal Order from D1 */
  async getPayPalOrder(orderId: string): Promise<any | null> {
    const db = this.ensureDatabase();
    try {
      const row = await db.prepare(`
        SELECT * FROM paypal_orders WHERE id = ? LIMIT 1
      `).bind(orderId).first<any>();

      if (row) {
        return {
          id: row.id,
          userId: row.user_id,
          planId: row.plan_id,
          amount: row.amount,
          currency: row.currency,
          status: row.status,
          captureId: row.capture_id,
          payerEmail: row.payer_email,
          payerId: row.payer_id,
          customId: row.custom_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      }
      return null;
    } catch (err: any) {
      Logger.error('D1 Database getPayPalOrder error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Update Captured PayPal Order in D1 & Activate Subscription */
  async updatePayPalOrderCapture(orderId: string, captureId: string, status: string, payerEmail?: string, payerId?: string): Promise<void> {
    const updatedAt = new Date().toISOString();
    const db = this.ensureDatabase();

    try {
      await db.prepare(`
        UPDATE paypal_orders 
        SET status = ?, capture_id = ?, payer_email = COALESCE(?, payer_email), payer_id = COALESCE(?, payer_id), updated_at = ?
        WHERE id = ?
      `).bind(status, captureId, payerEmail || null, payerId || null, updatedAt, orderId).run();
      Logger.info('Updated captured PayPal order in Cloudflare D1', { orderId, captureId, status });
    } catch (err: any) {
      Logger.error('D1 Database updatePayPalOrderCapture error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Save or update Domain Verification record in D1 */
  async saveDomainVerification(record: DomainVerificationRecord): Promise<void> {
    const db = this.ensureDatabase();
    try {
      await db.prepare(`
        INSERT INTO domain_verifications (id, user_id, domain, token, txt_record_value, verified, verified_at, created_at, last_checked_at, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          token = excluded.token,
          txt_record_value = excluded.txt_record_value,
          verified = excluded.verified,
          verified_at = excluded.verified_at,
          last_checked_at = excluded.last_checked_at,
          error_message = excluded.error_message
      `).bind(
        record.id,
        record.userId,
        record.domain,
        record.token,
        record.txtRecordValue,
        record.verified ? 1 : 0,
        record.verifiedAt || null,
        record.createdAt,
        record.lastCheckedAt || null,
        record.errorMessage || null
      ).run();
      Logger.info('Saved domain verification record to Cloudflare D1', { domain: record.domain, verified: record.verified });
    } catch (err: any) {
      Logger.error('D1 Database saveDomainVerification error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get specific domain verification record by user and domain */
  async getDomainVerification(userId: string, domain: string): Promise<DomainVerificationRecord | null> {
    const id = `dv_${userId}_${domain}`;
    const db = this.ensureDatabase();

    try {
      const row = await db.prepare(`
        SELECT * FROM domain_verifications WHERE (user_id = ? AND domain = ?) OR id = ? LIMIT 1
      `).bind(userId, domain, id).first<any>();

      if (row) {
        return {
          id: row.id,
          userId: row.user_id,
          domain: row.domain,
          hostname: row.domain,
          url: row.domain.endsWith('.workers.dev') ? `https://${row.domain}` : `http://${row.domain}`,
          token: row.token,
          txtRecordValue: row.txt_record_value,
          verified: Boolean(row.verified),
          verifiedAt: row.verified_at || null,
          createdAt: row.created_at,
          lastCheckedAt: row.last_checked_at || undefined,
          errorMessage: row.error_message || undefined,
          connectionType: row.domain?.endsWith('.workers.dev') ? 'cloudflare_workers' : 'custom_domain',
          verificationStatus: Boolean(row.verified) ? 'verified' : 'pending',
          siteId: `site_${(row.domain || 'site').replace(/[^a-z0-9]/g, '_')}`
        };
      }
      return null;
    } catch (err: any) {
      Logger.error('D1 Database getDomainVerification error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Get all domain verification records for a user */
  async getDomainVerificationsByUser(userId: string): Promise<DomainVerificationRecord[]> {
    const db = this.ensureDatabase();
    try {
      const res = await db.prepare(`
        SELECT * FROM domain_verifications WHERE user_id = ? ORDER BY created_at DESC
      `).bind(userId).all<any>();

      if (res.results) {
        return res.results.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          domain: row.domain,
          hostname: row.domain,
          url: row.domain.endsWith('.workers.dev') ? `https://${row.domain}` : `http://${row.domain}`,
          token: row.token,
          txtRecordValue: row.txt_record_value,
          verified: Boolean(row.verified),
          verifiedAt: row.verified_at || null,
          createdAt: row.created_at,
          lastCheckedAt: row.last_checked_at || undefined,
          errorMessage: row.error_message || undefined,
          connectionType: row.domain?.endsWith('.workers.dev') ? 'cloudflare_workers' : 'custom_domain',
          verificationStatus: Boolean(row.verified) ? 'verified' : 'pending',
          siteId: `site_${(row.domain || 'site').replace(/[^a-z0-9]/g, '_')}`
        }));
      }
      return [];
    } catch (err: any) {
      Logger.error('D1 Database getDomainVerificationsByUser error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }

  /** Delete a domain verification record */
  async deleteDomainVerification(userId: string, domain: string): Promise<boolean> {
    const id = `dv_${userId}_${domain}`;
    const db = this.ensureDatabase();

    try {
      await db.prepare(`
        DELETE FROM domain_verifications WHERE (user_id = ? AND domain = ?) OR id = ?
      `).bind(userId, domain, id).run();
      Logger.info('Deleted domain verification record from D1', { domain });
      return true;
    } catch (err: any) {
      Logger.error('D1 Database deleteDomainVerification error:', err.message);
      throw new Error(`DATABASE ERROR: ${err.message}`);
    }
  }
}
