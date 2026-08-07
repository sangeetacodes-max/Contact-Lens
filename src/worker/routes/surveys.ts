import { Env, SurveyConfig } from '../types';
import { DatabaseService } from '../services/db';
import { StorageService } from '../services/storage';
import { jsonResponse, ApiError } from '../utils/errors';

export async function handleSurveyRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);
  const storage = new StorageService(env);

  // 1. Publish Survey (/api/surveys/publish)
  if (pathname === '/api/surveys/publish' && request.method === 'POST') {
    const body = await request.json() as any;

    const survey: SurveyConfig = {
      id: body.id || 'surv_' + crypto.randomUUID().substring(0, 8),
      workspaceId: body.workspaceId || body.siteId || 'default_workspace',
      headline: body.headline || 'Help us improve!',
      questions: body.questions || [],
      colors: body.colors || { background: '#09090b', text: '#ffffff', accent: '#3b82f6' },
      placement: body.placement || 'Exit Intent Popup',
      triggers: body.triggers || ['exit_intent'],
      fontFamily: body.fontFamily || 'Inter',
      logoUrl: body.logoUrl || '',
      status: 'active',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to D1 Database
    await db.saveSurvey(survey);

    // Cache active survey in KV_SESSIONS for sub-millisecond retrieval
    await storage.kvPut(`active_survey:${survey.workspaceId}`, survey, 86400);

    const url = new URL(request.url);
    const scriptUrl = `${url.origin}/customerlens.js`;
    const embedSnippet = `<script async src="${scriptUrl}" data-site-id="${survey.workspaceId}"></script>`;

    return jsonResponse({
      published: true,
      survey,
      embedSnippet,
      message: 'Survey published successfully!'
    });
  }

  // 2. Get active survey by Site ID (/api/surveys/:siteId or /api/surveys)
  if (pathname.startsWith('/api/surveys')) {
    const parts = pathname.split('/').filter(Boolean);
    const siteId = parts[2] || new URL(request.url).searchParams.get('siteId') || 'default_workspace';

    // Check KV cache first
    let survey = await storage.kvGet<SurveyConfig>(`active_survey:${siteId}`);
    if (!survey) {
      survey = await db.getSurveyBySiteId(siteId);
    }

    if (!survey) {
      // Default fallback survey if none created yet
      survey = {
        id: 'surv_default',
        workspaceId: siteId,
        headline: 'Wait! Before you leave... 💬',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            questionText: 'What is the main reason for ending your visit today?',
            options: ['Price/Shipping costs too high', 'Just comparing products', 'Need custom features', 'Technical issue']
          }
        ],
        colors: { background: '#09090b', text: '#ffffff', accent: '#3b82f6' },
        placement: 'Exit Intent Popup',
        triggers: ['exit_intent'],
        fontFamily: 'Inter',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return jsonResponse(survey);
  }

  return new Response('Not Found', { status: 404 });
}
