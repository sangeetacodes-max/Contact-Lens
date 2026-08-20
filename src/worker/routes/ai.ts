import { Env } from '../types';
import { OpenAIService } from '../services/openai';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

function isCustomFeatureRequest(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes('custom feature') ||
    t.includes('specifically for me') ||
    t.includes('feature right now') ||
    ((t.includes('make') || t.includes('build') || t.includes('create') || t.includes('add') || t.includes('want')) && t.includes('feature'))
  );
}

const CUSTOM_FEATURE_RESPONSE =
  'yes we really priotitize user experience but let me first send a notification to the owner of this website, so that i can concern it once. please tell the feature u want.';

export async function handleAiRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const openai = new OpenAIService(env);

  // 1. AI Survey Generation (/api/ai/generate-survey)
  if (pathname === '/api/ai/generate-survey' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { businessType, websiteUrl, goal } = body;
    if (!businessType || !goal) {
      throw new ApiError('businessType and goal are required', 400, 'MISSING_PARAMS');
    }

    const survey = await openai.generateSurvey(businessType, websiteUrl || 'mysite.com', goal);
    return jsonResponse(survey);
  }

  // 2. AI Wizard (/api/ai/wizard)
  if (pathname === '/api/ai/wizard' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { businessType, websiteUrl, goal } = body;
    if (!businessType || !goal) {
      throw new ApiError('businessType and goal are required', 400, 'MISSING_PARAMS');
    }

    const wizardData = await openai.generateSurvey(businessType, websiteUrl || 'mysite.com', goal);
    return jsonResponse(wizardData);
  }

  // 3. AI Custom Survey Generator (/api/ai/generate-custom-survey)
  if (pathname === '/api/ai/generate-custom-survey' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { prompt } = body;
    if (!prompt) {
      throw new ApiError('prompt is required', 400, 'MISSING_PROMPT');
    }

    const customSurvey = await openai.generateCustomSurvey(prompt);
    return jsonResponse(customSurvey);
  }

  // 4. AI Follow-up Question (/api/ai/follow-up or /api/ai/followup)
  if ((pathname === '/api/ai/follow-up' || pathname === '/api/ai/followup') && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const answerText = body.answer || body.answerText || body.text || '';
    const questionText = body.question || body.questionText || '';
    const pageUrl = body.page || body.pageUrl || '';
    if (!answerText) {
      throw new ApiError('answer or answerText is required', 400, 'MISSING_ANSWER');
    }

    const followUp = await openai.generateShortDiplomaticFollowUp(answerText, questionText, body.history);
    return jsonResponse({
      reply: followUp.reply,
      followup: followUp.reply,
      continue: followUp.continue
    });
  }

  // 5. AI Survey Chat / Follow-Up Chat (/api/ai/survey-chat)
  if (pathname === '/api/ai/survey-chat' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { newMessage, option, history } = body;
    if (!newMessage) {
      throw new ApiError('newMessage is required', 400, 'MISSING_MESSAGE');
    }

    if (isCustomFeatureRequest(newMessage)) {
      return jsonResponse({ reply: CUSTOM_FEATURE_RESPONSE });
    }

    const reply = await openai.surveyChat(newMessage, option, history);
    return jsonResponse({ reply });
  }

  // 6. AI Chatbot Insights (/api/ai/chatbot-insights)
  if (pathname === '/api/ai/chatbot-insights' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { message, history } = body;
    if (!message) {
      throw new ApiError('message is required', 400, 'MISSING_MESSAGE');
    }

    if (isCustomFeatureRequest(message)) {
      return jsonResponse({ reply: CUSTOM_FEATURE_RESPONSE });
    }

    const reply = await openai.chatBotInsights(message, history);
    return jsonResponse({ reply });
  }

  // 7. AI General Chat Assistant (/api/ai/chat)
  if (pathname === '/api/ai/chat' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { messages } = body;
    if (!Array.isArray(messages)) {
      throw new ApiError('messages array is required', 400, 'INVALID_MESSAGES');
    }

    const lastMsg = messages[messages.length - 1]?.content || '';
    if (isCustomFeatureRequest(lastMsg)) {
      return jsonResponse({
        role: 'assistant',
        content: CUSTOM_FEATURE_RESPONSE
      });
    }

    const reply = await openai.chatAssistant(messages);
    return jsonResponse({
      role: 'assistant',
      content: reply
    });
  }

  // 8. AI Edit Surveys (/api/ai/edit-surveys)
  if (pathname === '/api/ai/edit-surveys' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { instruction, surveys } = body;
    if (!instruction || !Array.isArray(surveys)) {
      throw new ApiError('instruction and surveys array required', 400, 'INVALID_PARAMS');
    }

    const promptMessage = `The user wants to edit these surveys: ${JSON.stringify(surveys)}. Instruction: "${instruction}". Output modified surveys array in JSON key "updatedSurveys".`;
    const replyJson = await openai.chatAssistant([{ role: 'user', content: promptMessage }]);

    let updatedSurveys = surveys;
    try {
      const parsed = JSON.parse(replyJson);
      if (parsed.updatedSurveys) updatedSurveys = parsed.updatedSurveys;
    } catch {
      // Keep existing
    }

    return jsonResponse({
      message: `✨ AI updated surveys based on: "${instruction}"`,
      surveys: updatedSurveys
    });
  }

  // 9. AI Website Connection and Analysis (/api/ai/analyze-website)
  if (pathname === '/api/ai/analyze-website' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { websiteUrl, businessType } = body;
    if (!websiteUrl) {
      throw new ApiError('websiteUrl is required', 400, 'MISSING_URL');
    }

    const targetUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    let scrapedHtml = '';

    try {
      const fetchRes = await fetch(targetUrl, {
        headers: { 'User-Agent': 'CustomerLens-Scanner/1.0' }
      });
      if (fetchRes.ok) {
        scrapedHtml = await fetchRes.text();
      }
    } catch (err) {
      Logger.warn('Website scan fetch warning:', err);
      scrapedHtml = `<h1>${websiteUrl}</h1><p>Store category: ${businessType || 'General'}. Analyzed website layout and value prop.</p>`;
    }

    const analysis = await openai.scanWebsite(targetUrl, scrapedHtml, businessType);
    return jsonResponse(analysis);
  }

  // 10. AI Exit Analysis (/api/api-exit-analysis or /api/ai/exit-analysis)
  if ((pathname === '/api/api-exit-analysis' || pathname === '/api/ai/exit-analysis') && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { responses, businessName, goal } = body;
    const safeResponses = Array.isArray(responses) ? responses : [];

    const analysis = await openai.analyzeExit(safeResponses, businessName || 'My Business', goal || 'Feedback');
    return jsonResponse(analysis);
  }

  // 11. Workspace Analytics (/api/ai/workspace-analytics)
  if (pathname === '/api/ai/workspace-analytics' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { businessName, websiteUrl, businessType, goal } = body;

    const analytics = await openai.generateWorkspaceAnalytics(
      businessName || 'My Workspace',
      websiteUrl || '',
      businessType || 'SaaS',
      goal || 'Feedback'
    );
    return jsonResponse(analytics);
  }

  // 12. Weekly AI Recommendations (/api/ai/recommendations)
  if (pathname === '/api/ai/recommendations' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { businessType, goal } = body;

    const recommendations = await openai.generateRecommendations(businessType || 'SaaS', goal || 'Increase conversion');
    return jsonResponse(recommendations);
  }

  return new Response('Not Found', { status: 404 });
}
