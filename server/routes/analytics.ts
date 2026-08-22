import { Router } from 'express';
import { store } from '../db/schema';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const analyticsRouter = Router();

// GET /api/analytics - Aggregated real metrics (enforces auth & ownership)
analyticsRouter.get('/', requireAuth, requireWebsiteOwnership('website_id'), async (req, res) => {
  try {
    const website = req.website!;
    const targetId = website.id;

    let responses: any[] = [];
    let events: any[] = [];
    let surveys: any[] = [];
    let insights: any[] = [];

    try {
      [responses, events, surveys, insights] = await Promise.all([
        store.getResponses(targetId),
        store.getEvents(targetId),
        store.getSurveysByWebsite(targetId),
        store.getInsights(targetId)
      ]);
    } catch (dbErr: any) {
      return res.status(503).json({ error: 'Database error: Failed to query analytics records.' });
    }

    const totalSessions = new Set(events.map(e => e.session_id)).size;
    const totalResponses = responses.length;
    const hasData = totalSessions > 0 || totalResponses > 0;

    // Sentiment Breakdown
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    responses.forEach(r => {
      if (r.sentiment === 'positive') sentimentCounts.positive++;
      else if (r.sentiment === 'negative') sentimentCounts.negative++;
      else sentimentCounts.neutral++;
    });

    // Calculate Objections from real responses
    const objectionsMap = new Map<string, number>();
    responses.forEach(r => {
      const key = r.category || 'General';
      objectionsMap.set(key, (objectionsMap.get(key) || 0) + 1);
    });
    const objectionsList = Array.from(objectionsMap.entries()).map(([reason, count]) => ({
      reason,
      count,
      percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
    }));

    // Trigger breakdowns
    const triggersFired = events.filter(e => e.event_type === 'exit_intent' || e.event_type === 'rage_click' || e.payload?.exitIntent).length;
    const rageClickEvents = events.filter(e => e.event_type === 'rage_click' || (e.payload?.rageClicks && e.payload.rageClicks > 0)).length;

    const responseRate = totalSessions > 0 ? Math.min(100, Math.round((totalResponses / totalSessions) * 100)) : 0;

    return res.json({
      hasData,
      website: website || null,
      metrics: {
        totalVisitors: totalSessions,
        totalResponses,
        activeSurveys: surveys.filter(s => s.status === 'published').length,
        responseRate: `${responseRate}%`,
        triggersFired,
        rageClickEvents
      },
      sentiment: {
        positive: sentimentCounts.positive,
        neutral: sentimentCounts.neutral,
        negative: sentimentCounts.negative,
        score: totalResponses > 0 ? Math.round(((sentimentCounts.positive * 100) + (sentimentCounts.neutral * 60)) / totalResponses) : 0
      },
      objections: objectionsList,
      insights: insights.slice(0, 5),
      recentResponses: responses.slice(0, 10),
      recentEvents: events.slice(0, 15)
    });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});


