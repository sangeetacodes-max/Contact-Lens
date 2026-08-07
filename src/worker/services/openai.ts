import { Env } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export class OpenAIService {
  private apiKey?: string;

  constructor(env: Env) {
    this.apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  }

  private getHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new ApiError('env.OPENAI_API_KEY is not configured', 500, 'OPENAI_KEY_MISSING');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Official OpenAI Chat Completions API Call
   */
  async createCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, jsonMode = false) {
    const headers = this.getHeaders();

    const body: any = {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      Logger.error('OpenAI API request failed', { status: response.status, error: errText });
      throw new ApiError(`OpenAI API error (${response.status}): ${errText}`, 502, 'OPENAI_API_ERROR');
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new ApiError('No response content returned from OpenAI API', 502, 'OPENAI_EMPTY_RESPONSE');
    }

    return content;
  }

  /**
   * AI Survey Generation using official OpenAI API
   */
  async generateSurvey(businessType: string, websiteUrl: string, goal: string) {
    const systemPrompt = `You are CustomerLens AI, an expert Customer Success Manager and UX Researcher.
Your job is to generate high-converting, non-intrusive 1-3 question surveys based on business type, website URL, and goal.
Output must strictly be valid JSON format containing:
{
  "headline": "Short engaging survey title",
  "recommendedPlacement": "Exit Intent Popup | Slide-in Widget | Bottom Bar",
  "colors": { "background": "#09090b", "text": "#ffffff", "accent": "#3b82f6" },
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice | rating | text",
      "questionText": "The question",
      "options": ["Option 1", "Option 2"]
    }
  ]
}`;

    const userPrompt = `Business Type: ${businessType}
Website URL: ${websiteUrl}
Goal: ${goal}
Generate the survey object now in JSON.`;

    const rawJson = await this.createCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(rawJson);
  }

  /**
   * AI Follow-up Question Generation
   */
  async generateFollowUp(answerText: string, pageUrl: string) {
    const systemPrompt = `You are CustomerLens AI. A visitor just answered a survey question on a website with: "${answerText}" (Page: ${pageUrl}).
Generate a single, highly empathetic, action-oriented follow-up question or offer that digs into their specific friction without being pushy.
Output JSON:
{
  "followUpQuestion": "The concise follow up text",
  "suggestedOffer": "e.g. 10% discount code, live chat connection, or free shipping offer if relevant"
}`;

    const rawJson = await this.createCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the follow-up question in JSON.' }
    ], true);

    return JSON.parse(rawJson);
  }

  /**
   * Website Scanning & UX/CRO AI Audit
   */
  async scanWebsite(websiteUrl: string, scrapedHtml: string) {
    const systemPrompt = `You are a Senior Conversion Rate Optimization (CRO) Auditor.
Analyze the scraped website text and content to detect friction points, conversion barriers, missing value propositions, and UX issues.
Output JSON:
{
  "websiteTitle": "Extracted or inferred title",
  "overallScore": 82,
  "topFrictionPoints": ["List of 3 primary friction areas"],
  "croOpportunities": [
    {
      "issue": "Description of friction",
      "impact": "High | Medium | Low",
      "recommendation": "Concrete fix",
      "recommendedSurveyTrigger": "e.g. Trigger survey on Pricing page after 45s hesitation"
    }
  ]
}`;

    const userPrompt = `Website URL: ${websiteUrl}
Scraped Website Content Preview:
${scrapedHtml.substring(0, 3000)}

Perform a complete UX/CRO audit and output JSON.`;

    const rawJson = await this.createCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    return JSON.parse(rawJson);
  }

  /**
   * AI Chat Assistant for CRO Advice & Natural Language Survey Editing
   */
  async chatAssistant(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
    const systemPrompt = `You are CustomerLens AI Assistant. You help e-commerce and SaaS founders optimize conversion rates, reduce churn, and edit surveys.
Be concise, helpful, and professional.`;

    const fullMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ];

    return await this.createCompletion(fullMessages, false);
  }
}
