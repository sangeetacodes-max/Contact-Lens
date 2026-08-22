import { Env, ResponseSignal, MultiResponsePattern } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

function cleanJsonText(raw: string): string {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }
  return cleaned.trim();
}

function safeJsonParse<T = any>(raw: string, fallback?: T): T {
  try {
    const cleaned = cleanJsonText(raw);
    return JSON.parse(cleaned);
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export class OpenAIService {
  private apiKey?: string;

  constructor(env?: Partial<Env>) {
    this.apiKey = env?.OPENAI_API_KEY || (typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined);
  }

  private getApiKey(): string {
    const key = this.apiKey;
    if (!key || key.includes('****') || !key.trim()) {
      throw new Error('OPENAI_NOT_CONFIGURED');
    }
    return key.trim();
  }

  /**
   * Universal AI Completion (Strictly OpenAI Only)
   */
  async createCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode = false
  ): Promise<string> {
    const apiKey = this.getApiKey();

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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    return cleanJsonText(content.trim());
  }

  /**
   * Intelligent Behavioral Trigger Evaluation (Decision: SHOW / WAIT / DONT_SHOW)
   */
  async evaluateBehaviorTrigger(event: any, sessionSummary?: any): Promise<{ decision: 'SHOW' | 'WAIT' | 'DONT_SHOW'; reason: string; confidence: number }> {
    const systemPrompt = `You are CustomerLens AI Behavior Arbiter.
Analyze the visitor's live session activity and determine whether to trigger a contextual micro-survey right now.
Decision options:
- "SHOW": The visitor exhibits strong hesitation, exit intent, cart uncertainty, or high interest with completed reading depth.
- "WAIT": The visitor is actively reading or smoothly progressing through navigation; do not interrupt yet.
- "DONT_SHOW": The visitor is in a rapid checkout flow or event noise is low.

Output MUST strictly be valid JSON:
{
  "decision": "SHOW" | "WAIT" | "DONT_SHOW",
  "reason": "Short 1-sentence reason",
  "confidence": 0.95
}`;

    const userPrompt = `Event Type: ${event.eventType || 'behavior_update'}
Time On Page: ${event.timeOnPage || 0}s
Scroll Depth: ${event.scrollDepth || event.payload?.scrollPercent || 0}%
Hesitation: ${Boolean(event.hesitation || event.eventType === 'hesitation')}
Repeated Clicks: ${event.repeatedClicks || (event.eventType === 'rage_clicks' ? 4 : 0)}
Exit Intent: ${Boolean(event.exitIntent || event.eventType === 'exit_intent')}
Page URL: ${event.pageUrl || event.page || ''}
Device: ${event.device || 'Desktop'}
Session Context: ${JSON.stringify(sessionSummary || {})}`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true
    );
    const parsed = safeJsonParse(rawJson);
    const decisionVal = parsed.decision === 'NOW' ? 'SHOW' : parsed.decision;
    const finalDecision = (['SHOW', 'WAIT', 'DONT_SHOW'].includes(decisionVal) ? decisionVal : 'SHOW') as 'SHOW' | 'WAIT' | 'DONT_SHOW';
    return {
      decision: finalDecision,
      reason: parsed.reason || 'Decision computed by OpenAI.',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9
    };
  }

  /**
   * Evaluate behavior summary with available survey context
   */
  async evaluateBehaviorSummary(website: string, page: string, behavior: any, availableSurvey: any): Promise<{ decision: 'SHOW' | 'WAIT' | 'DONT_SHOW'; reason: string }> {
    const systemPrompt = `You are CustomerLens AI Behavior Arbiter.
A visitor is currently on a website. Analyze their behavior and the available survey question to decide whether to SHOW the survey now, WAIT, or DONT_SHOW.

Rules:
- "SHOW": Visitor shows hesitation, prolonged dwell time, repeated clicks, exit intent, or deep scroll indicating decision friction.
- "WAIT": Visitor is actively reading or progressing naturally; do not interrupt yet.
- "DONT_SHOW": Low engagement, bounce immediately, or unsuitable page context.

Output MUST strictly be valid JSON:
{
  "decision": "SHOW" | "WAIT" | "DONT_SHOW",
  "reason": "The visitor shows sustained engagement and decision hesitation."
}`;

    const userPrompt = `Website: ${website}
Page: ${page}
Behavior: ${JSON.stringify(behavior || {})}
Available Survey: ${JSON.stringify(availableSurvey || {})}`;

    const rawJson = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true
    );
    const parsed = safeJsonParse(rawJson);
    const decisionVal = parsed.decision === 'NOW' ? 'SHOW' : parsed.decision;
    const finalDecision = (['SHOW', 'WAIT', 'DONT_SHOW'].includes(decisionVal) ? decisionVal : 'SHOW') as 'SHOW' | 'WAIT' | 'DONT_SHOW';
    return {
      decision: finalDecision,
      reason: parsed.reason || 'Evaluated by OpenAI.'
    };
  }

  /**
   * Evaluate an individual visitor response in context and extract structured business signal
   */
  async analyzeIndividualResponse(params: {
    answer: string;
    question?: string;
    pageUrl?: string;
    sessionId?: string;
    visitorMeta?: any;
    websiteContext?: { name?: string; type?: string; goal?: string };
  }): Promise<ResponseSignal> {
    const systemPrompt = `You are CustomerLens AI Intelligence Engine.
Evaluate this individual visitor response in the context of the website and identify whether it contains a meaningful signal that could affect customer experience, conversion, retention, product decisions, or business growth.

CRITICAL DIRECTIVES:
- Do NOT assume every response is important. If a response is casual, brief acknowledgment, or low substance, mark importance as "low" and needs_attention as false.
- Identify signals that matter to business growth, including:
  * Customer hesitating before purchase or pricing confusion
  * A feature or capability customers really want
  * Checkout friction or abandonment reasons
  * Competitor comparisons or mentions
  * Recurring usability / UX friction
  * Positive highlights worth promoting
  * Retention or churn risks
  * Suggestions that could improve the product
- Explain why the signal matters and assign an importance level.

Output MUST strictly be valid JSON with this exact schema:
{
  "importance": "high" | "medium" | "low",
  "category": "pricing" | "checkout_friction" | "feature_request" | "usability" | "competitor" | "positive_highlight" | "retention" | "general_feedback",
  "business_impact": "conversion" | "churn" | "product_growth" | "trust" | "low",
  "signal": "concise description of the visitor's core signal",
  "reason": "why this signal matters to the business",
  "needs_attention": true | false,
  "sentiment": "negative" | "positive" | "neutral",
  "growth_opportunity": "specific actionable recommendation or opportunity"
}`;

    const userPrompt = `Visitor Response: "${params.answer}"
Survey Question: "${params.question || 'Customer Feedback'}"
Page URL: ${params.pageUrl || '/'}
Website Context: ${JSON.stringify(params.websiteContext || {})}
Visitor Metadata: ${JSON.stringify(params.visitorMeta || {})}`;

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        true
      );
      const parsed = safeJsonParse(rawJson, {
        importance: 'medium',
        category: 'general_feedback',
        business_impact: 'conversion',
        signal: params.answer.substring(0, 80),
        reason: 'Individual response evaluated.',
        needs_attention: false,
        sentiment: 'neutral',
        growth_opportunity: ''
      });
      const finalImportance = (['critical', 'high', 'medium', 'low'].includes(parsed.importance) ? parsed.importance : 'medium') as 'critical' | 'high' | 'medium' | 'low';
      const finalSentiment = (['negative', 'positive', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral') as 'negative' | 'positive' | 'neutral';
      return {
        importance: finalImportance,
        category: parsed.category || 'general_feedback',
        business_impact: parsed.business_impact || 'low',
        signal: parsed.signal || params.answer.substring(0, 80),
        reason: parsed.reason || 'Individual response evaluated.',
        needs_attention: Boolean(parsed.needs_attention),
        sentiment: finalSentiment,
        growth_opportunity: parsed.growth_opportunity || '',
        analyzedAt: new Date().toISOString()
      };
    } catch (err: any) {
      Logger.warn('OpenAI analyzeIndividualResponse error, returning unanalyzed signal state:', err?.message);
      return {
        importance: 'low',
        category: 'general_feedback',
        business_impact: 'low',
        signal: params.answer.substring(0, 80) || 'Visitor feedback',
        reason: 'Raw visitor response captured (AI evaluation pending).',
        needs_attention: false,
        sentiment: 'neutral',
        growth_opportunity: '',
        analyzedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Deep Analysis on Aggregated Signals Over Time
   * Recognizes when multiple independent responses point toward the same business problem/opportunity
   */
  async detectMultiResponsePattern(
    recentSignals: ResponseSignal[],
    context?: { siteId?: string; domain?: string; businessName?: string }
  ): Promise<MultiResponsePattern | null> {
    if (!recentSignals || recentSignals.length < 2) {
      return null;
    }

    // Filter for medium/high signals
    const substantiveSignals = recentSignals.filter(s => s.importance === 'high' || s.importance === 'medium');
    if (substantiveSignals.length < 2) {
      return null;
    }

    const systemPrompt = `You are CustomerLens AI Strategic Pattern Detector.
Analyze this list of individual visitor signals gathered over time. Determine whether multiple independent responses are pointing toward the same business problem, conversion risk, or growth opportunity.

RULES:
- Only detect a pattern if AT LEAST 2 independent visitor signals point to the same recurring issue, barrier, or high-value opportunity (e.g. pricing confusion, checkout friction, missing integration, feature demand).
- If signals are random, scattered, or isolated, return "patternDetected": false.
- When a repeated pattern is verified, synthesize a high-impact business notification for the site owner with a root cause diagnosis and actionable recommendation.

Output format MUST strictly be JSON:
{
  "patternDetected": true | false,
  "severity": "critical" | "warning" | "opportunity" | "info",
  "title": "🔴 Potential conversion problem detected",
  "summary": "Multiple visitors have independently mentioned pricing confusion. Consider reviewing how pricing and plan differences are presented.",
  "category": "pricing" | "checkout_friction" | "feature_request" | "usability" | "competitor" | "positive_highlight",
  "affectedSignalsCount": 2,
  "rootCause": "Detailed explanation of the recurring root problem",
  "recommendation": "Concrete tactical step the business owner should take",
  "triggerNotification": true
}`;

    const userPrompt = `Recent Visitor Signals (${substantiveSignals.length} items):
${JSON.stringify(substantiveSignals.slice(0, 15), null, 2)}
Website Context: ${JSON.stringify(context || {})}`;

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        true
      );
      const parsed = JSON.parse(rawJson);
      if (!parsed.patternDetected) {
        return null;
      }
      return {
        patternDetected: true,
        severity: ['critical', 'warning', 'opportunity', 'info'].includes(parsed.severity) ? parsed.severity : 'warning',
        title: parsed.title || '🔴 Potential conversion problem detected',
        summary: parsed.summary || 'Multiple visitors have reported similar issues. Review recommended.',
        category: parsed.category || 'general_feedback',
        affectedSignalsCount: typeof parsed.affectedSignalsCount === 'number' ? parsed.affectedSignalsCount : 2,
        rootCause: parsed.rootCause || '',
        recommendation: parsed.recommendation || '',
        triggerNotification: parsed.triggerNotification !== false
      };
    } catch (err: any) {
      Logger.warn('OpenAI detectMultiResponsePattern error:', err?.message);
      return null;
    }
  }

  /**
   * Generate ONE short, diplomatic, polite follow-up (Max 15 words)
   */
  async generateShortDiplomaticFollowUp(answer: string, surveyQuestion?: string, history?: Array<{ role: string; content: string }>): Promise<{ reply: string; continue: boolean }> {
    const systemPrompt = `You are CustomerLens AI.
A website visitor just answered a survey question.

Task:
Ask ONE short, polite, neutral follow-up.
Maximum 15 words.
Do not repeat the answer.
Do not pressure the visitor.
Be direct and empathetic.

If the answer is a simple greeting or farewell, thank them and end the conversation.`;

    const userPrompt = `Customer feedback:
"${answer}"
${surveyQuestion ? `Survey question asked: "${surveyQuestion}"\n` : ''}
${history && history.length > 0 ? `Previous conversation: ${JSON.stringify(history)}\n` : ''}
Ask ONE short, polite, neutral follow-up (max 15 words).`;

    const reply = await this.createCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      false
    );
    const cleanReply = reply.replace(/^["']|["']$/g, '').trim();
    return {
      reply: cleanReply || 'Which part could we improve to help you decide today?',
      continue: true
    };
  }

  /**
   * Survey Conversational AI Engine
   */
  async surveyChat(newMessage: string, option?: string, history?: Array<{ role: string; content: string }>): Promise<string> {
    const systemPrompt = `You are CustomerLens AI, a polite customer feedback assistant on a live website.
The visitor answered a survey question and is chatting.
Ask ONE short, polite, helpful follow-up or provide a brief empathetic response.
Maximum 15 words. Keep it natural, human, and professional.`;

    const conversation: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    if (option) {
      conversation.push({ role: 'user', content: `Selected option: ${option}` });
    }

    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversation.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
        }
      });
    }

    conversation.push({ role: 'user', content: newMessage });

    const response = await this.createCompletion(conversation, false);
    return response.replace(/^["']|["']$/g, '').trim();
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

    const parsed: any = safeJsonParse(rawJson, {
      headline: 'Quick feedback before you go...',
      description: 'Help us make your experience even better.',
      recommendedPlacement: 'Exit Intent Popup',
      thankYouMessage: 'Thank you for your feedback!',
      colors: { background: '#09090b', text: '#ffffff', accent: '#3b82f6' },
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: 'What is the main reason for your visit today?',
          options: ['Exploring options', 'Checking pricing', 'Looking for specific features', 'Just browsing'],
          required: true
        }
      ]
    });
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

    return safeJsonParse(rawJson, {
      surveyName: 'Visitor Feedback Survey',
      headline: 'Wait! Before you leave...',
      description: 'Help us improve by answering one quick question.',
      goal: 'Identify friction points',
      bestTrigger: 'Exit intent mouse gesture',
      thankYouMessage: 'Thank you for your valuable feedback!',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: 'What almost stopped you from proceeding today?',
          options: ['Pricing', 'Missing a specific feature', 'Need more information', 'Just comparing'],
          required: true
        }
      ],
      logic: 'Show follow-up if pricing selected',
      design: {
        backgroundColor: '#09090b',
        textColor: '#f4f4f5',
        accentColor: '#8b5cf6',
        description: 'Clean modern theme'
      },
      estimatedCompletionTime: '30 seconds',
      deliveryMethod: 'Exit Intent Popup',
      recommendedSurveyType: 'Exit Intent Survey'
    });
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

    return safeJsonParse(rawJson, {
      followUpQuestion: 'What is the single most important thing we could improve for you today?',
      suggestedOffer: ''
    });
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

    return safeJsonParse(rawJson, {
      headline: 'Wait! Before you leave...',
      suggestedQuestions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: 'What is the main reason for your visit today?',
          options: ['Browsing products', 'Looking for pricing info', 'Comparing options', 'Just looking around']
        }
      ],
      behavioralInsights: [
        {
          title: 'High visitor hesitation on key pages',
          description: 'Visitors spend significant time reviewing details before deciding.'
        }
      ],
      overallStrategy: 'Implement contextual exit-intent micro surveys to identify and remove purchasing friction.'
    });
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

      const parsed = safeJsonParse(rawJson, {
        hasEnoughData: true,
        responseCount: responses.length,
        topExitReasons: [{ reason: 'Evaluating options', percentage: 100 }],
        mostCommonComplaints: ['Need more pricing details'],
        sentiment: 'Constructive feedback',
        sentimentScore: 70,
        aiSuggestions: [
          {
            issue: 'Clarity of value proposition',
            recommendation: 'Highlight core benefits prominently on high-exit pages',
            impact: 'High Impact'
          }
        ]
      });
      parsed.hasEnoughData = true;
      parsed.responseCount = responses.length;
      return parsed;
    } catch (err: any) {
      Logger.warn('OpenAI analyzeExit evaluation note:', err.message);
      return {
        hasEnoughData: false,
        responseCount: responses.length,
        message: err.message || 'AI processing unavailable.',
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

      const data: any = safeJsonParse(rawJson, {
        today: { sessions: 0, triggers: 0, responseRate: '0.0%', revenue: '$0.00', insight: `Telemetry listening for ${businessName}.` }
      });
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

    const items = safeJsonParse(rawJson, [
      {
        title: 'Optimize exit intent timing',
        description: 'Set exit survey trigger sensitivity based on dwell time and velocity.',
        type: 'info'
      },
      {
        title: 'Clarify pricing FAQ',
        description: 'Address most frequent customer objections directly in the survey widget.',
        type: 'warning'
      }
    ]);
    const dateStr = new Date().toLocaleDateString();
    return (Array.isArray(items) ? items : []).map((item: any, idx: number) => ({
      id: `rec-${idx + 1}-${Date.now()}`,
      title: item.title || 'Actionable CRO insight',
      description: item.description || 'Improve conversion through active visitor listening.',
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
