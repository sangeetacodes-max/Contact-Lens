import { Env } from '../types';
import { RealAnalyticsService } from '../services/analytics';
import { jsonResponse } from '../utils/errors';

export async function handleAnalyticsRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const analyticsService = new RealAnalyticsService(env);
  const url = new URL(request.url);
  const siteId = url.searchParams.get('siteId') || 'default_workspace';
  const businessName = url.searchParams.get('businessName') || 'My Workspace';
  const goal = url.searchParams.get('goal') || 'Conversion';

  // 1. Analytics Overview Endpoint (/api/analytics/overview or /api/ai/workspace-analytics)
  if (pathname === '/api/analytics/overview' || pathname === '/api/ai/workspace-analytics') {
    const stats = await analyticsService.getSiteAnalytics(siteId);
    const exitAnalysis = await analyticsService.getExitAnalysis(siteId, businessName, goal);

    return jsonResponse({
      siteId,
      status: stats.status,
      installationDetected: stats.installationDetected,
      firstPingAt: stats.firstPingAt,
      lastPingAt: stats.lastPingAt,
      today: {
        sessions: stats.totalPageviews,
        triggers: stats.exitIntents,
        responseRate: stats.responseRate,
        revenue: '$0.00',
        insight: stats.totalResponses > 0 
          ? `Captured ${stats.totalResponses} response(s). Top drop-off factors analyzed below.`
          : 'No customer responses yet. Analytics will appear after real visitors interact with your survey.',
        reasons: exitAnalysis.topExitReasons,
        complaints: exitAnalysis.mostCommonComplaints,
        sentiment: exitAnalysis.sentiment,
        sentimentScore: exitAnalysis.sentimentScore,
        suggestions: exitAnalysis.aiSuggestions
      }
    });
  }

  // 2. Real-time Event Stats Endpoint (/api/events/stats)
  if (pathname === '/api/events/stats') {
    const stats = await analyticsService.getSiteAnalytics(siteId);
    return jsonResponse(stats);
  }

  // 3. Exit Analysis Endpoint (/api/analytics/exit-analysis)
  if (pathname === '/api/analytics/exit-analysis') {
    const analysis = await analyticsService.getExitAnalysis(siteId, businessName, goal);
    return jsonResponse(analysis);
  }

  return new Response('Not Found', { status: 404 });
}
