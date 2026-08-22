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
  private getApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.includes('****') || !key.trim()) {
      throw new Error('OPENAI_KEY_NOT_CONFIGURED');
    }
    return key.trim();
  }

  /**
   * Internal Completion (Strictly OpenAI Only)
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

export const openAIService = new OpenAIService();
