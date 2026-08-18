import { Env } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    if (key) {
      geminiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return geminiClient;
}

export class OpenAIService {
  private apiKey?: string;
  private static isApiKeyInvalid = false;
  private static lastTestedKey = '';

  constructor(env?: Partial<Env>) {
    this.apiKey = env?.OPENAI_API_KEY || (typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined);
    if (this.apiKey && this.apiKey !== OpenAIService.lastTestedKey) {
      OpenAIService.lastTestedKey = this.apiKey;
      OpenAIService.isApiKeyInvalid = false;
    }
  }

  private getHeaders(): Record<string, string> | null {
    if (!this.apiKey || OpenAIService.isApiKeyInvalid || this.apiKey.includes('****')) {
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Universal AI Completion (OpenAI with Gemini & Mock CRO Engine Fallbacks)
   */
  async createCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode = false
  ): Promise<string> {
    const headers = this.getHeaders();

    // 1. Try OpenAI API if key is available and not marked invalid
    if (headers) {
      const body: any = {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7
      };

      if (jsonMode) {
        body.response_format = { type: 'json_object' };
      }

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        } else {
          if (response.status === 401 || response.status === 403) {
            OpenAIService.isApiKeyInvalid = true;
            Logger.info('OpenAI key not authorized (401). Switching to secondary AI provider.', { status: response.status });
          }
        }
      } catch (err: any) {
        Logger.info('OpenAI network probe skipped, using secondary AI engine:', { error: err?.message });
      }
    }

