import { Router } from 'express';
import { store, VisitorSession, VisitorEvent } from '../db/schema';
import { triggerEngine } from '../services/triggerEngine';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const eventsRouter = Router();

// POST /api/events - Ingests telemetry event stream from customerlens.js
// Strictly requires a real registered site_id; never use a default site.
eventsRouter.post('/', async (req, res) => {
  try {
    const {
      site_id,
      siteId,
      session_id,
      sessionId,
      event,
      eventType,
      page,
      pageUrl,
      time_on_page,
      timeOnPage,
      scroll_depth,
      scrollDepth,
      hesitation,
      rage_clicks,
      rageClicks,
      exit_intent,
      exitIntent,
      payload,
      answeredSurveyIds
    } = req.body;

    const resolvedSiteId = site_id || siteId;
    const resolvedSessionId = session_id || sessionId || `sess_${Date.now()}`;
    const resolvedEvent = event || eventType || 'pageview';
    const resolvedPage = page || pageUrl || '/';
    const resolvedTimeOnPage = Number(time_on_page || timeOnPage || 0);
    const resolvedScroll = Number(scroll_depth || scrollDepth || 0);

    if (!resolvedSiteId) {
      return res.status(400).json({ error: 'site_id is required. Real registered website site_id required.' });
    }

    // Lookup website
    const website = await store.getWebsite(resolvedSiteId);
    if (!website) {
      return res.status(404).json({ error: 'Website not found or not registered. Cannot record events for unregistered site.' });
    }

    // Update or create VisitorSession
    let session = await store.getSession(resolvedSessionId);
    const isPricing = resolvedPage.toLowerCase().includes('pricing') || resolvedPage.toLowerCase().includes('plan');

    if (!session) {
      session = {
        id: `sess_rec_${Date.now()}`,
        website_id: website.id,
        site_id: website.site_id,
        session_id: resolvedSessionId,
        current_page: resolvedPage,
        page_url: pageUrl,
        time_on_page: resolvedTimeOnPage,
        scroll_depth: resolvedScroll,
        hesitation: Boolean(hesitation),
        rage_clicks: Number(rage_clicks || rageClicks || 0),
        visit_count: 1,
        pricing_visits: isPricing ? 1 : 0,
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      };
    } else {
      session.current_page = resolvedPage;
      session.page_url = pageUrl || session.page_url;
      session.time_on_page = Math.max(session.time_on_page, resolvedTimeOnPage);
      session.scroll_depth = Math.max(session.scroll_depth, resolvedScroll);
      if (hesitation) session.hesitation = true;
      if (rage_clicks || rageClicks) {
        session.rage_clicks = (session.rage_clicks || 0) + Number(rage_clicks || rageClicks || 1);
      }
      if (isPricing && !session.current_page.toLowerCase().includes('pricing')) {
        session.pricing_visits = (session.pricing_visits || 0) + 1;
      }
      session.last_seen_at = new Date().toISOString();
    }
    await store.saveSession(session);

    // Record VisitorEvent
    const eventRecord: VisitorEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      website_id: website.id,
      site_id: website.site_id,
      session_id: resolvedSessionId,
      event_type: resolvedEvent as any,
      page: resolvedPage,
      payload: {
        ...payload,
        exitIntent: Boolean(exit_intent || exitIntent),
        hesitation: Boolean(hesitation),
        rageClicks: Number(rage_clicks || rageClicks || 0),
        timeOnPage: resolvedTimeOnPage,
        scrollDepth: resolvedScroll
      },
      created_at: new Date().toISOString()
    };
    await store.addEvent(eventRecord);

    // Evaluate Triggers for this website
    const surveys = await store.getSurveysByWebsite(website.id);
    const evaluation = triggerEngine.evaluate(
      session,
      eventRecord,
      surveys,
      Array.isArray(answeredSurveyIds) ? answeredSurveyIds : []
    );

    return res.json({
      status: 'recorded',
      session_id: resolvedSessionId,
      should_show_survey: evaluation.shouldShow,
      survey: evaluation.survey || null,
      trigger_reason: evaluation.reason || null,
      trigger_type: evaluation.triggerType || null
    });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// GET /api/events - List recent event stream for dashboard (enforces auth & ownership)
eventsRouter.get('/', requireAuth, requireWebsiteOwnership('website_id'), async (req, res) => {
  try {
    const website = req.website!;
    const limitCount = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const events = await store.getEvents(website.id, limitCount);
    return res.json({ events });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});


