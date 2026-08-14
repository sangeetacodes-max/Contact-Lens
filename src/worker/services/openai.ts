import { Env } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export class OpenAIService {
  private apiKey?: string;

  constructor(env?: Partial<Env>) {
    this.apiKey = env?.OPENAI_API_KEY || (typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined);
  }

  private getHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new ApiError('OPENAI_API_KEY environment variable is missing. Please configure OPENAI_API_KEY in your settings.', 500, 'OPENAI_KEY_MISSING');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Official OpenAI Chat Completions API Call
   */
  async createCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode = false
  ): Promise<string> {
    const headers = this.getHeaders();

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

      if (!response.ok) {
        const errText = await response.text();
        Logger.error('OpenAI API request failed', { status: response.status, error: errText });
        throw new ApiError(`OpenAI API error (${response.status}): ${errText}`, response.status, 'OPENAI_API_ERROR');
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new ApiError('No response content returned from OpenAI API', 502, 'OPENAI_EMPTY_RESPONSE');
      }

      return content;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      Logger.error('OpenAI fetch error', { error: err.message || err });
      throw new ApiError(`Failed to reach OpenAI API: ${err.message || 'Network failure'}`, 502, 'OPENAI_NETWORK_ERROR');
    }
  }

  /**
   * AI Survey Generation & Wizard
   */
  async generateSurvey(businessType: string, websiteUrl: string, goal: string) {
    const systemPrompt = `You are CustomerLens AI, an expert Customer Experience and Conversion Rate Optimization specialist.
Your job is to generate a high-converting, non-intrusive 1-3 question survey tailored specifically to the business type, website, and goal provided.
Output MUST strictly be valid JSON with this format:
{
  "headline": "Short engaging survey title",
  "recommendedPlacement": "Exit Intent Popup | Slide-in Widget | Bottom Bar | Floating Widget",
  "colors": { "background": "#09090b", "text": "#ffffff", "accent": "#3b82f6" },
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice | rating | text",
      "questionText": "The exact question text",
      "options": ["Option 1", "Option 2"]
    }
  ],
  "suggestedQuestions": [
    {
      "id": "q1",
      "type": "multiple-choice | rating | text",
      "questionText": "The exact question text",
      "options": ["Option 1", "Option 2"]
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
  async generateCustomSurvey(promptText: string) {
    const systemPrompt = `You are CustomerLens, an advanced AI conversion rate optimization (CRO) consultant.
Analyze the user's situation or problem statement and generate a comprehensive survey configuration.

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
  "goal": "Objective of survey",
  "bestTrigger": "When and why to trigger",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice | text | rating",
      "questionText": "Question text",
      "options": ["Option 1", "Option 2"]
    }
  ],
  "logic": "Conditional logic rule",
  "design": {
    "backgroundColor": "#09090b",
    "textColor": "#f4f4f5",
    "accentColor": "#8b5cf6",
    "description": "A dark, clean modern aesthetic"
  },
  "estimatedCompletionTime": "30 seconds",
  "deliveryMethod": "Exit Intent Popup",
  "recommendedSurveyType": "Exit Intent Survey"
}`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Problem / Prompt: "${promptText}"` }
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
        ? history.map((m: any) => `${m.sender === 'ai' ? 'AI' : 'User'}: ${m.text || m.content}`).join('\n')
        : 'No previous history.';

    const systemPrompt = `You are CustomerLens AI, a courteous, witty, concise, context-aware, natural, and highly empathetic customer success agent.
The visitor answered their initial survey choice as: "${option || 'General Feedback'}".

Conversation history:
${historyText}

Guidelines for your response:
- Be concise (1-3 sentences max)
- Be courteous, natural, and empathetic
- Be witty when appropriate without being informal or unprofessional
- Be context-aware and never repetitive
- Focus deeply on understanding the customer's actual underlying reason or bottleneck
- Do not mention internal systems or APIs`;

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

    const systemPrompt = `You are CustomerLens Core Analytics AI. You analyze customer feedback, exit intent trends, conversion rates, and visitor sentiments.
Answer the user's question clearly with bullet points, data trends, and actionable CRO recommendations.

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
   * AI Exit Analysis
   */
  async analyzeExit(responses: any[], businessName?: string, goal?: string) {
    const formattedResponses = responses
      .slice(0, 40)
      .map((r, i) => {
        const ansStr = r.answers?.map((a: any) => `${a.questionId || a.question}: ${a.answer}`).join(' | ');
        return `Response ${i + 1}: [${ansStr || JSON.stringify(r)}]`;
      })
      .join('\n');

    const systemPrompt = `You are a Customer Experience Data Analyst. Analyze the following exit-intent survey responses for business "${businessName || 'Our Business'}" (Goal: ${goal || 'Feedback'}).
Based on the actual data provided:
1. Provide the breakdown of Top Exit Reasons (percentages must sum to 100%).
2. List the Top 3 Most Common Complaints.
3. Assess the overall sentiment and a sentiment score (0 to 100).
4. Give 3 professional conversion rate optimization (CRO) suggestions based on this data.

Output MUST strictly be valid JSON:
{
  "topExitReasons": [
    { "reason": "Price Too High", "percentage": 40 },
    { "reason": "Shipping Concerns", "percentage": 30 },
    { "reason": "Missing Product Options", "percentage": 20 },
    { "reason": "Just Browsing", "percentage": 10 }
  ],
  "mostCommonComplaints": [
    "Complaint 1", "Complaint 2", "Complaint 3"
  ],
  "sentiment": "Mostly Neutral with price friction",
  "sentimentScore": 65,
  "aiSuggestions": [
    {
      "issue": "Identified bottleneck",
      "recommendation": "Actionable fix",
      "impact": "High Impact"
    }
  ]
}`;

    const userPrompt = `Survey responses to analyze:\n${formattedResponses || 'No live responses recorded yet. Analyze general visitor dropoff reasons for this business type.'}`;

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
   * Dynamic Workspace Analytics
   */
  async generateWorkspaceAnalytics(businessName: string, websiteUrl: string, businessType: string, goal: string) {
    const systemPrompt = `You are a Conversion Rate Optimization (CRO) expert. Generate a realistic 4-day analytics report dashboard for a website workspace.
Business Name: ${businessName}
Website URL: ${websiteUrl || 'mysite.com'}
Business Type: ${businessType || 'SaaS'}
Main Goal: ${goal || 'Feedback'}

Output MUST strictly be a JSON structure containing four keys exactly: "today", "yesterday", "july16", and "july15".
Each of these four keys must contain:
- sessions: integer
- triggers: integer (less than sessions)
- responseRate: string e.g. "42.5%"
- revenue: string e.g. "$2,150.00"
- insight: 2-sentence analytical insight specific to ${businessName} (${websiteUrl})
- reasons: array of 4 objects { "reason": string, "percentage": integer (summing to 100) }
- complaints: array of 3 realistic customer complaints
- sentiment: string description
- sentimentScore: integer (0-100)
- suggestions: array of 2 { "issue": string, "recommendation": string, "impact": "High Impact" | "Medium Impact" }`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the workspace analytics report JSON.' }
      ],
      true
    );

    const data = JSON.parse(rawJson);
    data.insightsSummary = data.today?.insight || `Exit intent engagement rate is active for ${businessName}.`;
    return data;
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