    // 2. Try Gemini AI if available with automatic fallback cascade and retries
    try {
      const ai = getGeminiClient();
      if (ai) {
        const systemMsg = messages.find(m => m.role === 'system')?.content || '';
        const userMsgs = messages.filter(m => m.role !== 'system').map(m => `${m.role}: ${m.content}`).join('\n\n');
        const prompt = `${systemMsg ? `System Instruction:\n${systemMsg}\n\n` : ''}${userMsgs}`;

        const candidateModels = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
        for (const model of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: prompt,
              config: jsonMode ? { responseMimeType: 'application/json' } : undefined
            });

            let text = response.text?.trim();
            if (text) {
              if (jsonMode) {
                // Strip markdown code fences if model returned ```json ... ```
                text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
              }
              return text;
            }
          } catch (modelErr: any) {
            const errMsg = String(modelErr?.message || modelErr);
            const isDemandOrRateLimit = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('UNAVAILABLE');
            
            if (isDemandOrRateLimit) {
              Logger.info(`Gemini model ${model} busy/high-demand. Cascading to next model...`);
              // Brief delay before trying next fallback model
              await new Promise(r => setTimeout(r, 250));
              continue;
            } else {
              Logger.info(`Gemini model ${model} error:`, { error: errMsg });
              break;
            }
          }
        }
      }
    } catch (gErr: any) {
      Logger.info('Gemini AI fallback note:', { error: gErr?.message || String(gErr) });
    }

    throw new ApiError('AI is not configured yet. Add the required production API secret.', 503, 'AI_CONFIG_REQUIRED');
  }

  /**
   * Intelligent Behavioral Trigger Evaluation (Decision: NOW / WAIT / DON'T SHOW)
   */
  async evaluateBehaviorTrigger(event: any, sessionSummary?: any): Promise<{ decision: 'NOW' | 'WAIT' | 'DONT_SHOW'; reason: string; confidence: number }> {
    const systemPrompt = `You are CustomerLens AI Behavior Arbiter.
Analyze the visitor's live session activity and determine whether to trigger a contextual micro-survey right now.
Decision options:
- "NOW": The visitor exhibits strong hesitation, exit intent, cart uncertainty, or high interest with completed reading depth.
- "WAIT": The visitor is actively reading or smoothly progressing through navigation; do not interrupt yet.
- "DONT_SHOW": The visitor is in a rapid checkout flow or event noise is low.

Output MUST strictly be valid JSON:
{
  "decision": "NOW" | "WAIT" | "DONT_SHOW",
  "reason": "Short 1-sentence reason",
  "confidence": 0.95
}`;

    const userPrompt = `Event Type: ${event.eventType}
Time On Page: ${event.timeOnPage || 0}s
Page URL: ${event.pageUrl || ''}
Device: ${event.device || 'Desktop'}
Payload: ${JSON.stringify(event.payload || {})}
Session Context: ${JSON.stringify(sessionSummary || {})}`;

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        true
      );
      const parsed = JSON.parse(rawJson);
      return {
        decision: ['NOW', 'WAIT', 'DONT_SHOW'].includes(parsed.decision) ? parsed.decision : 'NOW',
        reason: parsed.reason || 'Trigger condition met.',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9
      };
    } catch {
      // Rule-based fallback if AI is offline
      const isNow = ['exit_intent', 'hesitation', 'rage_clicks', 'cart_action'].includes(event.eventType) ||
        (event.eventType === 'scroll_depth' && (event.payload?.scrollPercent || 0) >= 50);
      return {
        decision: isNow ? 'NOW' : 'WAIT',
        reason: isNow ? 'Critical friction or exit milestone detected.' : 'Monitoring visitor interaction.',
        confidence: 0.85
      };
    }
  }

  /**
   * AI Survey Generation & Wizard
   */
  async generateSurvey(businessType: string, websiteUrl: string, goal: string) {
    const systemPrompt = `You are CustomerLens AI, an expert Customer Experience and Conversion Rate Optimization specialist.
Your job is to generate a high-converting, non-intrusive survey tailored specifically to the business type, website, and goal provided.
Supported question types: "multiple-choice", "rating" (1-5 stars), "text", "yes-no", "nps" (0-10), "email".
Output MUST strictly be valid JSON with this format:
{
  "headline": "Short engaging survey title",
  "description": "Brief context for the visitor",
  "recommendedPlacement": "Exit Intent Popup | Slide-in Widget | Bottom Bar | Floating Widget",
  "thankYouMessage": "Thank you for helping us improve our website!",
  "colors": { "background": "#09090b", "text": "#ffffff", "accent": "#3b82f6" },
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice | rating | text | yes-no | nps | email",
      "questionText": "The exact question text",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ],
  "suggestedQuestions": [
    {
      "id": "q1",
      "type": "multiple-choice | rating | text | yes-no | nps | email",
      "questionText": "The exact question text",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ]
}`;

    const userPrompt = `Business Type: ${businessType}
Website URL: ${websiteUrl}
Goal: ${goal}
Generate the survey object now in JSON.`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true
    );

    const parsed = JSON.parse(rawJson);
    if (!parsed.suggestedQuestions && parsed.questions) {
      parsed.suggestedQuestions = parsed.questions;
    }
    return parsed;
  }

  /**
   * AI Prompt-to-Survey Custom Generator
   */
  async generateCustomSurvey(promptText: string, businessType?: string, websiteUrl?: string) {
    const systemPrompt = `You are CustomerLens, an advanced AI conversion rate optimization (CRO) consultant.
Analyze the user's situation or problem statement and generate a comprehensive survey configuration.
Supported question types: "multiple-choice", "rating" (1-5 stars), "text", "yes-no", "nps" (0-10 scale), "email".

You MUST recommend one of the following exact Survey Types that fits their case best:
- "Exit Intent Survey"
- "Cart Abandonment Survey"
- "Post Purchase Survey"
- "Customer Satisfaction Survey"
- "Trial User Survey"
- "Feature Feedback Survey"
- "Cancellation Survey"
- "Pricing Feedback Survey"
- "NPS Survey"
- "Bug Report Survey"

Output MUST strictly be a JSON object with these keys:
{
  "surveyName": "Concise survey title",
  "headline": "Engaging visitor-facing headline e.g. 'Wait! Before you leave...'",
  "description": "Short explanation for visitor",
  "goal": "Objective of survey",
  "bestTrigger": "When and why to trigger (e.g., 'Exit intent mouse gesture or after 30 seconds')",
  "thankYouMessage": "Thank you! Your feedback helps us make our website better.",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice | text | rating | yes-no | nps | email",
      "questionText": "Question text",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ],
  "logic": "Conditional logic rule or routing suggestion",
  "design": {
    "backgroundColor": "#09090b",
    "textColor": "#f4f4f5",
    "accentColor": "#8b5cf6",
    "description": "A dark, clean modern aesthetic"
  },
  "estimatedCompletionTime": "30 seconds",
  "deliveryMethod": "Exit Intent Popup | Slide In | Embedded Widget | In-Page Popup | Bottom Bar",
  "recommendedSurveyType": "Exit Intent Survey"
}`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Problem / Prompt: "${promptText}"\nBusiness Context: ${businessType || 'Website'} (${websiteUrl || ''})` }
      ],
      true
    );

    return JSON.parse(rawJson);
  }

  /**
   * AI Follow-up Question Generation
   */
  async generateFollowUp(answerText: string, pageUrl: string) {
    const systemPrompt = `You are CustomerLens AI. A visitor just answered a survey question on a website with: "${answerText}" (Page: ${pageUrl}).
Generate a single follow-up question or offer.
Guidelines:
- Concise
- Courteous
- Context-aware
- Natural
- Witty when appropriate
- Never repetitive
- Focused on understanding the customer's actual reason

Output MUST strictly be valid JSON:
{
  "followUpQuestion": "The concise follow up text",
  "suggestedOffer": "Optional relevant offer or next step"
}`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the follow-up question in JSON.' }
      ],
      true
    );

    return JSON.parse(rawJson);
  }

  /**
   * AI Interactive Live Survey Follow-up Chat
   */
  async surveyChat(newMessage: string, option?: string, history?: any[]) {
    const historyText =
      history && Array.isArray(history) && history.length > 0
        ? history.map((m: any) => `${m.sender === 'ai' || m.role === 'assistant' ? 'AI' : 'User'}: ${m.text || m.content}`).join('\n')
        : 'No previous history.';

    const systemPrompt = `You are CustomerLens Smart AI.
The visitor answered their initial survey choice as: "${option || 'General Feedback'}".

Conversation history:
${historyText}

CRITICAL COMMUNICATION DIRECTIVES:
- KEEP IT SHORT AND TO THE POINT (1 to 2 crisp, high-impact sentences).
- TONE: Persuasive, diplomatic, or friendly as appropriate for the visitor's sentiment.
  * If the visitor has price/budget doubts: Be diplomatically persuasive and highlight immediate value or free trial.
  * If the visitor has trust/review questions: Be friendly, honest, and reassuring.
  * If the visitor is comparing competitors: Be diplomatic, respectful of competitors, and clearly state our unique edge.
  * If the visitor gives general feedback: Be warm, appreciative, and focused on quick resolution.
- STAY CONCISE: Never give long-winded answers unless the visitor explicitly asks for a detailed explanation.
- Focus directly on understanding the visitor's core objection or helping them take the next step.
- Do not mention internal technical terms or APIs.`;

    const replyText = await this.createCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: newMessage }
    ]);

    return replyText;
  }

  /**
   * AI Chatbot Insights
   */
  async chatBotInsights(message: string, history?: any[]) {
    const historyText =
      history && Array.isArray(history) && history.length > 0
        ? history.map((m: any) => `${m.sender === 'ai' || m.role === 'assistant' ? 'AI' : 'User'}: ${m.text || m.content}`).join('\n')
        : 'No previous history.';

    const systemPrompt = `You are CustomerLens Core Analytics AI.
Analyze visitor feedback, exit intent patterns, and conversion opportunities.

CRITICAL COMMUNICATION DIRECTIVES:
- Keep answers short, punchy, and to the point.
- Be persuasive, diplomatic, and friendly where appropriate.
- Use 2-3 brief bullet points with clear, actionable recommendations.
- Keep explanations concise unless the user explicitly asks for an in-depth breakdown.

Previous conversation:
${historyText}`;

    return await this.createCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]);
  }

  /**
   * Website Scanning & UX/CRO AI Audit
   */
  async scanWebsite(websiteUrl: string, scrapedHtml: string, businessType?: string) {
    const systemPrompt = `You are CustomerLens Core AI, a Senior Conversion Rate Optimization (CRO) Auditor.
You are given the actual scraped content from the user's real website.
Analyze the text, headings, meta tags, and value propositions to detect friction points, conversion barriers, and exit intent triggers.

Output MUST strictly be valid JSON:
{
  "headline": "A custom, persuasive exit-intent headline tailored to this website, e.g. 'Wait! Before you leave [Brand]...'",
  "suggestedQuestions": [
    {
      "id": "q1",
      "type": "multiple-choice | text",
      "questionText": "Custom survey question text",
      "options": ["Option 1", "Option 2"]
    }
  ],
  "behavioralInsights": [
    {
      "title": "Specific observation on user hesitation",
      "description": "Detailed explanation of why visitors drop off here"
    }
  ],
  "overallStrategy": "2-sentence strategic summary for improving conversion rate on this exact website."
}`;

    const cleanContent = scrapedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const userPrompt = `Website URL: ${websiteUrl}
Business Type: ${businessType || 'eCommerce'}
Real Scraped Page Content:
${cleanContent.substring(0, 3500)}

Perform a complete UX/CRO audit and output JSON.`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true
    );

    return JSON.parse(rawJson);
  }

  /**
   * AI Exit Analysis (Enforces real customer data integrity)
   */
  async analyzeExit(responses: any[], businessName?: string, goal?: string) {
    if (!Array.isArray(responses) || responses.length === 0) {
      return {
        hasEnoughData: false,
        responseCount: 0,
        message: 'Not enough customer data yet. AI insights will appear after visitors interact with your survey.',
        topExitReasons: [],
        mostCommonComplaints: [],
        sentiment: 'Awaiting customer feedback',
        sentimentScore: null,
        aiSuggestions: []
      };
    }

    const formattedResponses = responses
      .slice(0, 50)
      .map((r, i) => {
        const ansStr = r.answers?.map((a: any) => `${a.questionId || a.question || ''}: ${a.answer || ''}`).join(' | ');
        return `Response ${i + 1}: [${ansStr || JSON.stringify(r)}]`;
      })
      .join('\n');

    const systemPrompt = `You are a Customer Experience Data Analyst. Analyze the following real exit-intent survey responses for business "${businessName || 'Our Business'}" (Goal: ${goal || 'Feedback'}).
Based ONLY on the actual data provided:
1. Provide the breakdown of Top Exit Reasons (percentages must sum to 100%).
2. List the Top 3 Most Common Complaints from these real submissions.
3. Assess the overall sentiment and a sentiment score (0 to 100).
4. Give 3 professional conversion rate optimization (CRO) suggestions based on this data.

Output MUST strictly be valid JSON:
{
  "hasEnoughData": true,
  "responseCount": ${responses.length},
  "topExitReasons": [
    { "reason": "Reason string", "percentage": 50 },
    { "reason": "Reason string", "percentage": 50 }
  ],
  "mostCommonComplaints": [
    "Complaint 1", "Complaint 2"
  ],
  "sentiment": "Sentiment description",
  "sentimentScore": 75,
  "aiSuggestions": [
    {
      "issue": "Identified bottleneck",
      "recommendation": "Actionable fix",
      "impact": "High Impact"
    }
  ]
}`;

    const userPrompt = `Real survey responses to analyze (${responses.length} total):\n${formattedResponses}`;

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        true
      );

      const parsed = JSON.parse(rawJson);
      parsed.hasEnoughData = true;
      parsed.responseCount = responses.length;
      return parsed;
    } catch (err: any) {
      Logger.warn('AI analyzeExit evaluation note:', err.message);
      return {
        hasEnoughData: false,
        responseCount: responses.length,
        message: 'AI is not configured yet. Add the required production API secret.',
        topExitReasons: [],
        mostCommonComplaints: [],
        sentiment: 'AI processing unavailable',
        sentimentScore: null,
        aiSuggestions: []
      };
    }
  }

  /**
   * Dynamic Workspace Analytics (Real Data & Zero-State Compliance)
   */
  async generateWorkspaceAnalytics(businessName: string, websiteUrl: string, businessType: string, goal: string) {
    const systemPrompt = `You are a Conversion Rate Optimization (CRO) expert. Generate an initial analytics report template for a website workspace.
Business Name: ${businessName}
Website URL: ${websiteUrl || 'mysite.com'}
Business Type: ${businessType || 'SaaS'}
Main Goal: ${goal || 'Feedback'}

Output MUST strictly be a JSON structure containing four keys: "today", "yesterday", "july16", and "july15".
If real visitor telemetry is 0, session counts should reflect fresh installation state.`;

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the workspace analytics report JSON.' }
        ],
        true
      );

      const data = JSON.parse(rawJson);
      data.insightsSummary = data.today?.insight || `Telemetry listening for ${businessName}.`;
      return data;
    } catch (err: any) {
      return {
        today: {
          sessions: 0,
          triggers: 0,
          responseRate: '0.0%',
          revenue: '$0.00',
          insight: 'No customer responses yet. Analytics will appear after real visitors interact with your survey.',
          reasons: [],
          complaints: [],
          sentiment: 'Awaiting visitor interactions',
          sentimentScore: null,
          suggestions: []
        },
        yesterday: {
          sessions: 0,
          triggers: 0,
          responseRate: '0.0%',
          revenue: '$0.00',
          insight: 'No prior telemetry stored.',
          reasons: [],
          complaints: [],
          sentiment: 'Awaiting visitor interactions',
          sentimentScore: null,
          suggestions: []
        },
        july16: {
          sessions: 0,
          triggers: 0,
          responseRate: '0.0%',
          revenue: '$0.00',
          insight: 'No prior telemetry stored.',
          reasons: [],
          complaints: [],
          sentiment: 'Awaiting visitor interactions',
          sentimentScore: null,
          suggestions: []
        },
        july15: {
          sessions: 0,
          triggers: 0,
          responseRate: '0.0%',
          revenue: '$0.00',
          insight: 'No prior telemetry stored.',
          reasons: [],
          complaints: [],
          sentiment: 'Awaiting visitor interactions',
          sentimentScore: null,
          suggestions: []
        },
        insightsSummary: 'No customer responses yet. Analytics will appear after real visitors interact with your survey.'
      };
    }
  }

  /**
   * Weekly AI Recommendations
   */
  async generateRecommendations(businessType: string, goal: string) {
    const systemPrompt = `Generate exactly 4 high-value customer feedback optimization recommendations for a ${businessType || 'SaaS'} business whose core goal is "${goal || 'Increase conversion'}".
Output MUST strictly be a JSON array of 4 objects:
[
  {
    "title": "Short summary title",
    "description": "Actionable detail and recommendation",
    "type": "info | warning | success"
  }
]`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate recommendations JSON.' }
      ],
      true
    );

    const items = JSON.parse(rawJson);
    const dateStr = new Date().toLocaleDateString();
    return items.map((item: any, idx: number) => ({
      id: `rec-${idx + 1}-${Date.now()}`,
      title: item.title,
      description: item.description,
      type: item.type || 'info',
      date: dateStr
    }));
  }

  /**
   * AI Chat Assistant
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
