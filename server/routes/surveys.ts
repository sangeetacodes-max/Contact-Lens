import { Router } from 'express';
import { store, Survey, Website } from '../db/schema';
import { openAIService } from '../services/openai';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const surveysRouter = Router();

// GET /api/surveys - List surveys for a website belonging to authenticated user
surveysRouter.get('/', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const websiteId = (req.query.website_id as string) || (req.query.site_id as string);
    
    if (websiteId) {
      const website = await store.getWebsite(websiteId);
      if (!website) {
        return res.status(404).json({ error: 'Website not found' });
      }
      if (website.organization_id !== authUser.organizationId && website.user_id !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Website ownership mismatch' });
      }
      const surveys = await store.getSurveysByWebsite(website.id);
      return res.json({ surveys });
    }

    // Return all surveys across user's registered websites
    const allWebsites = await store.getAllWebsites();
    const userWebsiteIds = new Set(
      allWebsites
        .filter(w => w.organization_id === authUser.organizationId || w.user_id === authUser.userId)
        .map(w => w.id)
    );

    const allSurveys = await store.getAllSurveys();
    const userSurveys = allSurveys.filter(s => userWebsiteIds.has(s.website_id));
    return res.json({ surveys: userSurveys });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// GET /api/surveys/:id - Get survey details (with ownership check)
surveysRouter.get('/:id', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const survey = await store.getSurvey(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const website = await store.getWebsite(survey.website_id);
    if (website && website.organization_id !== authUser.organizationId && website.user_id !== authUser.userId) {
      return res.status(403).json({ error: 'Forbidden: Website ownership mismatch' });
    }

    return res.json({ survey });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/surveys - Create survey for user's verified website
surveysRouter.post('/', requireAuth, requireWebsiteOwnership('website_id'), async (req, res) => {
  try {
    const website = req.website!;
    const {
      title,
      headline,
      description,
      questions,
      triggers,
      design,
      status,
      thank_you_message
    } = req.body;

    const id = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSurvey: Survey = {
      id,
      website_id: website.id,
      organization_id: website.organization_id,
      site_id: website.site_id,
      title: title || 'Untitled Survey',
      headline: headline || 'Quick question...',
      description: description || '',
      status: status || 'published',
      questions: Array.isArray(questions) ? questions : [
        {
          id: `q_${Date.now()}`,
          question_text: 'What was the primary reason for your visit today?',
          type: 'multiple-choice',
          options: ['Pricing', 'Product features', 'Exploring', 'Other'],
          required: true
        }
      ],
      triggers: triggers || { exit_intent: true, dwell_time_pricing: 45 },
      design: design || {
        background_color: '#0f172a',
        text_color: '#ffffff',
        accent_color: '#10b981',
        placement: 'Exit Intent Popup'
      },
      thank_you_message: thank_you_message || 'Thank you for your feedback!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: status === 'published' ? new Date().toISOString() : undefined
    };

    await store.saveSurvey(newSurvey);

    // Add system notification
    await store.addNotification({
      id: `notif_${Date.now()}`,
      website_id: newSurvey.website_id,
      organization_id: newSurvey.organization_id,
      type: 'system',
      title: `Survey Created: ${newSurvey.title}`,
      message: `Your survey "${newSurvey.title}" is ready and set to ${newSurvey.status}.`,
      survey_id: newSurvey.id,
      read: false,
      created_at: new Date().toISOString()
    });

    return res.status(201).json({ success: true, survey: newSurvey });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// PUT /api/surveys/:id - Update survey
surveysRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const survey = await store.getSurvey(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const website = await store.getWebsite(survey.website_id);
    if (website && website.organization_id !== authUser.organizationId && website.user_id !== authUser.userId) {
      return res.status(403).json({ error: 'Forbidden: Website ownership mismatch' });
    }

    const { title, headline, description, questions, triggers, design, status, thank_you_message } = req.body;

    const updated: Survey = {
      ...survey,
      title: title !== undefined ? title : survey.title,
      headline: headline !== undefined ? headline : survey.headline,
      description: description !== undefined ? description : survey.description,
      questions: questions !== undefined ? questions : survey.questions,
      triggers: triggers !== undefined ? triggers : survey.triggers,
      design: design !== undefined ? design : survey.design,
      status: status !== undefined ? status : survey.status,
      thank_you_message: thank_you_message !== undefined ? thank_you_message : survey.thank_you_message,
      updated_at: new Date().toISOString(),
      published_at: status === 'published' && !survey.published_at ? new Date().toISOString() : survey.published_at
    };

    await store.saveSurvey(updated);
    return res.json({ success: true, survey: updated });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// DELETE /api/surveys/:id - Delete survey
surveysRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const survey = await store.getSurvey(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const website = await store.getWebsite(survey.website_id);
    if (website && website.organization_id !== authUser.organizationId && website.user_id !== authUser.userId) {
      return res.status(403).json({ error: 'Forbidden: Website ownership mismatch' });
    }

    await store.deleteSurvey(req.params.id);
    return res.json({ success: true, message: 'Survey deleted successfully' });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/surveys/ai-generate - Generate survey with AI (Strict OpenAI Only)
surveysRouter.post('/ai-generate', requireAuth, async (req, res) => {
  try {
    const { domain, businessName, goal, businessType } = req.body;
    const generated = await openAIService.generateSurveyWithAi({
      domain: domain || 'mybusiness.com',
      businessName,
      goal,
      businessType
    });
    return res.json({ success: true, generated });
  } catch (err: any) {
    if (err.message === 'OPENAI_NOT_CONFIGURED' || err.message === 'OPENAI_KEY_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: OpenAI API key is not configured.' });
    }
    return res.status(503).json({ error: 'AI unavailable: Failed to generate survey with OpenAI.' });
  }
});


