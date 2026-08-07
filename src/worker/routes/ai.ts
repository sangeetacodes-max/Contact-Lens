import { Env } from '../types';
import { OpenAIService } from '../services/openai';
import { jsonResponse, ApiError } from '../utils/errors';

export async function handleAiRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const openai = new OpenAIService(env);

  // 1. AI Survey Generation (/api/ai/generate-survey)
  if (pathname === '/api/ai/generate-survey' && request.method === 'POST') {
    const { businessType, websiteUrl, goal } = await request.json() as any;
    if (!businessType || !goal) {
      throw new ApiError('businessType and goal are required', 400, 'MISSING_PARAMS');
    }

    const survey = await openai.generateSurvey(businessType, websiteUrl || 'mysite.com', goal);
    return jsonResponse(survey);
  }

  // 2. AI Wizard (/api/ai/wizard)
  if (pathname === '/api/ai/wizard' && request.method === 'POST') {
    const { businessType, websiteUrl, goal } = await request.json() as any;
    if (!businessType || !goal) {
      throw new ApiError('businessType and goal are required', 400, 'MISSING_PARAMS');
    }

    const wizardData = await openai.generateSurvey(businessType, websiteUrl || 'mysite.com', goal);
    return jsonResponse(wizardData);
  }

  // 3. AI Follow-up Question (/api/ai/follow-up)
  if (pathname === '/api/ai/follow-up' && request.method === 'POST') {
    const { answerText, pageUrl } = await request.json() as any;
    if (!answerText) {
      throw new ApiError('answerText is required', 400, 'MISSING_ANSWER');
    }

    const followUp = await openai.generateFollowUp(answerText, pageUrl || '');
    return jsonResponse(followUp);
  }

  // 4. AI Chat Assistant (/api/ai/chat)
  if (pathname === '/api/ai/chat' && request.method === 'POST') {
    const { messages } = await request.json() as any;
    if (!Array.isArray(messages)) {
      throw new ApiError('messages array is required', 400, 'INVALID_MESSAGES');
    }

    const lastMsg = messages[messages.length - 1]?.content || '';
    const t = lastMsg.toLowerCase();
    if (
      t.includes('custom feature') ||
      t.includes('specifically for me') ||
      t.includes('feature right now') ||
      ((t.includes('make') || t.includes('build')) && t.includes('feature'))
    ) {
      return jsonResponse({
        role: 'assistant',
        content: "yes we really priotitize user experience but let me first send a notification to the owner of this website, so that i can concern it once. please tell the feature u want."
      });
    }

    const reply = await openai.chatAssistant(messages);
    return jsonResponse({
      role: 'assistant',
      content: reply
    });
  }

  // 5. AI Edit Surveys (/api/ai/edit-surveys)
  if (pathname === '/api/ai/edit-surveys' && request.method === 'POST') {
    const { instruction, surveys } = await request.json() as any;
    if (!instruction || !Array.isArray(surveys)) {
      throw new ApiError('instruction and surveys array required', 400, 'INVALID_PARAMS');
    }

    const promptMessage = `The user wants to edit these surveys: ${JSON.stringify(surveys)}. Instruction: "${instruction}". Output modified surveys array in JSON key "updatedSurveys".`;
    const replyJson = await openai.chatAssistant([
      { role: 'user', content: promptMessage }
    ]);

    let updatedSurveys = surveys;
    try {
      const parsed = JSON.parse(replyJson);
      if (parsed.updatedSurveys) updatedSurveys = parsed.updatedSurveys;
    } catch {
      // Keep existing surveys if raw string returned
    }

    return jsonResponse({
      message: `✨ AI updated surveys based on: "${instruction}"`,
      surveys: updatedSurveys
    });
  }

  return new Response('Not Found', { status: 404 });
}
