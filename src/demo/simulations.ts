/**
 * Isolated Simulation Engine (PREVIEW / DEMO MODE ONLY)
 * ---------------------------------------------------------------------
 * STRICT ARCHITECTURAL ISOLATION RULE:
 * This file is exclusively for the standalone offline UI sandbox preview.
 * Under NO circumstances should production routes (/api/events, /api/analytics,
 * /api/surveys/active, /api/survey-response, /api/notifications) import
 * or execute these mock generators.
 * ---------------------------------------------------------------------
 */

export function getSimulatedSurveyReply(option: string, newMessage: string, history: any[]): string {
  const text = newMessage.toLowerCase();
  
  if (text.includes('custom feature') || text.includes('feature')) {
    return "Yes, we prioritize user experience! Let me notify the workspace owner so we can review this request.";
  }
  
  const aiMessageCount = history ? history.filter(m => m.sender === 'ai').length : 0;

  if (text.includes('zigpoll') || text.includes('competitor') || text.includes('hotjar') || text.includes('vs')) {
    return "Zigpoll is great, but we specialize in Smart AI that dynamically uncovers the real reasons behind drop-offs. Would you like to see how it works on your site?";
  }

  if (text.includes('review') || text.includes('story') || text.includes('testimonial') || text.includes('trust')) {
    return "We're newly launched and love proving value directly. You can test it 100% risk-free on our free tier!";
  }

  if (aiMessageCount >= 2) {
    return "Use code LENS15 to get 15% off any plan, or get started free right away. How can I best help you get started?";
  }

  if (option?.includes('Trust') || option?.includes('trust') || option?.includes('security')) {
    return "CustomerLens is fully GDPR and CCPA compliant with secure, encrypted data processing.";
  }
  
  if (option?.includes('expensive') || option?.includes('price') || option?.includes('budget')) {
    return "We offer a flexible free plan and affordable tiers tailored to your volume. What target budget works best for you?";
  }
  
  return "Thanks for your feedback! What's the main goal you'd like to achieve on your site today?";
}

export function getSimulatedWizardResponse(businessType: string, goal: string) {
  const isShopify = businessType.toLowerCase().includes('shopify') || businessType.toLowerCase().includes('ecommerce');

  if (isShopify) {
    return {
      headline: 'Wait! Before you go...',
      questions: [
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
      ],
      colors: { background: '#fafaf9', text: '#1c1917', accent: '#16a34a' },
      recommendedPlacement: 'Exit Intent Popup'
    };
  }

  return {
    headline: 'Help us improve our website!',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        questionText: 'What is your primary goal today?',
        options: ['Increase Sales', 'Collect Feedback', 'Reduce Abandonment', 'Explore Features', 'Other'],
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
    ],
    colors: { background: '#09090b', text: '#ffffff', accent: '#3b82f6' },
    recommendedPlacement: 'Exit Intent Popup'
  };
}

export function getSimulatedExitAnalysis(responses: any[], businessName: string, goal: string) {
  return {
    topExitReasons: [
      { reason: 'Price / Budget Mismatch', percentage: 40 },
      { reason: 'Just Researching', percentage: 30 },
      { reason: 'Missing Integration', percentage: 20 },
      { reason: 'Other', percentage: 10 },
    ],
    mostCommonComplaints: [
      'Visitors wanted clearer breakdown of plan limits.',
      'A notable portion of mobile visitors asked for Apple Pay.',
      'Some users requested an integration guide.'
    ],
    sentiment: 'Generally Positive with minor pricing hesitation',
    sentimentScore: 65,
    aiSuggestions: [
      {
        issue: 'Pricing Tier Confusion (40%)',
        recommendation: 'Highlight ROI metrics and feature comparison table.',
        impact: 'High Impact',
      },
      {
        issue: 'Mobile Payment Friction (20%)',
        recommendation: 'Enable instant express checkout.',
        impact: 'Medium Impact',
      }
    ]
  };
}

export function getSimulatedRecommendations(businessType: string, goal: string) {
  return [
    {
      id: 'demo-rec-1',
      type: 'warning',
      title: 'High Price Friction Cited',
      description: 'Exit-intent feedback indicates 35% of visitors drop off during checkout due to surprise fees.',
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'demo-rec-2',
      type: 'info',
      title: 'Exit Intent Placement Performing Best',
      description: 'Exit-intent widgets achieved a 14.8% response rate across similar stores.',
      date: new Date().toLocaleDateString(),
    }
  ];
}

export function getSimulatedWebsiteAnalysis(websiteUrl: string, businessType: string) {
  const cleanUrl = websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
  return {
    headline: `Wait! Before you leave ${cleanUrl}...`,
    suggestedQuestions: [
      {
        id: 'w-q1',
        type: 'multiple-choice',
        questionText: `What is the main reason you are leaving ${cleanUrl} today?`,
        options: ['Shipping costs are too high', 'Just comparing prices', 'Need a discount code', 'Other']
      },
      {
        id: 'w-q2',
        type: 'text',
        questionText: 'What could we do to make this website better for you?',
        options: []
      }
    ],
    behavioralInsights: [
      {
        title: 'Cart Hesitation Signature',
        description: 'Visitors exhibit cursor dwell on checkout actions before navigating away.'
      }
    ],
    overallStrategy: 'Deploy a low-friction Exit Intent Popup targeting checkout drop-offs.'
  };
}

export function getSimulatedWorkspaceAnalytics(businessName: string, websiteUrl: string, businessType: string, goal: string) {
  return {
    today: {
      sessions: 0,
      triggers: 0,
      responseRate: '0.0%',
      revenue: '$0.00',
      insight: 'Preview Mode: Real analytics require active visitor telemetry from the embedded script.',
      reasons: [],
      complaints: [],
      sentiment: 'Awaiting Real Traffic',
      sentimentScore: null,
      suggestions: []
    }
  };
}

export function getSimulatedCustomSurveyResponse(promptText: string) {
  return {
    surveyName: 'Visitor Feedback Survey (Preview)',
    goal: 'Understand visitor drop-offs and improve conversion rate.',
    bestTrigger: 'Exit intent mouse movement or 30s dwell time.',
    recommendedSurveyType: 'Exit Intent Survey',
    questions: [
      {
        id: 'p-q1',
        type: 'multiple-choice',
        questionText: 'What was the main reason for ending your visit today?',
        options: ['Just browsing', 'Pricing unclear', 'Missing features', 'Other']
      },
      {
        id: 'p-q2',
        type: 'text',
        questionText: 'What is one thing we could do to earn your business?',
        options: []
      }
    ],
    logic: 'Route feedback to CustomerLens dashboard.',
    design: {
      backgroundColor: '#09090b',
      textColor: '#f4f4f5',
      accentColor: '#3b82f6',
      description: 'Clean dark slate template'
    },
    estimatedCompletionTime: '30 seconds',
    deliveryMethod: 'Exit Intent Popup'
  };
}
