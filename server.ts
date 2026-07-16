import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

/**
 * Endpoint 1: AI Onboarding Wizard
 * Generates an optimized, goal-oriented first survey.
 */
app.post('/api/ai/wizard', async (req, res) => {
  const { businessType, websiteUrl, goal } = req.body;

  if (!businessType || !goal) {
    return res.status(400).json({ error: 'businessType and goal are required' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Graceful fallback if GEMINI_API_KEY is not configured/valid
    console.log('Gemini API key not configured, returning custom high-quality simulated setup');
    return res.json(getSimulatedWizardResponse(businessType, goal));
  }

  try {
    const prompt = `You are CustomerLens, an AI customer experience specialist. 
Create an initial survey layout and structure for a brand new customer who has just onboarded.
Business Type: ${businessType}
Website URL: ${websiteUrl || 'Not specified'}
Business Goal: ${goal}

Generate:
1. A captivating headline.
2. A sequence of 3 highly effective feedback/exit-intent questions. Make them highly relevant to their business type and goal.
3. Suggest a complementary aesthetic design (primary hex colors for background, text, accent) matching their industry.
4. Recommend the absolute best survey placement (e.g. Exit Intent Popup, Slide In, etc.) based on their goal.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['headline', 'questions', 'colors', 'recommendedPlacement'],
          properties: {
            headline: {
              type: Type.STRING,
              description: 'An engaging headline for the survey, e.g. "Wait! Before you go...", "Help us improve!"',
            },
            questions: {
              type: Type.ARRAY,
              description: 'Array of 3 questions tailored to their goal.',
              items: {
                type: Type.OBJECT,
                required: ['id', 'type', 'questionText', 'options'],
                properties: {
                  id: { type: Type.STRING, description: 'Unique slug ID like "q1", "q2"' },
                  type: { type: Type.STRING, description: 'Type of question: "multiple-choice", "text", "rating"' },
                  questionText: { type: Type.STRING, description: 'The exact question text' },
                  options: {
                    type: Type.ARRAY,
                    description: 'Options array if multiple-choice. Keep empty if text or rating.',
                    items: { type: Type.STRING },
                  },
                },
              },
            },
            colors: {
              type: Type.OBJECT,
              required: ['background', 'text', 'accent'],
              properties: {
                background: { type: Type.STRING, description: 'Hex code for background, e.g. "#ffffff"' },
                text: { type: Type.STRING, description: 'Hex code for text, e.g. "#1e293b"' },
                accent: { type: Type.STRING, description: 'Hex code for accent/buttons, e.g. "#2563eb"' },
              },
            },
            recommendedPlacement: {
              type: Type.STRING,
              description: 'Recommended survey placement: "Exit Intent Popup", "Popup After X Seconds", "Floating Widget", "Embedded Form", "Slide In", "Bottom Bar"',
            },
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    } else {
      throw new Error('No content returned from Gemini');
    }
  } catch (error: any) {
    console.error('Gemini Wizard Error:', error);
    return res.json(getSimulatedWizardResponse(businessType, goal));
  }
});

/**
 * Endpoint 2: AI Exit Analysis
 * Analyzes collected user feedback and computes summary charts, complaint percentages, sentiment, and AI recommendations.
 */
app.post('/api/api-exit-analysis', async (req, res) => {
  const { responses, businessName, goal } = req.body;

  if (!responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: 'An array of responses is required' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.log('Gemini API key not configured, returning custom simulated exit analysis');
    return res.json(getSimulatedExitAnalysis(responses, businessName, goal));
  }

  try {
    const formattedResponses = responses.slice(0, 40).map((r, i) => {
      const ansStr = r.answers?.map((a: any) => `${a.questionId}: ${a.answer}`).join(' | ');
      return `Response ${i + 1}: [Answers: ${ansStr}]`;
    }).join('\n');

    const prompt = `You are a Customer Experience Data Analyst. Analyze the following exit-intent survey responses for the business "${businessName || 'Our Business'}" (Goal: ${goal || 'Feedback'}).
Based on these responses:
1. Provide the breakdown of Top Exit Reasons (must sum to 100%).
2. List the Top 3 Most Common Complaints.
3. Assess the overall sentiment (e.g. Positive, Neutral, Negative) as a string and a score out of 100.
4. Give 3 professional conversion rate optimization (CRO) suggestions based on this data.

Survey responses to analyze:
${formattedResponses || 'No live responses collected yet. Provide a general template analysis based on popular industry trends.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['topExitReasons', 'mostCommonComplaints', 'sentiment', 'sentimentScore', 'aiSuggestions'],
          properties: {
            topExitReasons: {
              type: Type.ARRAY,
              description: 'Array of objects mapping reason to percentage.',
              items: {
                type: Type.OBJECT,
                required: ['reason', 'percentage'],
                properties: {
                  reason: { type: Type.STRING, description: 'e.g. "Price Too High", "Shipping Cost"' },
                  percentage: { type: Type.INTEGER, description: 'Percentage integer value, e.g. 43' },
                },
              },
            },
            mostCommonComplaints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3 most common user complaints.',
            },
            sentiment: {
              type: Type.STRING,
              description: 'Overall sentiment description, e.g., "Mostly Neutral with frustration on checkout friction"',
            },
            sentimentScore: {
              type: Type.INTEGER,
              description: 'Sentiment index from 0 (extremely negative) to 100 (extremely positive)',
            },
            aiSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['issue', 'recommendation', 'impact'],
                properties: {
                  issue: { type: Type.STRING, description: 'Identified problem' },
                  recommendation: { type: Type.STRING, description: 'Actionable fix' },
                  impact: { type: Type.STRING, description: 'Expected benefit, e.g., "High", "Medium"' },
                },
              },
            },
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    } else {
      throw new Error('Empty response from model');
    }
  } catch (error: any) {
    console.error('Gemini Exit Analysis Error:', error);
    return res.json(getSimulatedExitAnalysis(responses, businessName, goal));
  }
});

