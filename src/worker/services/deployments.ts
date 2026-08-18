/**
 * Real Survey Deployment Service
 * Manages survey lifecycle states, embed snippet generation, and installation detection.
 */

import { Env, SurveyConfig } from '../types';
import { DatabaseService } from './db';
import { DeploymentRecord } from './interfaces';
import { Logger } from '../utils/logger';

export class RealSurveyDeploymentService {
  private env: Env;
  private db: DatabaseService;

  constructor(env: Env) {
    this.env = env;
    this.db = new DatabaseService(env);
  }

  /**
   * Generates the real CustomerLens embed snippet tag
   */
  generateEmbedSnippet(workerOrigin: string, siteId: string, surveyId: string): string {
    const scriptSrc = `${workerOrigin}/customerlens.js`;
    return `<script async src="${scriptSrc}" data-site-id="${siteId}" data-survey-id="${surveyId}"></script>`;
  }

  /**
   * Publishes a survey to production
   */
  async publishSurvey(
    workerOrigin: string,
    survey: SurveyConfig,
    domain: string
  ): Promise<{
    deployment: DeploymentRecord;
    embedSnippet: string;
  }> {
    const deploymentId = `dep_${survey.id}_${Date.now()}`;
    const now = new Date().toISOString();
    const embedSnippet = this.generateEmbedSnippet(workerOrigin, survey.workspaceId, survey.id);

    const deployment: DeploymentRecord = {
      id: deploymentId,
      siteId: survey.workspaceId,
      surveyId: survey.id,
      domain,
      embedSnippet,
      status: 'WAITING_FOR_INSTALLATION',
      installationDetected: false,
      firstEventAt: null,
      lastEventAt: null,
      publishedAt: now,
      createdAt: now
    };

    // Save survey to database
    await this.db.saveSurvey(survey);

    // Save deployment record to D1
    if (this.env.D1_DATABASE) {
      try {
        await this.env.D1_DATABASE.prepare(`
          INSERT INTO survey_deployments (id, site_id, survey_id, domain, embed_snippet, status, installation_detected, published_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          deployment.id,
          deployment.siteId,
          deployment.surveyId,
          deployment.domain,
          deployment.embedSnippet,
          deployment.status,
          0,
          deployment.publishedAt,
          deployment.createdAt
        ).run();
      } catch (err: any) {
        Logger.warn('D1 Database saveDeployment note:', err.message);
      }
    }

    // Cache in KV for instant retrieval by customerlens.js
    if (this.env.KV_SESSIONS) {
      try {
        await this.env.KV_SESSIONS.put(`active_survey:${survey.workspaceId}`, JSON.stringify(survey), { expirationTtl: 86400 });
        await this.env.KV_SESSIONS.put(`deployment:${survey.workspaceId}`, JSON.stringify(deployment), { expirationTtl: 86400 });
      } catch (e) {
        // kv error ignore
      }
    }

    return { deployment, embedSnippet };
  }

  /**
   * Records a detected ping from customerlens.js on the customer's site
   * Transitions status from WAITING_FOR_INSTALLATION to LIVE
   */
  async recordInstallationPing(siteId: string): Promise<void> {
    const now = new Date().toISOString();

    if (this.env.D1_DATABASE) {
      try {
        // Update deployment table
        await this.env.D1_DATABASE.prepare(`
          UPDATE survey_deployments
          SET status = 'LIVE', installation_detected = 1, first_event_at = COALESCE(first_event_at, ?), last_event_at = ?
          WHERE site_id = ?
        `).bind(now, now, siteId).run();

        // Update sites table
        await this.env.D1_DATABASE.prepare(`
          UPDATE sites
          SET status = 'LIVE', first_ping_at = COALESCE(first_ping_at, ?)
          WHERE id = ? OR domain = ?
        `).bind(now, siteId, siteId).run();
      } catch (err: any) {
        Logger.warn('D1 recordInstallationPing note:', err.message);
      }
    }

    // Update KV cache if present
    if (this.env.KV_SESSIONS) {
      try {
        const cached = await this.env.KV_SESSIONS.get(`deployment:${siteId}`, 'json') as DeploymentRecord;
        if (cached) {
          cached.status = 'LIVE';
          cached.installationDetected = true;
          cached.firstEventAt = cached.firstEventAt || now;
          cached.lastEventAt = now;
          await this.env.KV_SESSIONS.put(`deployment:${siteId}`, JSON.stringify(cached), { expirationTtl: 86400 });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Retrieves deployment status for a site
   */
  async getDeployment(siteId: string): Promise<DeploymentRecord | null> {
    if (this.env.D1_DATABASE) {
      try {
        const row = await this.env.D1_DATABASE.prepare(`
          SELECT * FROM survey_deployments WHERE site_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(siteId).first<any>();

        if (row) {
          return {
            id: row.id,
            siteId: row.site_id,
            surveyId: row.survey_id,
            domain: row.domain,
            embedSnippet: row.embed_snippet,
            status: row.status,
            installationDetected: Boolean(row.installation_detected),
            firstEventAt: row.first_event_at,
            lastEventAt: row.last_event_at,
            publishedAt: row.published_at,
            createdAt: row.created_at
          };
        }
      } catch (err: any) {
        Logger.warn('D1 getDeployment note:', err.message);
      }
    }

    if (this.env.KV_SESSIONS) {
      try {
        const cached = await this.env.KV_SESSIONS.get(`deployment:${siteId}`, 'json');
        if (cached) return cached as DeploymentRecord;
      } catch (e) {
        // ignore
      }
    }

    return null;
  }
}
