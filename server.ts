import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { openAIService } from './server/services/openai';
import { store } from './server/db/schema';
import worker from './src/worker/index';

import { surveysRouter } from './server/routes/surveys';
import { eventsRouter } from './server/routes/events';
import { responsesRouter } from './server/routes/responses';
import { analyticsRouter } from './server/routes/analytics';
import { notificationsRouter } from './server/routes/notifications';
import { websitesRouter } from './server/routes/websites';

dotenv.config();

const app = express();
app.use(express.json());

// ----------------------------------------------------
// SERVE TRACKING JAVASCRIPT SDK DIRECTLY
// ----------------------------------------------------
app.get(['/customerlens.js', '/tracker.js', '/survey.js'], (req, res) => {
  const scriptPath = path.join(process.cwd(), 'public', 'customerlens.js');
  if (fs.existsSync(scriptPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(scriptPath);
  }
  return res.status(404).send('// Tracker script not found');
});

// ----------------------------------------------------
// DIRECT EXPRESS ROUTERS FOR STRICT DATA INTEGRITY
// ----------------------------------------------------
app.use('/api/surveys', surveysRouter);
app.use('/api/events', eventsRouter);
app.use('/api/responses', responsesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/websites', websitesRouter);

// Public Tracking Ingestion Aliases (No Default Site Fallback)
app.use('/api/events/track', eventsRouter);
app.use('/api/survey-response', responsesRouter);

// GET /api/public/survey - Fetch active published survey for a verified website
app.get('/api/public/survey', async (req, res) => {
  const siteId = (req.query.siteId as string) || (req.query.site_id as string);
  const domain = req.query.domain as string;

  const targetIdentifier = siteId || domain;
  if (!targetIdentifier) {
    return res.status(400).json({ error: 'site_id or domain is required. Unregistered sites cannot load surveys.' });
  }

  try {
    const website = await store.getWebsite(targetIdentifier);
    if (!website) {
      return res.status(404).json({ error: 'Website not found or not registered. No default survey available.' });
    }

    const surveys = await store.getSurveysByWebsite(website.id);
    const activeSurvey = surveys.find(s => s.status === 'published') || null;

    if (!activeSurvey) {
      return res.status(404).json({ error: 'No active published survey for this website.' });
    }

    return res.json(activeSurvey);
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// ----------------------------------------------------
// AI SERVICES (STRICT OPENAI ONLY - NO SYNTHETIC FALLBACK)
// ----------------------------------------------------
const CUSTOM_FEATURE_RESPONSE = `yes we really priotitize user experience but let me first send a notification to the owner of this website, so that i can concern it once. please tell the feature u want.`;

function isCustomFeatureRequest(msg: string): boolean {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return (
    (lower.includes('custom feature') || lower.includes('build a feature') || lower.includes('make a feature') || lower.includes('add a feature')) &&
    (lower.includes('for me') || lower.includes('right now') || lower.includes('specifically') || lower.includes('can you make') || lower.includes('can u make'))
  );
}

app.post('/api/ai/analyze-website', async (req, res) => {
  const { websiteUrl, businessType } = req.body;
  if (!websiteUrl) {
    return res.status(400).json({ error: 'websiteUrl is required' });
  }
  try {
    const result = await openAIService.scanWebsiteForSurvey({ websiteUrl, businessType });
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: OpenAI API key not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to analyze website with OpenAI.' });
  }
});

// Real data-grounded chatbot insights: the assistant sees the merchant's actual telemetry
app.post('/api/ai/chatbot-insights', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  try {
    const [responses, events, surveys, websites] = await Promise.all([
      store.getResponses().catch(() => []),
      store.getEvents().catch(() => []),
      store.getAllSurveys().catch(() => []),
      store.getAllWebsites().catch(() => [])
    ]);

    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    responses.forEach(r => {
      if (r.sentiment === 'positive') sentiment.positive++;
      else if (r.sentiment === 'negative') sentiment.negative++;
      else sentiment.neutral++;
    });

    const categoryCounts = new Map<string, number>();
    responses.forEach(r => {
      const key = r.category || 'General';
      categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
    });
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const reply = await openAIService.chatBotInsights({
      message,
      history,
      context: {
        businessName: websites[0]?.name || websites[0]?.domain || 'your website',
        domain: websites[0]?.domain || '',
        responsesCount: responses.length,
        eventsCount: events.length,
        activeSurveys: surveys.filter(s => s.status === 'published').length,
        sentiment,
        topCategories,
        recentAnswers: responses.slice(0, 8).map(r => r.answer)
      }
    });
    return res.json({ reply });
  } catch (err: any) {
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: AI API key not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to query analytical assistant.' });
  }
});

// Real workspace analytics: compute genuine metrics, AI narrates them
app.post('/api/ai/workspace-analytics', async (req, res) => {
  const { businessName, websiteUrl, businessType, goal } = req.body;
  try {
    const [responses, events, surveys] = await Promise.all([
      store.getResponses().catch(() => []),
      store.getEvents().catch(() => []),
      store.getAllSurveys().catch(() => [])
    ]);

    const totalSessions = new Set(events.map(e => e.session_id)).size;
    const totalResponses = responses.length;
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    responses.forEach(r => {
      if (r.sentiment === 'positive') sentimentCounts.positive++;
      else if (r.sentiment === 'negative') sentimentCounts.negative++;
      else sentimentCounts.neutral++;
    });

    const objectionsMap = new Map<string, number>();
    responses.forEach(r => {
      const key = r.category || 'General';
      objectionsMap.set(key, (objectionsMap.get(key) || 0) + 1);
    });
    const objections = Array.from(objectionsMap.entries()).map(([reason, count]) => ({
      reason,
      count,
      percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
    }));

    const responseRate = totalSessions > 0 ? Math.min(100, Math.round((totalResponses / totalSessions) * 100)) : 0;
    const metrics = {
      totalVisitors: totalSessions,
      totalResponses,
      activeSurveys: surveys.filter(s => s.status === 'published').length,
      responseRate: `${responseRate}%`,
      triggersFired: events.filter(e => e.event_type === 'exit_intent' || e.event_type === 'rage_click' || e.payload?.exitIntent).length,
      rageClickEvents: events.filter(e => e.event_type === 'rage_click').length
    };
    const sentiment = {
      ...sentimentCounts,
      score: totalResponses > 0 ? Math.round(((sentimentCounts.positive * 100) + (sentimentCounts.neutral * 60)) / totalResponses) : 0
    };

    try {
      const narrated = await openAIService.summarizeWorkspaceAnalytics({
        businessName: businessName || 'My Workspace',
        websiteUrl: websiteUrl || '',
        businessType,
        goal,
        metrics,
        sentiment,
        objections
      });
      return res.json({ ...narrated, metrics, sentiment, objections });
    } catch (aiErr: any) {
      // AI narration unavailable — still return the real metrics
      return res.json({
        today: {
          sessions: metrics.totalVisitors,
          responses: metrics.totalResponses,
          responseRate: metrics.responseRate,
          insight: `${metrics.totalResponses} real response(s) from ${metrics.totalVisitors} tracked session(s).`,
          topObjection: objections[0]?.reason || 'No objections recorded yet',
          action: 'Review recent responses in the analytics tab.'
        },
        insightsSummary: `Live telemetry summary for ${businessName || 'your workspace'}.`,
        metrics,
        sentiment,
        objections
      });
    }
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/api/ai/daily-exit-analysis', async (req, res) => {
  const { date, goal, businessName } = req.body;
  try {
    const result = await openAIService.generateDailyReport(date, goal, businessName);
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: OpenAI API key not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to generate report with OpenAI.' });
  }
});

app.post('/api/ai/recommendations', async (req, res) => {
  const { businessType, goal } = req.body;
  try {
    const result = await openAIService.generateRecommendations(businessType, goal);
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: OpenAI API key not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to generate recommendations with OpenAI.' });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  const { message, messages } = req.body;
  const userText = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : '');

  if (!userText) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  if (isCustomFeatureRequest(userText)) {
    return res.json({ reply: CUSTOM_FEATURE_RESPONSE });
  }

  try {
    const formattedMessages = Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', content: userText }];
    const reply = await openAIService.chatAssistant(formattedMessages);
    return res.json({ reply });
  } catch (err: any) {
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: OpenAI API key not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to query OpenAI Assistant.' });
  }
});

app.post('/api/ai/generate-custom-survey', async (req, res) => {
  const { prompt, domain, businessName, businessType } = req.body;
  if (!prompt && !domain) {
    return res.status(400).json({ error: 'prompt or domain is required' });
  }
  try {
    const result = await openAIService.generateCustomSurveySpec({ prompt, domain, businessName, businessType });
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: OpenAI API key not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to generate survey with OpenAI.' });
  }
});

// ----------------------------------------------------
// CLOUDFLARE WORKER BACKEND BRIDGE FOR ADDITIONAL ENDPOINTS
// ----------------------------------------------------
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      const fullUrl = `${req.protocol}://${req.get('host') || 'localhost:3000'}${req.originalUrl}`;
      const headers = new Headers();
      Object.entries(req.headers).forEach(([k, v]) => {
        if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
      });

      const body = (req.method !== 'GET' && req.method !== 'HEAD')
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : undefined;

      const workerReq = new Request(fullUrl, {
        method: req.method,
        headers,
        body
      });

      const envBindings = {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
        SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
        PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
        PAYPAL_ENV: process.env.PAYPAL_ENV,
        PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        D1_DATABASE: undefined,
        KV_SESSIONS: undefined,
        R2_STORAGE: undefined
      };

      const workerRes = await worker.fetch(workerReq, envBindings as any);

      if (workerRes.status === 404) {
        return next();
      }

      res.status(workerRes.status);
      workerRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const text = await workerRes.text();
      return res.send(text);
    } catch (err) {
      console.error('Cloudflare Worker fallback error:', err);
      return next();
    }
  }
  next();
});

// API 404 JSON Fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.path} not found`, status: 404 });
});

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION STATIC SERVING
// ----------------------------------------------------
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CustomerLens Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
