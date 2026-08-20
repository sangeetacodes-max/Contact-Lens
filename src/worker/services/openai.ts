import { Env, ResponseSignal, MultiResponsePattern } from '../types';
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

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        true
      );
      const parsed = JSON.parse(rawJson);
      const decisionVal = parsed.decision === 'NOW' ? 'SHOW' : parsed.decision;
      return {
        decision: ['SHOW', 'WAIT', 'DONT_SHOW'].includes(decisionVal) ? decisionVal : 'SHOW',
        reason: parsed.reason || 'Visitor behavior indicates optimal moment for contextual survey.',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9
      };
    } catch {
      // Rule-based fallback if AI is offline
      const isNow = ['exit_intent', 'hesitation', 'rage_clicks', 'cart_action'].includes(event.eventType) ||
        event.exitIntent === true ||
        event.hesitation === true ||
        (event.repeatedClicks && event.repeatedClicks >= 2) ||
        (event.timeOnPage && event.timeOnPage >= 35) ||
        ((event.scrollDepth || event.payload?.scrollPercent || 0) >= 60);
      return {
        decision: isNow ? 'SHOW' : 'WAIT',
        reason: isNow ? 'The visitor shows sustained engagement and decision hesitation.' : 'Monitoring visitor interaction.',
        confidence: 0.85
      };
    }
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

    try {
      const rawJson = await this.createCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        true
      );
      const parsed = JSON.parse(rawJson);
      const decisionVal = parsed.decision === 'NOW' ? 'SHOW' : parsed.decision;
      return {
        decision: ['SHOW', 'WAIT', 'DONT_SHOW'].includes(decisionVal) ? decisionVal : 'SHOW',
        reason: parsed.reason || 'The visitor shows sustained engagement and decision hesitation.'
      };
    } catch {
      const isShow = (behavior?.timeOnPage >= 30) || behavior?.hesitation || behavior?.exitIntent || (behavior?.repeatedClicks >= 2) || (behavior?.scrollDepth >= 60);
      return {
        decision: isShow ? 'SHOW' : 'WAIT',
        reason: isShow ? 'The visitor shows sustained engagement and decision hesitation.' : 'Monitoring visitor browsing activity.'
      };
    }
  }

  /**
   * Evaluate an individual visitor response in context and extract structured business signal
   * "Evaluate this individual visitor response in the context of the website and identify whether it contains a meaningful signal that could affect customer experience, conversion, retention, product decisions, or business growth. Do not assume every response is important. Explain why a signal matters and assign an importance level."
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
      const parsed = JSON.parse(rawJson);
      return {
        importance: ['high', 'medium', 'low'].includes(parsed.importance) ? parsed.importance : 'medium',
        category: parsed.category || 'general_feedback',
        business_impact: parsed.business_impact || 'low',
        signal: parsed.signal || params.answer.substring(0, 80),
        reason: parsed.reason || 'Individual response evaluated.',
        needs_attention: Boolean(parsed.needs_attention),
        sentiment: ['negative', 'positive', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
        growth_opportunity: parsed.growth_opportunity || '',
        analyzedAt: new Date().toISOString()
      };
    } catch {
      const lower = params.answer.toLowerCase();
      const isPricing = lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('afford') || lower.includes('tier');
      const isCheckout = lower.includes('pay') || lower.includes('cart') || lower.includes('card') || lower.includes('checkout') || lower.includes('error');
      const isFeature = lower.includes('need') || lower.includes('want') || lower.includes('support') || lower.includes('feature') || lower.includes('integrate');
      
      const importance: 'high' | 'medium' | 'low' = (isPricing || isCheckout) ? 'high' : (isFeature ? 'medium' : 'low');
      const category = isPricing ? 'pricing' : (isCheckout ? 'checkout_friction' : (isFeature ? 'feature_request' : 'general_feedback'));
      
      return {
        importance,
        category,
        business_impact: (isPricing || isCheckout) ? 'conversion' : (isFeature ? 'product_growth' : 'low'),
        signal: isPricing ? 'Customer considers pricing unclear or high' : (isCheckout ? 'Checkout obstacle reported' : 'General visitor feedback'),
        reason: 'Identified key commercial or operational keyword in feedback.',
        needs_attention: importance === 'high',
        sentiment: isPricing || isCheckout ? 'negative' : 'neutral',
        growth_opportunity: isPricing ? 'Review pricing tier clarity and highlight free trial/ROI' : 'Investigate visitor feedback',
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
  "title": "🔴 Potential conversion problem detected" (or appropriate emoji title),
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
    } catch {
      // Heuristic fallback: Group by category
      const categoryCounts: Record<string, number> = {};
      substantiveSignals.forEach(s => {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      });

      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count >= 2) {
          if (cat === 'pricing') {
            return {
              patternDetected: true,
              severity: 'critical',
              title: '🔴 Potential conversion problem detected',
              summary: 'Multiple visitors have independently mentioned pricing confusion. Consider reviewing how pricing and plan differences are presented.',
              category: 'pricing',
              affectedSignalsCount: count,
              rootCause: 'Visitors report ambiguity around pricing tiers and plan inclusions.',
              recommendation: 'Add a clear plan comparison table and emphasize value proposition on the pricing page.',
              triggerNotification: true
            };
          } else if (cat === 'checkout_friction') {
            return {
              patternDetected: true,
              severity: 'critical',
              title: '⚠️ Checkout friction identified',
              summary: 'Multiple visitors encountered difficulties during checkout or payment.',
              category: 'checkout_friction',
              affectedSignalsCount: count,
              rootCause: 'Payment or form validation obstacles during checkout.',
              recommendation: 'Verify payment gateway availability and streamline required checkout fields.',
              triggerNotification: true
            };
          } else if (cat === 'feature_request') {
            return {
              patternDetected: true,
              severity: 'opportunity',
              title: '💡 High-demand feature opportunity',
              summary: 'Multiple visitors have requested similar product features.',
              category: 'feature_request',
              affectedSignalsCount: count,
              rootCause: 'Product capability gap requested by active visitors.',
              recommendation: 'Evaluate prioritized feature addition to accelerate product adoption.',
              triggerNotification: true
            };
          }
        }
      }
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

    try {
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
    } catch {
      return {
        reply: 'Which part of the pricing or features felt unclear?',
        continue: true
      };
    }
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

    try {
      const response = await this.createCompletion(conversation, false);
      return response.replace(/^["']|["']$/g, '').trim();
    } catch {
      return 'Thank you! Is there any other detail we can share with the team?';
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
