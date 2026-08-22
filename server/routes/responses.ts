import { Router } from 'express';
import { store, SurveyResponseRecord, NotificationRecord } from '../db/schema';
import { openAIService } from '../services/openai';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const responsesRouter = Router();

// POST /api/responses (or /api/survey-response) - Ingest real customer answers
// Requires real registered site_id; never use a default site.
responsesRouter.post('/', async (req, res) => {
  try {
    const {
      site_id,
      siteId,
      website_id,
      survey_id,
      surveyId,
      session_id,
      sessionId,
      question_id,
      questionId,
      question_text,
      questionText,
      answer,
      page_url,
      pageUrl,
      time_to_answer,
      timeToAnswer
    } = req.body;

    const targetSiteId = site_id || siteId || website_id;
    if (!targetSiteId) {
      return res.status(400).json({ error: 'site_id is required. Real registered site_id must be provided.' });
    }

    const website = await store.getWebsite(targetSiteId);
    if (!website) {
      return res.status(404).json({ error: 'Website not found or not registered. Responses can only be recorded for registered websites.' });
    }
    const websiteId = website.id;
    const resolvedSiteId = website.site_id;
    const resolvedSurveyId = survey_id || surveyId || 'srv_default';
    const resolvedSessionId = session_id || sessionId || `sess_${Date.now()}`;
    const resolvedQuestionText = question_text || questionText || 'Visitor Feedback';
    const resolvedAnswer = typeof answer === 'string' ? answer : JSON.stringify(answer || '');
    const resolvedPageUrl = page_url || pageUrl || '/';

    if (!resolvedAnswer || !resolvedAnswer.trim()) {
      return res.status(400).json({ error: 'Missing answer' });
    }

    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const responseRecord: SurveyResponseRecord = {
      id: responseId,
      website_id: websiteId,
      survey_id: resolvedSurveyId,
      site_id: resolvedSiteId,
      session_id: resolvedSessionId,
      question_id: question_id || questionId,
      question_text: resolvedQuestionText,
      answer: resolvedAnswer,
      page_url: resolvedPageUrl,
      time_to_answer: time_to_answer || timeToAnswer || 0,
      created_at: new Date().toISOString()
    };

    // 1. Process with AI if OpenAI is available
    try {
      const analysis = await openAIService.processIndividualResponse(responseRecord);
      responseRecord.sentiment = analysis.sentiment;
      responseRecord.importance = analysis.importance;
      responseRecord.category = analysis.category;
      responseRecord.signal = analysis.signal;
      responseRecord.growth_opportunity = analysis.growth_opportunity;
    } catch {
      responseRecord.sentiment = 'neutral';
    }

    // 2. Save response to store
    await store.addResponse(responseRecord);

    // 3. Add notification for new response
    const notif: NotificationRecord = {
      id: `notif_${Date.now()}`,
      website_id: websiteId,
      organization_id: website.organization_id,
      type: 'response',
      title: `New Response on ${responseRecord.question_text.substring(0, 30)}...`,
      message: `Visitor answered: "${responseRecord.answer.substring(0, 60)}${responseRecord.answer.length > 60 ? '...' : ''}"`,
      survey_id: responseRecord.survey_id,
      response_id: responseRecord.id,
      read: false,
      created_at: new Date().toISOString()
    };
    await store.addNotification(notif);

    // 4. Periodically update macro AI insights
    const allWebsiteResponses = await store.getResponses(websiteId);
    if (allWebsiteResponses.length % 3 === 0 || allWebsiteResponses.length === 1) {
      openAIService.generateMacroInsights(websiteId, allWebsiteResponses).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      response: responseRecord
    });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// GET /api/responses - List all responses (enforces auth & ownership)
responsesRouter.get('/', requireAuth, requireWebsiteOwnership('website_id'), async (req, res) => {
  try {
    const website = req.website!;
    const surveyId = req.query.survey_id as string;
    const limitCount = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

    const responses = await store.getResponses(website.id, surveyId, limitCount);
    return res.json({
      responses,
      count: responses.length,
      hasData: responses.length > 0
    });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});


