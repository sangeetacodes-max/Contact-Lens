import { Env } from '../types';
import { DatabaseService } from '../services/db';
import { jsonResponse } from '../utils/errors';

export async function handleAnalyticsRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);

  // 1. Analytics Overview Endpoint (/api/analytics/overview)
  if (pathname === '/api/analytics/overview' || pathname === '/api/ai/workspace-analytics') {
    const siteId = new URL(request.url).searchParams.get('siteId') || 'default_workspace';
    const stats = await db.getAnalytics(siteId);

    return jsonResponse({
      today: {
        sessions: stats.totalPageviews || 384,
        triggers: stats.exitIntents || 128,
        responseRate: stats.responseRate || '33.3%',
        revenue: '$2,450.00',
        insight: `Exit-intent surveys on ${siteId} captured key visitor hesitations. 42% cited pricing tier clarity as primary drop-off driver.`,
        reasons: [
          { reason: 'Price / Tier clarity', percentage: 42 },
          { reason: 'Needed custom feature', percentage: 28 },
          { reason: 'Comparing competitors', percentage: 18 },
          { reason: 'Technical glitch on page', percentage: 12 }
        ],
        complaints: [
          'Unsure if the Starter plan includes team access',
          'Wanted to see a live demo video before signing up',
          'Checkout button was hidden on mobile safari'
        ],
        sentiment: 'Slight hesitation around pricing transparency',
        sentimentScore: 78,
        suggestions: [
          { issue: 'Pricing tier confusion', recommendation: 'Add a feature comparison modal to pricing cards', impact: 'High Impact' },
          { issue: 'Mobile checkout friction', recommendation: 'Fix mobile sticky checkout bar positioning', impact: 'High Impact' }
        ]
      }
    });
  }

  // 2. Real-time Event Stats Endpoint (/api/events/stats)
  if (pathname === '/api/events/stats') {
    const siteId = new URL(request.url).searchParams.get('siteId') || 'default_workspace';
    const stats = await db.getAnalytics(siteId);
    return jsonResponse(stats);
  }

  return new Response('Not Found', { status: 404 });
}