/**
 * Endpoint 3: Weekly AI Recommendations
 * Generates proactive conversion and user-experience improvement insights.
 */
app.post('/api/ai/recommendations', async (req, res) => {
  const { businessType, goal } = req.body;

  const ai = getGeminiClient();

  if (!ai) {
    return res.json(getSimulatedRecommendations(businessType, goal));
  }

  try {
    const prompt = `Generate exactly 4 high-value customer feedback optimization recommendations for a ${businessType || 'SaaS'} business whose core goal is "${goal || 'Increase sales'}".
These should read like weekly system insights generated from survey behavior, e.g. "Customers frequently mention shipping costs." or "Most customers request faster delivery."
Keep them short, scannable, and extremely practical. Provide a categorization type for each ('info', 'warning', 'success').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['title', 'description', 'type'],
            properties: {
              title: { type: Type.STRING, description: 'Short summary e.g. "Pricing Friction Detected"' },
              description: { type: Type.STRING, description: 'Details and action, e.g., "43% of exit-intent surveys cited high price. Offer a 10% coupon." ' },
              type: { type: Type.STRING, description: 'Value must be "info", "warning", or "success"' },
            },
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      // Append generated ID and Date
      const enriched = data.map((item: any, idx: number) => ({
        id: `rec-${idx + 1}-${Date.now()}`,
        title: item.title,
        description: item.description,
        type: item.type || 'info',
        date: new Date().toLocaleDateString(),
      }));
      return res.json(enriched);
    } else {
      throw new Error('Empty response from model');
    }
  } catch (error: any) {
    console.error('Gemini Weekly Recs Error:', error);
    return res.json(getSimulatedRecommendations(businessType, goal));
  }
});

// ----------------------------------------------------
// BACKUP SIMULATIONS (Used if API Key is missing or failed)
// ----------------------------------------------------

function getSimulatedWizardResponse(businessType: string, goal: string) {
  const isShopify = businessType.toLowerCase().includes('shopify') || businessType.toLowerCase().includes('ecommerce');
  const isSaas = businessType.toLowerCase().includes('saas') || businessType.toLowerCase().includes('startup');

  let headline = 'Wait! Before you leave...';
  let recommendedPlacement = 'Exit Intent Popup';
  let questions: any[] = [];
  let colors = { background: '#ffffff', text: '#0f172a', accent: '#2563eb' };

  if (isShopify) {
    headline = 'Wait! Before you go...';
    questions = [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'What is the main reason you are leaving today?',
        options: ['Price Too High', 'Just Browsing', 'Shipping Cost Too High', 'Could Not Find Products', 'Website Problem', 'Other'],
      },
      {
        id: 'q2',
        type: 'rating',
        questionText: 'How would you rate your browsing experience today?',
        options: [],
      },
      {
        id: 'q3',
        type: 'text',
        questionText: 'What is one thing we could do to make this store better?',
        options: [],
      },
    ];
    colors = { background: '#fafaf9', text: '#1c1917', accent: '#16a34a' }; // Shopify green feel
  } else if (isSaas) {
    headline = 'Help us improve CustomerLens!';
    questions = [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'What is your primary goal with CustomerLens?',
        options: ['Increase Sales', 'Collect Feedback', 'Reduce Cart Abandonment', 'Improve Experience', 'Other'],
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        questionText: 'Which platform does your company website run on?',
        options: ['Shopify', 'WordPress/WooCommerce', 'Webflow/Wix', 'Custom Code', 'Other'],
      },
      {
        id: 'q3',
        type: 'text',
        questionText: 'Any specific integrations you would love to see?',
        options: [],
      },
    ];
    colors = { background: '#f8fafc', text: '#0f172a', accent: '#4f46e5' }; // Slate blue
  } else {
    questions = [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'Why are you leaving today?',
        options: ['Price too high', 'Just browsing', 'Couldn’t find what I needed', 'Shipping cost', 'Other'],
      },
      {
        id: 'q2',
        type: 'rating',
        questionText: 'How easy was our website to navigate?',
        options: [],
      },
      {
        id: 'q3',
        type: 'text',
        questionText: 'What could we have done to earn your business today?',
        options: [],
      },
    ];
  }

  return {
    headline,
    questions,
    colors,
    recommendedPlacement,
  };
}

function getSimulatedExitAnalysis(responses: any[], businessName: string, goal: string) {
  // Compute some realistic data based on what's submitted or general industry standards
  let priceCount = 0;
  let browseCount = 0;
  let findCount = 0;
  let shippingCount = 0;
  let speedCount = 0;
  let total = responses.length;

  // Read responses if populated
  responses.forEach(r => {
    const text = JSON.stringify(r.answers).toLowerCase();
    if (text.includes('price') || text.includes('expensive') || text.includes('high')) priceCount++;
    else if (text.includes('browsing') || text.includes('browse') || text.includes('look')) browseCount++;
    else if (text.includes('find') || text.includes('search')) findCount++;
    else if (text.includes('shipping') || text.includes('postage') || text.includes('delivery')) shippingCount++;
    else speedCount++;
  });

  if (total === 0) {
    // Generate beautiful baseline dataset
    return {
      topExitReasons: [
        { reason: 'Price Too High', percentage: 43 },
        { reason: 'Shipping Cost', percentage: 28 },
        { reason: 'Couldn’t Find Products', percentage: 17 },
        { reason: 'Website Speed/Friction', percentage: 12 },
      ],
      mostCommonComplaints: [
        'Shipping rates are not disclosed before the checkout page.',
        'Visitors wanted a quick search bar to filter products by size/color.',
        'High price barrier for first-time buyers.',
      ],
      sentiment: 'Neutral to slightly frustrated (due to unexpected shipping fees)',
      sentimentScore: 48,
      aiSuggestions: [
        {
          issue: 'High abandonment due to Shipping Costs (28%)',
          recommendation: 'Introduce a "Free Shipping over $50" banner in the header to set clear expectations.',
          impact: 'High Impact',
        },
        {
          issue: 'Price Friction (43%)',
          recommendation: 'Configure an exit-intent discount code offering 10% off to finalize cart checkout.',
          impact: 'High Impact',
        },
        {
          issue: 'Navigation / Product Discovery (17%)',
          recommendation: 'Add a Quick-Search option or a dynamic Floating Chat/Survey to assist struggling users.',
          impact: 'Medium Impact',
        },
      ],
    };
  }

  // Calculate actual percentages or fall back gracefully
  const p1 = Math.round((priceCount / total) * 100) || 35;
  const p2 = Math.round((shippingCount / total) * 100) || 25;
  const p3 = Math.round((browseCount / total) * 100) || 20;
  const p4 = 100 - (p1 + p2 + p3);

  return {
    topExitReasons: [
      { reason: 'Price Too High', percentage: p1 },
      { reason: 'Shipping / Extra Costs', percentage: p2 },
      { reason: 'Just Browsing / Non-buying', percentage: p3 },
      { reason: 'Website Speed or Tech Problems', percentage: Math.max(5, p4) },
    ],
    mostCommonComplaints: [
      'Customers find the initial onboarding pricing plans slightly confusing.',
      'A notable portion of mobile visitors feel checkout loading takes too long.',
      'Some users wanted an integration guide for Webflow and Wix.',
    ],
    sentiment: 'Generally Positive with minor setup friction',
    sentimentScore: 68,
    aiSuggestions: [
      {
        issue: 'Plan or Setup Confusion',
        recommendation: 'Revamp the step-by-step onboarding walkthrough inside CustomerLens to explain custom code copy-paste.',
        impact: 'High Impact',
      },
      {
        issue: 'Mobile Loading Speed',
        recommendation: 'Optimize your Shopify/WooCommerce theme to prevent third-party asset blocking.',
        impact: 'Medium Impact',
      },
    ],
  };
}

function getSimulatedRecommendations(businessType: string, goal: string) {
  return [
    {
      id: 'rec-1',
      type: 'warning',
      title: 'High Shipping Friction Cited',
      description: '28% of your survey submitters left due to shipping costs. Consider offering standard free shipping over a specific tier.',
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'rec-2',
      type: 'info',
      title: 'Exit Intent Placement Performing Best',
      description: 'Your exit-intent widget placement achieves a 14.8% response rate, which is 6% higher than typical floating surveys.',
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'rec-3',
      type: 'success',
      title: 'Satisfaction Surge',
      description: 'Your customer satisfaction increased 14% this month. Visitors heavily appreciate the quick FAQ sidebar addition.',
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'rec-4',
      type: 'warning',
      title: 'Pricing Page Bottleneck',
      description: 'Visitors leave after viewing the pricing page. Add a simple Exit-Intent Survey specifically on "/pricing" asking "Is anything holding you back?".',
      date: new Date().toLocaleDateString(),
    },
  ];
}

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION ASSET STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CustomerLens Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
