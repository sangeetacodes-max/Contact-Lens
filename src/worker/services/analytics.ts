/**
 * Real Analytics Service
 * Computes 100% genuine analytics from stored database events and responses.
 * Strict zero-state when no responses exist.
 */

import { Env } from '../types';
import { DatabaseService } from './db';
import { SiteAnalytics, ExitAnalysisResult } from './interfaces';
import { OpenAIService } from './openai';
import { ApiError } from '../utils/errors';

export class RealAnalyticsService {
  private env: Env;
  private db: DatabaseService;
  private ai: OpenAIService;

  constructor(env: Env) {
    this.env = env;
    this.db = new DatabaseService(env);
    this.ai = new OpenAIService(env);
  }

  /**
   * Computes site metrics strictly from real stored events and survey responses
   */
  async getSiteAnalytics(siteId: string): Promise<SiteAnalytics> {
    const rawStats = await this.db.getAnalytics(siteId);
    
    // Check if installation ping has occurred
    let installationDetected = false;
    let firstPingAt: string | null = null;
    let lastPingAt: string | null = null;

    if (this.env.D1_DATABASE) {
      try {
        const deployRow = await this.env.D1_DATABASE.prepare(`
          SELECT status, installation_detected, first_event_at, last_event_at FROM survey_deployments WHERE site_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(siteId).first<any>();

        if (deployRow) {
          installationDetected = Boolean(deployRow.installation_detected) || rawStats.totalEvents > 0;
          firstPingAt = deployRow.first_event_at;
          lastPingAt = deployRow.last_event_at;
        }
      } catch (err: any) {
        throw new ApiError(`Database error checking deployment status: ${err?.message || 'D1 failure'}`, 500, 'DATABASE_ERROR');
      }
    }

    if (rawStats.totalEvents > 0) {
      installationDetected = true;
    }

    const status: SiteAnalytics['status'] = !installationDetected 
      ? 'WAITING_FOR_INSTALLATION' 
      : 'LIVE';

    return {
      siteId,
      totalEvents: rawStats.totalEvents,
      totalPageviews: rawStats.totalPageviews,
      exitIntents: rawStats.exitIntents,
      cartActions: rawStats.cartActions,
      totalResponses: rawStats.totalResponses,
      responseRate: rawStats.responseRate,
      installationDetected,
      firstPingAt,
      lastPingAt,
      status
    };
  }

  /**
   * Generates genuine Exit Analysis from real stored responses
   * If 0 responses, returns clear zero-state without fabricated numbers.
   */
  async getExitAnalysis(siteId: string, businessName?: string, goal?: string): Promise<ExitAnalysisResult> {
    // 1. Fetch real responses from database
    let realResponses: any[] = [];
    if (this.env.D1_DATABASE) {
      try {
        const res = await this.env.D1_DATABASE.prepare(`
          SELECT * FROM responses WHERE site_id = ? ORDER BY timestamp DESC LIMIT 100
        `).bind(siteId).all<any>();
        if (res.results) {
          realResponses = res.results.map((r: any) => ({
            id: r.id,
            surveyId: r.survey_id,
            answers: JSON.parse(r.answers_json || '[]'),
            pageUrl: r.page_url,
            visitorMeta: JSON.parse(r.visitor_meta_json || '{}'),
            timestamp: r.timestamp
          }));
        }
      } catch (e: any) {
        throw new ApiError(`Database error querying responses: ${e?.message || 'D1 failure'}`, 500, 'DATABASE_ERROR');
      }
    } else {
      throw new ApiError('D1 Database not configured', 500, 'DATABASE_ERROR');
    }

    // Zero-State: When there are no responses yet
    if (!realResponses || realResponses.length === 0) {
      return {
        hasEnoughData: false,
        responseCount: 0,
        message: 'No data yet. Waiting for installed website telemetry.',
        topExitReasons: [],
        mostCommonComplaints: [],
        sentiment: 'Awaiting customer feedback',
        sentimentScore: null,
        aiSuggestions: []
      };
    }

    // Real Data: Pass actual visitor responses to AI
    return await this.ai.analyzeExit(realResponses, businessName, goal);
  }
}
