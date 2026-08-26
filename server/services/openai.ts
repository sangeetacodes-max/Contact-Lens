import { GoogleGenAI } from '@google/genai';
import { SurveyResponseRecord, AiInsight, NotificationRecord, store, SurveyQuestion, SurveyDesign, SurveyTriggers } from '../db/schema';

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

function parseJsonStrict<T = any>(raw: string): T {
  const cleaned = cleanJsonText(raw);
  return JSON.parse(cleaned);
}

export class OpenAIService {
  private geminiClient: GoogleGenAI | null = null;

  private getOpenAIKey(): string | null {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.includes('****') || !key.trim()) {
      return null;
    }
    return key.trim();
  }

  private getGeminiKey(): string | null {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key || key.includes('****') || !key.trim()) {
      return null;
    }
    return key.trim();
  }

  /**
   * Real AI Completion. Uses OpenAI when OPENAI_API_KEY is configured,
   * otherwise falls back to the Gemini key injected by the host environment.
   */
  async createCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode = false
  ): Promise<string> {
    const openAiKey = this.getOpenAIKey();
    if (openAiKey) {
      return this.createOpenAICompletion(openAiKey, messages, jsonMode);
    }

    const geminiKey = this.getGeminiKey();
    if (geminiKey) {
      return this.createGeminiCompletion(geminiKey, messages, jsonMode);
    }

    throw new Error('OPENAI_KEY_NOT_CONFIGURED');
  }

  private async createOpenAICompletion(
    apiKey: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode: boolean
  ): Promise<string> {
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

  private async createGeminiCompletion(
    apiKey: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    jsonMode: boolean
  ): Promise<string> {
    if (!this.geminiClient) {
      this.geminiClient = new GoogleGenAI({ apiKey });
    }

    const systemInstruction = messages
      .filter(m => m.role === 'system')
      .map(m => m.content)
      .join('\n\n')
      .trim();

    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: systemInstruction || 'Hello' }] });
    }

    const response = await this.geminiClient.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        temperature: 0.7
      }
    });

    const content = response.text;
    if (!content) {
      throw new Error('Empty response from Gemini');
    }
    return cleanJsonText(content.trim());
  }

  /**
   * Evaluates and categorizes a single incoming survey response
   */
  async processIndividualResponse(response: SurveyResponseRecord): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    importance: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    signal: string;
    growth_opportunity: string;
  }> {
    const prompt = `Analyze this customer feedback response for an online business:
Question: "${response.question_text}"
Customer Answer: "${response.answer}"
Page URL: "${response.page_url}"

Return a JSON object with:
- "sentiment": "positive" | "negative" | "neutral"
- "importance": "critical" | "high" | "medium" | "low"
- "category": e.g. "pricing_objection", "feature_gap", "usability_friction", "missing_info", "praise"
- "signal": 1 sentence summarizing the core takeaway
- "growth_opportunity": 1 actionable recommendation to boost conversion`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are an expert CRO and Customer Intelligence AI.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<{
      sentiment: 'positive' | 'negative' | 'neutral';
      importance: 'critical' | 'high' | 'medium' | 'low';
      category: string;
      signal: string;
      growth_opportunity: string;
    }>(raw);

    return {
      sentiment: (['positive', 'negative', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral'),
      importance: (['critical', 'high', 'medium', 'low'].includes(parsed.importance) ? parsed.importance : 'medium'),
      category: parsed.category || 'customer_feedback',
      signal: parsed.signal || response.answer.substring(0, 80),
      growth_opportunity: parsed.growth_opportunity || ''
    };
  }

  /**
   * Generates macro AI Insights from a batch of responses and creates notifications
   */
  async generateMacroInsights(websiteId: string, responses: SurveyResponseRecord[]): Promise<AiInsight | null> {
    if (responses.length === 0) return null;

    const sampleText = responses.slice(0, 25).map(r => `[Q: ${r.question_text}] Ans: ${r.answer} (Page: ${r.page_url})`).join('\n');
    const prompt = `Analyze these ${responses.length} real customer responses:
${sampleText}

Output JSON:
{
  "title": "Short title describing primary friction/opportunity",
  "summary": "2-3 sentence executive synthesis of visitor feedback",
  "objections": [
    {"reason": "Main objection or friction point", "percentage": 45},
    {"reason": "Secondary objection", "percentage": 30}
  ],
  "sentiment_score": 75,
  "recommendations": [
    {"issue": "Core problem detected", "recommendation": "Concrete fix to increase conversions", "impact": "High"}
  ]
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI Senior Growth Strategist.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<any>(raw);

    const insight: AiInsight = {
      id: `ins_${Date.now()}`,
      website_id: websiteId,
      type: 'summary',
      title: parsed.title || 'Customer Intelligence Insight',
      summary: parsed.summary || 'Summary of recent customer feedback trends.',
      objections: parsed.objections || [],
      sentiment_score: parsed.sentiment_score || 70,
      recommendations: parsed.recommendations || [],
      created_at: new Date().toISOString()
    };

    await store.addInsight(insight);

    const notif: NotificationRecord = {
      id: `notif_${Date.now()}`,
      website_id: websiteId,
      type: 'ai_insight',
      title: `New AI Insight: ${insight.title}`,
      message: insight.summary,
      read: false,
      created_at: new Date().toISOString()
    };
    await store.addNotification(notif);

    return insight;
  }

  /**
   * Generates a context-aware survey with questions, triggers, and styling based on business description
   */
  async generateSurveyWithAi(params: {
    domain?: string;
    businessName?: string;
    goal?: string;
    businessType?: string;
    prompt?: string;
  }): Promise<{
    title: string;
    headline: string;
    questions: SurveyQuestion[];
    triggers: SurveyTriggers;
    design: SurveyDesign;
    thank_you_message: string;
  }> {
    const prompt = `Create an ultra-high-converting micro-survey (1-2 questions max) for:
Business Name: "${params.businessName || params.domain || 'My Website'}"
Domain: "${params.domain || 'example.com'}"
Goal: "${params.goal || params.prompt || 'Identify why visitors leave without buying'}"
Type: "${params.businessType || 'e-commerce / SaaS'}"

Output JSON:
{
  "title": "Exit Intent Micro-Survey",
  "headline": "Wait! Before you go...",
  "questions": [
    {
      "id": "q1",
      "question_text": "What almost stopped you from completing your purchase today?",
      "type": "multiple-choice",
      "options": ["Pricing was higher than expected", "Couldn't find what I needed", "Just comparing options", "Other"],
      "required": true
    }
  ],
  "triggers": {
    "exit_intent": true,
    "dwell_time_pricing": 45,
    "pricing_visit_count": 3,
    "rage_clicks": true,
    "hesitation": true
  },
  "design": {
    "background_color": "#0f172a",
    "text_color": "#ffffff",
    "accent_color": "#10b981",
    "placement": "Exit Intent Popup"
  },
  "thank_you_message": "Thank you for helping us improve!"
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI Survey Architect.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<any>(raw);

    return {
      title: parsed.title || 'Exit Intent Feedback Survey',
      headline: parsed.headline || 'Wait! Before you leave...',
      questions: (parsed.questions || []) as SurveyQuestion[],
      triggers: parsed.triggers || { exit_intent: true, dwell_time_pricing: 45 },
      design: (parsed.design || { background_color: '#0f172a', text_color: '#ffffff', accent_color: '#10b981', placement: 'Exit Intent Popup' }) as SurveyDesign,
      thank_you_message: parsed.thank_you_message || 'Thank you!'
    };
  }

  /**
   * Analyzes an external website URL
   */
  async analyzeWebsite(params: { websiteUrl: string; businessType?: string }) {
    const prompt = `Analyze this business website URL for conversion rate optimization and customer feedback opportunities:
Website: "${params.websiteUrl}"
Business Type: "${params.businessType || 'General Business'}"

Return JSON:
{
  "summary": "Brief 2-sentence summary of the business offering",
  "targetAudience": "Primary customer persona",
  "keyFrictionPoints": ["Friction 1", "Friction 2", "Friction 3"],
  "recommendedSurveys": [
    {
      "trigger": "exit_intent",
      "question": "What is the primary question you have before purchasing?",
      "options": ["Pricing clarity", "Feature comparison", "Security/Trust", "Other"]
    }
  ],
  "estimatedLift": "+15-25% Conversion Recovery"
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are a Conversion Rate Optimization Architect.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    return parseJsonStrict(raw);
  }

  /**
   * Daily Report Generation
   */
  async generateDailyReport(date: string, goal: string, businessName: string) {
    const prompt = `Generate a realistic daily conversion report synthesis for ${businessName || 'the store'} on date ${date || 'today'} with business goal "${goal || 'Increase sales'}".
Return JSON with metrics structure:
{
  "sessions": 1250,
  "triggers": 142,
  "responseRate": "11.4%",
  "revenue": "$1,450.00",
  "insight": "High pricing hesitation detected on tier 2 options.",
  "reasons": [{"reason": "Pricing", "percentage": 42}, {"reason": "Shipping", "percentage": 30}],
  "complaints": ["Shipping calculator hidden", "Comparison chart missing"],
  "sentiment": "Neutral to Positive",
  "sentimentScore": 72,
  "suggestions": ["Add FAQ accordion near checkout", "Clarify return policy"]
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI Analytics Engine.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    return parseJsonStrict(raw);
  }

  /**
   * AI Recommendations
   */
  async generateRecommendations(businessType: string, goal: string) {
    const prompt = `Generate 4 actionable customer feedback optimization recommendations for a ${businessType || 'SaaS'} business whose core goal is "${goal || 'Increase conversion'}".
Output JSON array:
[
  {
    "title": "Title",
    "description": "Actionable detail",
    "type": "info | warning | success"
  }
]`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI Growth Advisor.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const items = parseJsonStrict<any[]>(raw);
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
   * AI Chat Assistant — sharp, to the point, grounded.
   */
  async chatAssistant(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
    const systemPrompt = `You are CustomerLens AI — a razor-sharp conversion and customer-intelligence copilot for e-commerce and SaaS founders.

Communication style:
- Direct and to the point. No filler, no fluff, no generic advice.
- Clever: spot the real issue behind the question and name it.
- Answer in 1-3 short sentences or up to 3 tight bullet points.
- Every recommendation must be concrete and actionable (what to change, where, and why it lifts conversion).
- When asked about surveys, suggest exact question wording and trigger logic.`;

    const fullMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ];

    return await this.createCompletion(fullMessages, false);
  }

  /**
   * Chatbot insights chat — grounded in the merchant's REAL stored telemetry,
   * concise and clever by design.
   */
  async chatBotInsights(params: {
    message: string;
    history?: Array<{ sender?: string; role?: string; text?: string; content?: string }>;
    context: {
      businessName: string;
      domain: string;
      responsesCount: number;
      eventsCount: number;
      activeSurveys: number;
      sentiment: { positive: number; neutral: number; negative: number };
      topCategories: string[];
      recentAnswers: string[];
    };
  }): Promise<string> {
    const { context } = params;
    const historyText = (params.history || [])
      .slice(-10)
      .map(m => `${(m.sender === 'ai' || m.role === 'assistant') ? 'AI' : 'User'}: ${m.text || m.content || ''}`)
      .join('\n');

    const systemPrompt = `You are CustomerLens Core Analytics AI for the business "${context.businessName}" (${context.domain}).

LIVE DATA (real, from their tracking snippet — never invent other numbers):
- Survey responses collected: ${context.responsesCount}
- Visitor events tracked: ${context.eventsCount}
- Active published surveys: ${context.activeSurveys}
- Sentiment split: ${context.sentiment.positive} positive / ${context.sentiment.neutral} neutral / ${context.sentiment.negative} negative
- Top feedback categories: ${context.topCategories.length > 0 ? context.topCategories.join(', ') : 'none yet'}
- Recent real visitor answers: ${context.recentAnswers.length > 0 ? context.recentAnswers.map(a => `"${a}"`).join(' | ') : 'none yet'}

CRITICAL COMMUNICATION DIRECTIVES:
- Keep answers short, punchy, and to the point — 1-3 sentences or up to 3 tight bullets.
- Be clever: connect the dots in their real data and say something insightful, not generic.
- Ground every claim in the live data above. If there is no data yet, say so plainly and tell them the single fastest way to get some.
- Be persuasive, diplomatic, and friendly. A touch of wit is welcome.
- End with one clear, actionable next step when relevant.

${historyText ? `Conversation so far:\n${historyText}` : ''}`;

    return await this.createCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: params.message }
    ], false);
  }

  /**
   * Real website scan: fetches the site's HTML and produces a tailored survey
   * configuration in the exact shape the dashboard renders.
   */
  async scanWebsiteForSurvey(params: { websiteUrl: string; businessType?: string }): Promise<{
    headline: string;
    suggestedQuestions: Array<{ id: string; type: string; questionText: string; options?: string[] }>;
    behavioralInsights: Array<{ title: string; description: string }>;
    overallStrategy: string;
  }> {
    const targetUrl = params.websiteUrl.startsWith('http') ? params.websiteUrl : `https://${params.websiteUrl}`;

    let scrapedText = '';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const fetchRes = await fetch(targetUrl, {
        headers: { 'User-Agent': 'CustomerLens-Scanner/1.0', 'Accept': 'text/html' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (fetchRes.ok) {
        const html = await fetchRes.text();
        scrapedText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 3500);
      }
    } catch {
      scrapedText = '';
    }

    const prompt = `Website URL: ${targetUrl}
Business Type: "${params.businessType || 'General Business'}"
${scrapedText ? `Real scraped page content:\n${scrapedText}` : 'The site could not be scraped; infer from the URL and business type only.'}

Perform a UX/CRO audit and design the perfect micro-survey for this exact website.
Output strictly valid JSON:
{
  "headline": "Persuasive visitor-facing survey headline tailored to this brand",
  "suggestedQuestions": [
    { "id": "q1", "type": "multiple-choice", "questionText": "Sharply targeted question", "options": ["Option A", "Option B", "Option C", "Option D"] },
    { "id": "q2", "type": "rating", "questionText": "Short rating question" },
    { "id": "q3", "type": "text", "questionText": "Open-ended follow-up question" }
  ],
  "behavioralInsights": [
    { "title": "Specific friction point on this site", "description": "Why visitors drop off here and what the survey will reveal" }
  ],
  "overallStrategy": "2-sentence conversion strategy for this exact website."
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens Core AI, a senior CRO auditor. Base insights on the real scraped content when provided; never fabricate site-specific facts.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<any>(raw);
    return {
      headline: parsed.headline || 'Wait! Before you go...',
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
      behavioralInsights: Array.isArray(parsed.behavioralInsights) ? parsed.behavioralInsights : [],
      overallStrategy: parsed.overallStrategy || 'Collect targeted exit feedback to uncover and fix conversion friction.'
    };
  }

  /**
   * Custom survey generator from a free-form merchant prompt — returns the exact
   * shape the dashboard wizard consumes.
   */
  async generateCustomSurveySpec(params: { prompt: string; domain?: string; businessName?: string; businessType?: string }): Promise<{
    surveyName: string;
    headline: string;
    description?: string;
    goal: string;
    bestTrigger: string;
    thankYouMessage?: string;
    questions: Array<{ id: string; type: string; questionText: string; options?: string[] }>;
    design?: { backgroundColor?: string; textColor?: string; accentColor?: string };
    estimatedCompletionTime: string;
    deliveryMethod: string;
    recommendedSurveyType: string;
  }> {
    const prompt = `Merchant's request: "${params.prompt}"
Business: "${params.businessName || params.domain || 'My Website'}" (${params.domain || 'mywebsite.com'})
Business type: "${params.businessType || 'e-commerce / SaaS'}"

Design the single best micro-survey for this exact situation.
Rules:
- 1-3 questions maximum, each one razor-targeted at the merchant's stated problem.
- Use "multiple-choice" (with 3-4 realistic options), "rating", or "text" question types.
- Choose the trigger and delivery method that actually fits the request.

Output strictly valid JSON:
{
  "surveyName": "Concise internal survey title",
  "headline": "Engaging visitor-facing headline",
  "description": "One-sentence visitor-facing explanation",
  "goal": "The measurable objective",
  "bestTrigger": "When and why to trigger (e.g. 'Exit intent when cursor leaves viewport')",
  "thankYouMessage": "Short warm thank-you",
  "questions": [
    { "id": "q1", "type": "multiple-choice", "questionText": "Question text", "options": ["A", "B", "C"] }
  ],
  "estimatedCompletionTime": "30 seconds",
  "deliveryMethod": "Exit Intent Popup | In-Page Popup | Embedded Widget | Slide In | Bottom Bar",
  "recommendedSurveyType": "Exit Intent Survey | Cart Abandonment Survey | Post Purchase Survey | Customer Satisfaction Survey | Pricing Feedback Survey | NPS Survey | Feature Feedback Survey"
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens, an elite CRO survey architect. Your surveys are famous for high completion rates because every question earns its place.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    return parseJsonStrict<any>(raw);
  }

  /**
   * Workspace analytics summary: AI narrates REAL metrics (never fabricates them).
   */
  async summarizeWorkspaceAnalytics(params: {
    businessName: string;
    websiteUrl: string;
    businessType?: string;
    goal?: string;
    metrics: {
      totalVisitors: number;
      totalResponses: number;
      activeSurveys: number;
      responseRate: string;
      triggersFired: number;
      rageClickEvents: number;
    };
    sentiment: { positive: number; neutral: number; negative: number; score: number };
    objections: Array<{ reason: string; count: number; percentage: number }>;
  }) {
    const prompt = `Business: "${params.businessName}" (${params.websiteUrl}) — type: "${params.businessType || 'General'}", goal: "${params.goal || 'Increase conversion'}".

REAL metrics (do not invent any others):
- Unique visitor sessions: ${params.metrics.totalVisitors}
- Survey responses: ${params.metrics.totalResponses}
- Active surveys: ${params.metrics.activeSurveys}
- Response rate: ${params.metrics.responseRate}
- Behavioral triggers fired: ${params.metrics.triggersFired}
- Rage-click events: ${params.metrics.rageClickEvents}
- Sentiment: ${params.sentiment.positive} pos / ${params.sentiment.neutral} neutral / ${params.sentiment.negative} neg (score ${params.sentiment.score}/100)
- Top objections: ${params.objections.length > 0 ? params.objections.map(o => `${o.reason} (${o.percentage}%)`).join(', ') : 'none yet'}

Narrate today's analytics snapshot for the merchant.
Output strictly valid JSON:
{
  "today": {
    "sessions": ${params.metrics.totalVisitors},
    "responses": ${params.metrics.totalResponses},
    "responseRate": "${params.metrics.responseRate}",
    "insight": "1-2 sentence sharp reading of the real numbers",
    "topObjection": "${params.objections[0]?.reason || 'No objections recorded yet'}",
    "action": "Single highest-leverage next step"
  }
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI Analytics Engine. You narrate real metrics precisely and never fabricate data.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<any>(raw);
    return {
      today: parsed.today || {},
      insightsSummary: parsed.today?.insight || `Live telemetry summary for ${params.businessName}.`
    };
  }

  /**
   * Generates a real AI insights bulletin from the merchant's actual stored survey responses.
   */
  async generateInsightsBulletin(params: {
    businessName: string;
    domain: string;
    responses: SurveyResponseRecord[];
    surveysCount: number;
  }): Promise<{ title: string; summary: string }> {
    const sampleText = params.responses
      .slice(0, 25)
      .map(r => `[Q: ${r.question_text}] Ans: ${r.answer} (Page: ${r.page_url || '/'})`)
      .join('\n');

    const prompt = params.responses.length > 0
      ? `Business: "${params.businessName}" (${params.domain}).
Here are ${params.responses.length} real customer survey responses collected by the live tracker:
${sampleText}

Write a short on-demand AI insights bulletin for the merchant.
Return JSON:
{
  "title": "Short bulletin headline (max 8 words)",
  "summary": "2-3 sentence synthesis of what real visitors are saying, the top friction point, and one concrete action to take."
}`
      : `Business: "${params.businessName}" (${params.domain}).
The live tracker is installed but 0 survey responses have been recorded so far across ${params.surveysCount} survey(s).

Write a short on-demand AI insights bulletin for the merchant.
Return JSON:
{
  "title": "Short bulletin headline (max 8 words)",
  "summary": "2-3 sentences confirming telemetry is listening, that no responses are recorded yet, and one concrete action to get the first responses (e.g. test the exit survey as a visitor)."
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI, an executive customer-intelligence analyst. Never invent visitor data; only use what is provided.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<{ title?: string; summary?: string }>(raw);
    return {
      title: parsed.title || 'AI Insights Bulletin',
      summary: parsed.summary || 'Bulletin generated from live telemetry.'
    };
  }

  /**
   * Generates a real executive digest email body from actual stored telemetry.
   */
  async generateExecutiveDigest(params: {
    businessName: string;
    domain: string;
    goal?: string;
    recipientEmail?: string;
    responses: SurveyResponseRecord[];
    eventsCount: number;
    surveysCount: number;
  }): Promise<{ subject: string; body: string }> {
    const sampleText = params.responses
      .slice(0, 30)
      .map(r => `[Q: ${r.question_text}] Ans: ${r.answer}`)
      .join('\n');

    const prompt = `Business: "${params.businessName}" (${params.domain}) — goal: "${params.goal || 'Increase conversion'}".
Real telemetry so far: ${params.eventsCount} tracked visitor event(s), ${params.responses.length} survey response(s), ${params.surveysCount} survey(s).
${sampleText ? `Customer responses:\n${sampleText}` : 'No customer responses collected yet.'}

Write the daily executive digest for the merchant.
Return JSON:
{
  "subject": "Email subject line",
  "body": "Plain-text digest body: key metrics, top customer pain points (only from the real responses above), sentiment read, and 1-3 prioritized recommendations. Do not fabricate numbers."
}`;

    const raw = await this.createCompletion(
      [
        { role: 'system', content: 'You are CustomerLens AI Analytics Engine writing a factual daily executive digest. Never fabricate metrics.' },
        { role: 'user', content: prompt }
      ],
      true
    );

    const parsed = parseJsonStrict<{ subject?: string; body?: string }>(raw);
    return {
      subject: parsed.subject || `Daily Executive Digest — ${params.businessName}`,
      body: parsed.body || 'Digest generated from live telemetry.'
    };
  }
}

export const openAIService = new OpenAIService();
