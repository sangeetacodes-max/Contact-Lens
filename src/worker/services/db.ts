import { Env, SurveyConfig, TrackingEvent, SurveyResponse } from '../types';
import { Logger } from '../utils/logger';

// In-memory fallback stores for local development
const memorySurveys = new Map<string, SurveyConfig>();
const memoryEvents: TrackingEvent[] = [];
const memoryResponses: SurveyResponse[] = [];
const memoryWorkspaces = new Map<string, any>();
const memoryNotifications = new Map<string, any[]>();

export class DatabaseService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /** Save or update a Survey */
  async saveSurvey(survey: SurveyConfig): Promise<void> {
    if (this.env.D1_DATABASE) {
      try {
        await this.env.D1_DATABASE.prepare(`
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
        return;
      } catch (err: any) {
        Logger.warn('D1 Database saveSurvey fallback:', err.message);
      }
    }

    memorySurveys.set(survey.id, survey);
  }

  /** Get active Survey by Site ID or Workspace ID */
  async getSurveyBySiteId(siteId: string): Promise<SurveyConfig | null> {
    if (this.env.D1_DATABASE) {
      try {
        const result = await this.env.D1_DATABASE.prepare(`
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
      } catch (err: any) {
        Logger.warn('D1 Database getSurveyBySiteId fallback:', err.message);
      }
    }

    return memorySurveys.get(siteId) || Array.from(memorySurveys.values())[0] || null;
  }

  /** Record a Tracking Event */
  async recordEvent(event: TrackingEvent): Promise<void> {
    if (this.env.D1_DATABASE) {
      try {
        await this.env.D1_DATABASE.prepare(`
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
        return;
      } catch (err: any) {
        Logger.warn('D1 Database recordEvent fallback:', err.message);
      }
    }

    memoryEvents.push(event);
  }

  /** Record a Survey Response */
  async recordResponse(response: SurveyResponse): Promise<void> {
    if (this.env.D1_DATABASE) {
      try {
        await this.env.D1_DATABASE.prepare(`
          INSERT INTO responses (id, site_id, survey_id, session_id, answers_json, page_url, visitor_meta_json, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          response.id,
          response.siteId,
          response.surveyId,
          response.sessionId || 'sess_submitted',
          JSON.stringify(response.answers),
          response.pageUrl || '',
          JSON.stringify(response.visitorMeta || {}),
          response.timestamp
        ).run();
        return;
      } catch (err: any) {
        Logger.warn('D1 Database recordResponse fallback:', err.message);
      }
    }

    memoryResponses.push(response);
  }

  /** Get Analytics Summary Data */
  async getAnalytics(siteId: string) {
    if (this.env.D1_DATABASE) {
      try {
        const eventsRes = await this.env.D1_DATABASE.prepare(`
          SELECT event_type, COUNT(*) as count FROM events WHERE site_id = ? GROUP BY event_type
        `).bind(siteId).all<any>();

        const responsesRes = await this.env.D1_DATABASE.prepare(`
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
        Logger.warn('D1 Database getAnalytics fallback:', err.message);
      }
    }

    const filteredEvents = siteId ? memoryEvents.filter(e => e.siteId === siteId) : memoryEvents;
    const filteredResponses = siteId ? memoryResponses.filter(r => r.siteId === siteId) : memoryResponses;

    const totalPageviews = filteredEvents.filter(e => e.eventType === 'pageview').length;
    const exitIntents = filteredEvents.filter(e => e.eventType === 'exit_intent').length;
    const cartActions = filteredEvents.filter(e => e.eventType === 'cart_action').length;
    const totalResponses = filteredResponses.length;

    return {
      siteId: siteId || 'default_site',
      totalEvents: filteredEvents.length,
      totalPageviews,
      exitIntents,
      cartActions,
      totalResponses,
      responseRate: totalPageviews > 0 ? ((totalResponses / totalPageviews) * 100).toFixed(1) + '%' : '0.0%'
    };
  }

  /** Update Workspace Verification Status */
  async setWorkspaceVerified(siteId: string, verified: boolean, method: string) {
    if (this.env.D1_DATABASE) {
      try {
        await this.env.D1_DATABASE.prepare(`
          UPDATE workspaces SET verified = ?, verification_method = ?, verified_at = ? WHERE site_id = ? OR id = ?
        `).bind(verified ? 1 : 0, method, new Date().toISOString(), siteId, siteId).run();
      } catch (err: any) {
        Logger.warn('D1 Database setWorkspaceVerified fallback:', err.message);
      }
    }

    memoryWorkspaces.set(siteId, { verified, method, verifiedAt: new Date().toISOString() });
  }

  /** Save Notification */
  async saveNotification(userId: string, title: string, message: string, type = 'info') {
    const notif = { id: 'notif_' + Math.random().toString(36).substring(2, 9), userId, title, message, type, isRead: false, createdAt: new Date().toISOString() };
    if (this.env.D1_DATABASE) {
      try {
        await this.env.D1_DATABASE.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?)
        `).bind(notif.id, userId, title, message, type, notif.createdAt).run();
        return notif;
      } catch (err: any) {
        Logger.warn('D1 Database saveNotification fallback:', err.message);
      }
    }

    const list = memoryNotifications.get(userId) || [];
    list.unshift(notif);
    memoryNotifications.set(userId, list);
    return notif;
  }

  /** Get Notifications for User */
  async getNotifications(userId: string) {
    if (this.env.D1_DATABASE) {
      try {
        const res = await this.env.D1_DATABASE.prepare(`
          SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
        `).bind(userId).all<any>();
        return res.results || [];
      } catch (err: any) {
        Logger.warn('D1 Database getNotifications fallback:', err.message);
      }
    }

    return memoryNotifications.get(userId) || [];
  }
}
