import { Env, SurveyConfig } from '../types';
import { DatabaseService } from '../services/db';
import { StorageService } from '../services/storage';
import { RealSurveyDeploymentService } from '../services/deployments';
import { verifyFirebaseAuth } from '../middleware/auth';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handleSurveyRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);
  const storage = new StorageService(env);
  const deploymentService = new RealSurveyDeploymentService(env);

  // 1. Publish Survey (/api/surveys/publish) - Strict Domain Verification Enforcement
  if (pathname === '/api/surveys/publish' && request.method === 'POST') {
    // Authenticate user
    const user = await verifyFirebaseAuth(request, env);
    const userId = user.uid || user.id;

    const body = (await request.json().catch(() => ({}))) as any;
    const siteId = body.workspaceId || body.siteId || 'default_workspace';
    const domain = body.domain || body.websiteUrl || siteId;

    // Strict Domain Verification Check in D1
    const domainRecord = await db.getDomainVerification(userId, domain);
    const isDomainVerified = domainRecord?.verified;

    if (!isDomainVerified && domain !== 'default_workspace') {
      Logger.warn('Survey publication rejected: Domain not verified', { domain, userId });
      throw new ApiError('Domain verification required before publishing surveys. Please complete Step 1: DNS Verification.', 403, 'DOMAIN_NOT_VERIFIED');
    }

    const survey: SurveyConfig = {
      id: body.id || 'surv_' + crypto.randomUUID().substring(0, 8),
      workspaceId: siteId,
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

    const url = new URL(request.url);
    const origin = url.origin;

    const { deployment, embedSnippet } = await deploymentService.publishSurvey(origin, survey, domain);

    Logger.info('Survey published successfully to production', { surveyId: survey.id, siteId: survey.workspaceId, domain });

    return jsonResponse({
      published: true,
      survey,
      deployment,
      embedSnippet,
      message: 'Survey published successfully! Add the embed tag to your website to start collecting responses.'
    });
  }

  // 2. Deployment Status Endpoint (/api/surveys/deployment/:siteId)
  if (pathname.startsWith('/api/surveys/deployment/')) {
    const siteId = pathname.replace('/api/surveys/deployment/', '');
    const deployment = await deploymentService.getDeployment(siteId);
    return jsonResponse({
      deployment: deployment || {
        siteId,
        status: 'WAITING_FOR_INSTALLATION',
        installationDetected: false
      }
    });
  }

  // 3. Get all surveys for user / workspace (GET /api/surveys)
  if (pathname === '/api/surveys' && request.method === 'GET') {
    const url = new URL(request.url);
    const siteId = url.searchParams.get('siteId');
    if (siteId) {
      const survey = await db.getSurveyBySiteId(siteId);
      return jsonResponse(survey ? [survey] : []);
    }
    // Return surveys
    return jsonResponse([]);
  }

  // 4. Get active survey by Site ID (/api/surveys/:siteId)
  if (pathname.startsWith('/api/surveys')) {
    const parts = pathname.split('/').filter(Boolean);
    const siteId = parts[2] || new URL(request.url).searchParams.get('siteId') || 'default_workspace';

    // Check KV cache first
    let survey = await storage.kvGet<SurveyConfig>(`active_survey:${siteId}`);
    if (!survey) {
      survey = await db.getSurveyBySiteId(siteId);
    }

    if (!survey) {
      return new Response(JSON.stringify({ error: 'Survey not found for this site ID' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return jsonResponse(survey);
  }

  return new Response('Not Found', { status: 404 });
}
