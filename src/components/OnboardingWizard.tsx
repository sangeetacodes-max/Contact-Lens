import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Globe, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Loader2, 
  Palette, 
  Layers, 
  HelpCircle,
  Search,
  Pencil,
  Files
} from 'lucide-react';
import { BusinessType, Survey, Workspace } from '../types';

interface OnboardingWizardProps {
  onComplete: (workspace: Workspace, initialSurvey: Survey) => void;
  userEmail: string;
  onBack?: () => void;
}

const BUSINESS_TYPES: { id: BusinessType; name: string; description: string; icon: any }[] = [
  { id: 'Shopify', name: 'Shopify Store', description: 'One-click automated app integration', icon: Building2 },
  { id: 'WooCommerce', name: 'WooCommerce Store', description: 'Automated WordPress plugin connection', icon: Building2 },
  { id: 'SaaS', name: 'SaaS / Web App', description: 'API, subscription metrics & embed keys', icon: Layers },
  { id: 'Startup', name: 'Startup', description: 'Rapid feedback and customer growth', icon: Sparkles },
  { id: 'Agency', name: 'Agency', description: 'Multi-client feedback & dashboards', icon: HelpCircle },
  { id: 'Ecommerce', name: 'Other Ecommerce', description: 'Custom cart & checkout integrations', icon: Building2 },
  { id: 'Other', name: 'Other Website', description: 'Generic JavaScript tag connection', icon: Globe },
];

const GOALS = [
  { id: 'Increase Sales', text: 'Increase Sales', desc: 'Identify checkout friction and offer discounts' },
  { id: 'Collect Feedback', text: 'Collect Feedback', desc: 'Understand general visitor complaints' },
  { id: 'Reduce Cart Abandonment', text: 'Reduce Cart Abandonment', desc: 'Find why shoppers leave before buying' },
  { id: 'Improve Customer Experience', text: 'Improve Customer Experience', desc: 'Gather usability suggestions' },
  { id: 'Increase Repeat Customers', text: 'Increase Repeat Customers', desc: 'Drive loyalty and post-purchase feedback' },
];

export interface OnboardingTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  recommendedDelivery: string;
  questions: { questionText: string; type: string; options: string[] }[];
  goalText?: string;
  bestTrigger?: string;
  logicText?: string;
  designText?: string;
  estTime?: string;
}

const ALL_CATEGORIES = [
  'Post Purchase',
  'Attribution & Discovery',
  'Customer Satisfaction',
  'Software (SaaS)',
  'Exit Intent & Abandoned Cart',
  'Feedback & Optimization',
  'Engagement'
];

const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    id: 'pricing-feedback',
    title: 'Pricing Feedback Survey',
    description: 'Appears after multiple pricing page visits.',
    category: 'Feedback & Optimization',
    recommendedDelivery: 'Pricing Page Exit Intent',
    goalText: 'Identify pricing page hesitation and discount sensitivity',
    bestTrigger: 'Visitor spends > 45s on pricing page or triggers exit-intent on "/pricing"',
    logicText: 'If response is "Price is too high", prompt with LENS15 discount coupon code; else direct to support',
    designText: 'Cosmic Slate minimalist layout, Slate Blue (#6366f1) accents',
    estTime: '45 seconds',
    questions: [
      {
        questionText: 'Is there anything holding you back from choosing a plan today?',
        type: 'multiple-choice',
        options: ['Price is too high', 'Unclear which plan is right for me', 'Missing key features', 'Just browsing / comparing options']
      },
      {
        questionText: 'What feature are you hoping to find in CustomerLens?',
        type: 'text',
        options: []
      }
    ]
  },
  {
    id: 'exit-intent',
    title: 'Exit Intent Survey',
    description: 'Appears when visitor moves mouse to close the tab.',
    category: 'Exit Intent & Abandoned Cart',
    recommendedDelivery: 'Exit Intent',
    goalText: 'Capture abandoning website visitors before they leave the store',
    bestTrigger: 'Cursor moves rapidly toward top viewport boundary',
    logicText: 'If "Had questions", open live agent chat assistant; else save response and display simple thank you',
    designText: 'Aura White light-mode theme with high-contrast Indigo (#4f46e5) action links',
    estTime: '30 seconds',
    questions: [
      {
        questionText: 'Wait! Did you find what you were looking for today?',
        type: 'multiple-choice',
        options: ['Yes, absolutely', 'Found it but had a question', 'No, couldn\'t find it', 'Just browsing']
      }
    ]
  },
  {
    id: 'cart-abandonment',
    title: 'Cart Abandonment Survey',
    description: 'Appears after abandoning the cart.',
    category: 'Exit Intent & Abandoned Cart',
    recommendedDelivery: 'Checkout Slide-in',
    goalText: 'Understand cart friction and recover abandoned transactions',
    bestTrigger: 'Visitor has items in cart and remains inactive on checkout URL for > 60s',
    logicText: 'If "Shipping is too expensive", trigger free-shipping coupon code; else prompt for contact details',
    designText: 'Emerald Green theme, accents in Deep Forest green (#10b981)',
    estTime: '35 seconds',
    questions: [
      {
        questionText: 'Is there anything preventing you from completing your order today?',
        type: 'multiple-choice',
        options: ['Shipping is too expensive', 'Delivery is too slow', 'Payment method failed', 'Need to think about it']
      }
    ]
  },
  {
    id: 'post-purchase',
    title: 'Post Purchase Survey',
    description: 'Appears after checkout.',
    category: 'Post Purchase',
    recommendedDelivery: 'Inline Embed',
    goalText: 'Map marketing channels driving sales and verify usability',
    bestTrigger: 'URL matches order confirmation or thank-you page',
    logicText: 'Display social sharing triggers on promoter choices; log other options directly to marketing reports',
    designText: 'Royal Violet theme, #8b5cf6 primary buttons, borderless cards',
    estTime: '40 seconds',
    questions: [
      {
        questionText: 'How did you first hear about us?',
        type: 'multiple-choice',
        options: ['Social Media', 'Google Search', 'Friend / Word of Mouth', 'YouTube Ad']
      },
      {
        questionText: 'How would you rate your checkout experience today?',
        type: 'rating',
        options: []
      }
    ]
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction Survey',
    description: 'Appears after support interaction.',
    category: 'Customer Satisfaction',
    recommendedDelivery: 'Support Chat Close',
    goalText: 'Audit support desk quality and resolution success rates',
    bestTrigger: 'Support conversation closed or marked resolved',
    logicText: 'If choice is "Dissatisfied", automatically open escalation ticket with management; else log satisfaction metrics',
    designText: 'Professional Teal theme with #0d9488 accent color',
    estTime: '25 seconds',
    questions: [
      {
        questionText: 'How satisfied are you with our support today?',
        type: 'multiple-choice',
        options: ['Delighted', 'Satisfied', 'Neutral', 'Dissatisfied']
      }
    ]
  },
  {
    id: 'trial-user',
    title: 'Trial User Survey',
    description: 'Appears after using the product five times.',
    category: 'Engagement',
    recommendedDelivery: 'In-app Toast',
    goalText: 'Track trial user adoption friction and identify premium conversion cues',
    bestTrigger: 'User starts their 5th active app session',
    logicText: 'If "Difficult to configure", notify client success team for a concierge onboarding call',
    designText: 'Warm Gold & Slate Theme, #eab308 details',
    estTime: '50 seconds',
    questions: [
      {
        questionText: 'How has your trial experience been so far?',
        type: 'multiple-choice',
        options: ['Loving it, buying soon', 'Good, still testing features', 'A bit hard to configure', 'Not suitable for our team']
      }
    ]
  },
  {
    id: 'feature-feedback',
    title: 'Feature Feedback Survey',
    description: 'Appears after users try a new feature.',
    category: 'Feedback & Optimization',
    recommendedDelivery: 'Triggered Slide-in',
    goalText: 'Log usability and feedback on newly launched product modules',
    bestTrigger: 'First success action in new feature flow',
    logicText: 'If score is <= 3, show text input for constructive feedback; else show review/share prompt',
    designText: 'Sunset Orange theme, #f57c00 button states',
    estTime: '30 seconds',
    questions: [
      {
        questionText: 'How helpful was our new Analytics dashboard today?',
        type: 'multiple-choice',
        options: ['Extremely useful', 'Somewhat useful', 'Neutral', 'Confusing to navigate']
      },
      {
        questionText: 'What is one thing we should change about this screen?',
        type: 'text',
        options: []
      }
    ]
  },
  {
    id: 'cancellation',
    title: 'Cancellation Survey',
    description: 'Appears when subscription is canceled.',
    category: 'Software (SaaS)',
    recommendedDelivery: 'Billing Modal Overlap',
    goalText: 'Understand subscription churn and propose targeted downgrade saves',
    bestTrigger: 'Visitor clicks "Cancel Subscription" button',
    logicText: 'If "Too expensive", redirect to special 50% discount page; if "Temporary pause", enable 1-click pause billing state',
    designText: 'Crimson Slate Warning theme, High-contrast Red (#ef4444) buttons',
    estTime: '45 seconds',
    questions: [
      {
        questionText: 'We are sad to see you go. What is the primary reason for canceling?',
        type: 'multiple-choice',
        options: ['Too expensive', 'Missing key integrations', 'Difficult to set up', 'Temporary pause / project ended', 'Found a better alternative']
      }
    ]
  },
  {
    id: 'nps',
    title: 'NPS Survey',
    description: 'Appears after 30 days of product usage.',
    category: 'Engagement',
    recommendedDelivery: 'Modal Center Pop-up',
    goalText: 'Measure company Net Promoter Score and identify advocates',
    bestTrigger: '30 days passed since signup registration timestamp',
    logicText: 'If score is 9-10, prompt with Trustpilot/Capterra review link; if score is <= 6, alert account manager',
    designText: 'Minimal Dark Charcoal theme with pure black (#0f172a) branding accents',
    estTime: '20 seconds',
    questions: [
      {
        questionText: 'How likely are you to recommend CustomerLens to a friend or colleague?',
        type: 'multiple-choice',
        options: ['10 - Extremely Likely', '9', '8', '7', '6 or lower']
      }
    ]
  },
  {
    id: 'bug-report',
    title: 'Bug Report Survey',
    description: 'Appears after detecting repeated errors.',
    category: 'Feedback & Optimization',
    recommendedDelivery: 'Error Event Slide-out',
    goalText: 'Intercept frustrated visitors facing javascript/app faults',
    bestTrigger: 'Console error detected or API failures occur in sequence',
    logicText: 'Capture full session diagnostic variables and dispatch high-priority Slack notification',
    designText: 'Cobalt Terminal professional theme with #3b82f6 details',
    estTime: '40 seconds',
    questions: [
      {
        questionText: 'We apologize! Something went wrong. What were you trying to do?',
        type: 'multiple-choice',
        options: ['Loading reports', 'Setting up a tracking link', 'Updating account settings', 'Integrating with Shopify', 'Other']
      },
      {
        questionText: 'Can our technical support team reach out to you via email to resolve this?',
        type: 'multiple-choice',
        options: ['Yes, please contact me', 'No, I am good']
      }
    ]
  }
];

const OnboardingToggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-14 h-7 rounded-full p-1 transition-all flex items-center relative cursor-pointer outline-none focus:outline-none select-none ${
        checked ? 'bg-blue-600 justify-end' : 'bg-black justify-start'
      }`}
    >
      {checked ? (
        <>
          <span className="text-[9px] font-black text-white absolute left-2 select-none pointer-events-none">ON</span>
          <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200" />
        </>
      ) : (
        <>
          <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200" />
          <span className="text-[9px] font-black text-white absolute right-2 select-none pointer-events-none">OFF</span>
        </>
      )}
    </button>
  );
};

export default function OnboardingWizard({ onComplete, userEmail, onBack }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [businessType, setBusinessType] = useState<BusinessType>('Shopify');
  const [businessName, setBusinessName] = useState('Acme Store');
  const [websiteUrl, setWebsiteUrl] = useState('www.acmestore.com');
  const [industry, setIndustry] = useState('E-commerce');
  const [goal, setGoal] = useState('Increase Sales');
  
  // Custom workspace options
  const [allowEdits, setAllowEdits] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [allowResubmissions, setAllowResubmissions] = useState(false);
  const [notifyOnResponse, setNotifyOnResponse] = useState(true);

  // New Step 3 Template Selector & Behavior sub-states
  const [workspaceSubStep, setWorkspaceSubStep] = useState<'questions' | 'behavior'>('questions');
  const [creationMode, setCreationMode] = useState<'template' | 'scratch'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('pricing-feedback');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES);

  // Build from prompt sub-state
  const [promptInput, setPromptInput] = useState('My visitors leave after viewing pricing.');
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
  const [promptLoadingPhrase, setPromptLoadingPhrase] = useState('');
  const [isPromptInputOpen, setIsPromptInputOpen] = useState(false);
  const [customPromptTemplate, setCustomPromptTemplate] = useState<OnboardingTemplate | null>(null);

  // Active question index inside the preview box
  const [previewActiveQuestionIndex, setPreviewActiveQuestionIndex] = useState(0);
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState('');
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const [isAILoading, setIsAILoading] = useState(false);
  const [aiLoadingPhrase, setAiLoadingPhrase] = useState('');

  const getMatchedTemplate = (text: string): OnboardingTemplate => {
    const clean = text.toLowerCase();
    if (clean.includes('pricing') || clean.includes('price')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'pricing-feedback') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('exit') || clean.includes('leave') || clean.includes('close') || clean.includes('tab')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'exit-intent') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('cart') || clean.includes('abandon') || clean.includes('checkout') || clean.includes('dropoff') || clean.includes('shop')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'cart-abandonment') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('purchase') || clean.includes('buy') || clean.includes('thank')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'post-purchase') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('satisfaction') || clean.includes('support') || clean.includes('csat')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'customer-satisfaction') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('trial') || clean.includes('5 times') || clean.includes('times')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'trial-user') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('feature') || clean.includes('new') || clean.includes('try')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'feature-feedback') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('cancel') || clean.includes('billing') || clean.includes('unsubscribe') || clean.includes('quit')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'cancellation') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('nps') || clean.includes('loyalty') || clean.includes('recommend') || clean.includes('score')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'nps') || ONBOARDING_TEMPLATES[0];
    }
    if (clean.includes('bug') || clean.includes('error') || clean.includes('crash') || clean.includes('broken')) {
      return ONBOARDING_TEMPLATES.find(t => t.id === 'bug-report') || ONBOARDING_TEMPLATES[0];
    }
    return ONBOARDING_TEMPLATES.find(t => t.id === 'pricing-feedback') || ONBOARDING_TEMPLATES[0];
  };

  const triggerMockAIGeneration = (templateId: string) => {
    setIsAILoading(true);
    setPreviewActiveQuestionIndex(0);
    setPreviewSelectedChoice('');
    setPreviewSubmitted(false);

    const phrases = [
      'Scanning visitor behavior context...',
      'Matching goal against CRO benchmarks...',
      'Formulating adaptive question schema...',
      'Assembling behavioral rules and optimal triggers...'
    ];

    let index = 0;
    setAiLoadingPhrase(phrases[0]);
    const interval = setInterval(() => {
      index++;
      if (index < phrases.length) {
        setAiLoadingPhrase(phrases[index]);
      }
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setSelectedTemplateId(templateId);
      setIsAILoading(false);
    }, 1200);
  };

  const isWorkspaceStep = step === 3 && (businessType === 'Other' || businessType === 'SaaS');

  // AI Generation state
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [generatedSurvey, setGeneratedSurvey] = useState<any | null>(null);

  const handleStep1 = () => {
    if (!businessName) {
      alert('Please enter a business name');
      return;
    }
    setStep(3);
  };

  const handleStep2 = () => {
    setStep(3);
  };

  const handleStep3 = async () => {
    setStep(4);
    await triggerAIGeneration();
  };

  const handleStep4 = () => {
    setStep(5);
  };

  const triggerAIGeneration = async () => {
    setLoading(true);
    const phrases = [
      'Scanning business profile...',
      'Mapping goal keywords to CRO playbooks...',
      'Designing custom high-contrast visual theme...',
      'Formulating exit-intent conversion questions...',
      'Assembling no-code JavaScript bundle...'
    ];

    let phraseIndex = 0;
    setLoadingPhrase(phrases[0]);
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setLoadingPhrase(phrases[phraseIndex]);
    }, 1200);

    try {
      const response = await fetch('/api/ai/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          websiteUrl,
          goal,
        }),
      });
      const data = await response.json();
      setGeneratedSurvey(data);
    } catch (err) {
      console.error('Failed to generate survey via AI, using default layout:', err);
    } finally {
      clearInterval(phraseInterval);
      setLoading(false);
    }
  };

  const handleLaunch = () => {
    let surveyToUse;

    if (businessType === 'Other' || businessType === 'SaaS') {
      if (creationMode === 'scratch') {
        surveyToUse = {
          headline: 'Custom CustomerLens Survey',
          recommendedPlacement: 'Slide In',
          colors: { background: '#ffffff', text: '#0f172a', accent: '#2563eb' },
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice',
              questionText: 'What is your primary goal today?',
              options: ['Improve conversion', 'Learn more about users', 'Report a bug', 'Other']
            }
          ]
        };
      } else {
        const activeTemp = selectedTemplateId === 'custom-prompt-temp' 
          ? customPromptTemplate 
          : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId);
        
        surveyToUse = {
          headline: activeTemp?.title || 'Wait! Before you leave...',
          recommendedPlacement: activeTemp?.recommendedDelivery || 'Exit Intent Popup',
          colors: { background: '#ffffff', text: '#0f172a', accent: '#2563eb' },
          questions: activeTemp?.questions.map((q, i) => ({
            id: `q-${i + 1}`,
            type: q.type,
            questionText: q.questionText,
            options: q.options
          })) || []
        };
      }
    } else {
      surveyToUse = generatedSurvey || {
        headline: 'Wait! Before you leave...',
        recommendedPlacement: 'Exit Intent Popup',
        colors: { background: '#ffffff', text: '#0f172a', accent: '#2563eb' },
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            questionText: 'What was the primary reason for leaving today?',
            options: ['Price too high', 'Just browsing', 'Shipping cost', 'Other']
          }
        ]
      };
    }

    const workspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: businessName,
      businessType,
      url: websiteUrl,
      industry,
      goal,
      customDomainStatus: 'Pending',
      whiteLabel: {
        removeBranding: false,
      },
    };

    const initialSurvey: Survey = {
      id: `survey-${Date.now()}`,
      title: 'First Onboarding Survey',
      displayOption: surveyToUse.recommendedPlacement || 'Exit Intent Popup',
      headline: surveyToUse.headline,
      questions: surveyToUse.questions,
      colors: surveyToUse.colors,
      brandingEnabled: true,
      active: true,
      createdAt: new Date().toISOString(),
      allowEdits,
      autoAdvance,
      allowResubmissions,
      notifyOnResponse,
    };

    onComplete(workspace, initialSurvey);
  };

  return (
    <div id="onboarding_container" className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className={`${isWorkspaceStep ? 'max-w-5xl' : 'max-w-4xl'} mx-auto w-full flex items-center justify-between mb-8 transition-all duration-300`}>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
            CL
          </div>
          <span className="font-sans font-bold text-xl text-slate-900 tracking-tight">CustomerLens</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Signed in as:</span>
          <span className="bg-slate-200 px-2.5 py-1 rounded-full text-slate-700 font-medium">{userEmail}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className={`${isWorkspaceStep ? 'max-w-5xl' : 'max-w-4xl'} mx-auto w-full flex-grow flex items-center justify-center transition-all duration-300`}>
        <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 ${isWorkspaceStep ? 'p-6 sm:p-8' : 'p-8 sm:p-10'} w-full relative overflow-hidden transition-all duration-300`}>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
              <span className="text-[11px] font-semibold text-slate-700">Platform</span>
            </div>
            <div className="h-px bg-slate-200 w-6 flex-grow" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
              <span className="text-[11px] font-semibold text-slate-700">Connect Link</span>
            </div>
            <div className="h-px bg-slate-200 w-6 flex-grow" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
              <span className="text-[11px] font-semibold text-slate-700">Goal</span>
            </div>
            <div className="h-px bg-slate-200 w-6 flex-grow" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>4</span>
              <span className="text-[11px] font-semibold text-slate-700">AI Surveys</span>
            </div>
            <div className="h-px bg-slate-200 w-6 flex-grow" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 5 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>5</span>
              <span className="text-[11px] font-semibold text-slate-700">Launch Now</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Business Details & Platform Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-2xl text-left mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Let's set up your CustomerLens experience
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Enter your store details and choose your primary platform to initialize behavioral intelligence triggers.
                  </p>
                </div>

                {/* Form Fields: Company Name, Website, Industry */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 text-left">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input
                        id="input_business_name_step1"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Acme Store"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Website Address</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input
                        id="input_website_url_step1"
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="www.acmestore.com"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Industry</label>
                    <div className="relative">
                      <Target className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input
                        id="input_industry_step1"
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="E-commerce"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-sm outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-left mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Primary Platform / Integration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                  {BUSINESS_TYPES.map((type) => {
                    const IconComp = type.icon;
                    return (
                      <button
                        key={type.id}
                        id={`btn_business_type_${type.id}`}
                        onClick={() => setBusinessType(type.id)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 hover:bg-slate-50 ${
                          businessType === type.id 
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10' 
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${businessType === type.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <IconComp size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 text-sm">{type.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  {onBack ? (
                    <button
                      id="btn_onboarding_back_1"
                      onClick={onBack}
                      className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-4 py-2"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    id="btn_onboarding_next_1"
                    onClick={handleStep1}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Website Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Link your website
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Enter the domain and brand name of the website you want to connect to CustomerLens. We'll optimize your exit-intent triggers for this specific address.
                  </p>
                </div>

                <div className="max-w-xl space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Business / Brand Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input
                        id="input_business_name"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Acme Retail"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Website Address URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                      <input
                        id="input_website_url"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
                  <button
                    id="btn_onboarding_back_2"
                    onClick={() => setStep(1)}
                    className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    id="btn_onboarding_next_2"
                    onClick={handleStep2}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Select Conversion Goal */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {isWorkspaceStep ? (
                  <div>
                    {/* Top simulated builder bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                      <button
                        type="button"
                        onClick={handleStep3}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        Next Step <ArrowRight size={13} className="stroke-[2.5]" />
                      </button>
                      
                      <div className="bg-white border border-slate-200 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xs">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span className="text-[11px] font-black text-slate-800 font-mono">1 / 5</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button type="button" className="h-7 w-7 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold shadow-xs transition-all">
                          ?
                        </button>
                        <div className="h-7 w-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm select-none">
                          {userEmail ? userEmail.charAt(0).toUpperCase() : 'S'}
                        </div>
                      </div>
                    </div>

                    {/* Sub-breadcrumbs */}
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 mb-4 tracking-wide uppercase font-mono">
                      <span className="text-slate-600">{businessName || 'cupcake'}</span>
                      <span className="text-slate-300 font-sans font-normal text-xs">&gt;</span>
                      <span className="text-slate-600">Surveys</span>
                      <span className="text-slate-300 font-sans font-normal text-xs">&gt;</span>
                      <span className="text-slate-800">{workspaceSubStep === 'questions' ? 'Create Survey' : 'Configure Behavior'}</span>
                    </div>

                    {workspaceSubStep === 'questions' ? (
                      /* QUESTIONS SUB-STEP (MATCHES THE SECOND SCREENSHOT) */
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Left column - Template library */}
                        <div className="md:col-span-7 space-y-5 text-left">
                          <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">What questions do you want to ask?</h2>
                            <p className="text-slate-500 text-xs mt-0.5">Choose how to get started.</p>
                          </div>

                          {/* Two top cards: Use a Template vs Start from Scratch */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card 1: Use a Template */}
                            <button
                              type="button"
                              onClick={() => {
                                setCreationMode('template');
                                setPreviewActiveQuestionIndex(0);
                                setPreviewSubmitted(false);
                              }}
                              className={`w-full text-left rounded-2xl p-4.5 border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer focus:outline-none ${
                                creationMode === 'template'
                                  ? 'border-blue-600 bg-blue-50/5 shadow-sm'
                                  : 'border-slate-200 bg-white hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3 flex items-center justify-center">
                                <Files size={22} className="stroke-[2.5]" />
                              </div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-950">Use a Template</h3>
                              <p className="text-[11px] text-slate-500 leading-normal mt-1.5 font-medium">
                                Pick from a library of pre-built survey templates. (You can edit everything later)
                              </p>
                            </button>

                            {/* Card 2: Start from Scratch */}
                            <button
                              type="button"
                              onClick={() => {
                                setCreationMode('scratch');
                                setPreviewActiveQuestionIndex(0);
                                setPreviewSubmitted(false);
                              }}
                              className={`w-full text-left rounded-2xl p-4.5 border-2 transition-all flex flex-col items-center text-center justify-between cursor-pointer focus:outline-none ${
                                creationMode === 'scratch'
                                  ? 'border-blue-600 bg-blue-50/5 shadow-sm'
                                  : 'border-slate-200 bg-white hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl mb-3 flex items-center justify-center">
                                <Pencil size={22} className="stroke-[2.5]" />
                              </div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-950">Start from Scratch</h3>
                              <p className="text-[11px] text-slate-500 leading-normal mt-1.5 font-medium">
                                Know what you want to ask your customers? Build your own survey one question at a time.
                              </p>
                            </button>
                          </div>

                          {creationMode === 'template' ? (
                            <div className="space-y-4">
                              {/* Search and Filters row */}
                              <div className="flex gap-2.5 items-center">
                                {/* Search box */}
                                <div className="relative flex-grow">
                                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                  <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter templates"
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                  />
                                </div>

                                {/* Filter Categories Dropdown Trigger */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                    className="border border-slate-200 rounded-full px-4 py-2 bg-white text-xs font-black text-slate-800 flex items-center gap-1.5 hover:bg-slate-50 shadow-xs transition-all outline-none"
                                  >
                                    Filter Categories
                                    <svg className={`w-3 h-3 text-slate-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>

                                  {/* Filter Categories Dropdown Checklist */}
                                  <AnimatePresence>
                                    {isCategoryDropdownOpen && (
                                      <>
                                        {/* Click away backdrop */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                                        <motion.div
                                          initial={{ opacity: 0, y: 5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 5 }}
                                          className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-3.5 px-3 z-50 text-left space-y-3"
                                        >
                                          <input
                                            type="text"
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            placeholder="Type to filter"
                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                                          />
                                          <div className="space-y-2">
                                            <span className="text-[9px] font-black tracking-widest text-slate-400 font-mono block">CATEGORIES</span>
                                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                              {ALL_CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => {
                                                const isChecked = selectedCategories.includes(cat);
                                                return (
                                                  <div
                                                    key={cat}
                                                    onClick={() => {
                                                      if (isChecked) {
                                                        setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                                      } else {
                                                        setSelectedCategories([...selectedCategories, cat]);
                                                      }
                                                    }}
                                                    className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded-lg cursor-pointer select-none text-xs font-bold text-slate-700"
                                                  >
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                                                      isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border border-slate-300'
                                                    }`}>
                                                      {isChecked && <Check className="text-white stroke-[3.5]" size={11} />}
                                                    </div>
                                                    <span>{cat}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>

                              {/* Build from a prompt AI Option */}
                              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => setIsPromptInputOpen(!isPromptInputOpen)}
                                  className="w-full p-4 flex flex-col text-left hover:bg-slate-50/50 transition-all outline-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                      <Sparkles size={11} className="stroke-[2.5]" />
                                    </div>
                                    <span className="text-xs font-black text-slate-900">Build from a prompt</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5 ml-7">
                                    Generate your survey with AI using a description.
                                  </p>
                                </button>

                                <AnimatePresence>
                                  {isPromptInputOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-3"
                                    >
                                      {isGeneratingFromPrompt ? (
                                        <div className="py-6 text-center space-y-2">
                                          <Loader2 className="animate-spin text-blue-600 mx-auto" size={24} />
                                          <p className="text-xs font-black text-slate-800 animate-pulse">{promptLoadingPhrase}</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          <textarea
                                            value={promptInput}
                                            onChange={(e) => setPromptInput(e.target.value)}
                                            placeholder="e.g. A checkout exit feedback questionnaire asking if they faced payment issues..."
                                            rows={2}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600"
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setIsPromptInputOpen(false)}
                                              className="text-slate-500 hover:text-slate-700 text-[10px] font-black px-3 py-1.5"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (!promptInput.trim()) return;
                                                setIsGeneratingFromPrompt(true);
                                                setPromptLoadingPhrase('Analyzing your prompt...');
                                                const phrases = [
                                                  'Extracting customer insights...',
                                                  'Formulating adaptive questions...',
                                                  'Finalizing survey preview...'
                                                ];
                                                let pIndex = 0;
                                                const interval = setInterval(() => {
                                                  if (pIndex < phrases.length) {
                                                    setPromptLoadingPhrase(phrases[pIndex]);
                                                    pIndex++;
                                                  }
                                                }, 1200);
                                                setTimeout(() => {
                                                  clearInterval(interval);
                                                  setIsGeneratingFromPrompt(false);
                                                  setIsPromptInputOpen(false);
                                                  const customTemplate: OnboardingTemplate = {
                                                    id: 'custom-prompt-temp',
                                                    title: 'AI Prompt Generated Survey',
                                                    description: `Custom questions created from: "${promptInput}"`,
                                                    category: 'Feedback & Optimization',
                                                    recommendedDelivery: 'Slide In',
                                                    questions: [
                                                      {
                                                        questionText: `On a scale of 1-5, how well did our checkout process work?`,
                                                        type: 'multiple-choice',
                                                        options: ['5 - Perfect', '4 - Good', '3 - Neutral', '2 - Poor', '1 - Failed']
                                                      },
                                                      {
                                                        questionText: 'Would you like us to notify you once your issue is fixed?',
                                                        type: 'multiple-choice',
                                                        options: ['Yes, please', 'No, thank you']
                                                      }
                                                    ]
                                                  };
                                                  setCustomPromptTemplate(customTemplate);
                                                  setSelectedTemplateId('custom-prompt-temp');
                                                  setPreviewActiveQuestionIndex(0);
                                                  setPreviewSelectedChoice('');
                                                  setPreviewSubmitted(false);
                                                }, 3600);
                                              }}
                                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                                            >
                                              Generate with AI <Sparkles size={11} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Templates List grouped by Category */}
                              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
                                {customPromptTemplate && (
                                  <div>
                                    <span className="text-[9px] font-black tracking-widest text-blue-600 font-mono uppercase">AI CUSTOM GENERATION</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedTemplateId('custom-prompt-temp');
                                        setPreviewActiveQuestionIndex(0);
                                        setPreviewSelectedChoice('');
                                        setPreviewSubmitted(false);
                                      }}
                                      className={`w-full text-left rounded-2xl p-4 border transition-all mt-1.5 relative block focus:outline-none ${
                                        selectedTemplateId === 'custom-prompt-temp'
                                          ? 'border-blue-600 bg-blue-50/10'
                                          : 'border-slate-200 bg-white hover:border-slate-300'
                                      }`}
                                    >
                                      {selectedTemplateId === 'custom-prompt-temp' && (
                                        <div className="absolute top-3.5 right-4 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                          <Check size={10} className="stroke-[3]" />
                                        </div>
                                      )}
                                      <h4 className="text-[12px] sm:text-[13px] font-black text-slate-950 flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-blue-600" /> {customPromptTemplate.title}
                                      </h4>
                                      <p className="text-[11px] text-slate-500 leading-normal mt-1 font-medium">{customPromptTemplate.description}</p>
                                      <div className="text-[10px] text-slate-400 font-semibold mt-2.5">
                                        Recommended Delivery: <span className="underline text-slate-600 font-bold">{customPromptTemplate.recommendedDelivery}</span>
                                      </div>
                                    </button>
                                  </div>
                                )}

                                {ALL_CATEGORIES.map(category => {
                                  const templatesInCategory = ONBOARDING_TEMPLATES.filter(temp => {
                                    const matchesCategory = selectedCategories.includes(temp.category) && temp.category === category;
                                    const matchesSearch = temp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                          temp.description.toLowerCase().includes(searchQuery.toLowerCase());
                                    return matchesCategory && matchesSearch;
                                  });

                                  if (templatesInCategory.length === 0) return null;

                                  return (
                                    <div key={category} className="space-y-2">
                                      <span className="text-[9px] font-black tracking-widest text-slate-400 font-mono uppercase block">{category}</span>
                                      <div className="space-y-2">
                                        {templatesInCategory.map((temp) => {
                                          const isSelected = selectedTemplateId === temp.id;
                                          return (
                                            <button
                                              key={temp.id}
                                              type="button"
                                              onClick={() => {
                                                setSelectedTemplateId(temp.id);
                                                setPreviewActiveQuestionIndex(0);
                                                setPreviewSelectedChoice('');
                                                setPreviewSubmitted(false);
                                              }}
                                              className={`w-full text-left rounded-2xl p-4 border transition-all relative block focus:outline-none ${
                                                isSelected
                                                  ? 'border-2 border-blue-600 bg-blue-50/5'
                                                  : 'border-slate-200 bg-white hover:border-slate-300'
                                              }`}
                                            >
                                              {isSelected && (
                                                <div className="absolute top-3.5 right-4 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                                  <Check size={10} className="stroke-[3]" />
                                                </div>
                                              )}
                                              <h4 className="text-[12px] sm:text-[13px] font-black text-slate-950">{temp.title}</h4>
                                              <p className="text-[11px] text-slate-500 leading-normal mt-1 font-medium">{temp.description}</p>
                                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-2.5">
                                                <span>
                                                  Recommended Delivery: <span className="underline text-slate-600 font-bold">{temp.recommendedDelivery}</span>
                                                </span>
                                                <span className="text-slate-500 font-bold hover:text-slate-700 flex items-center gap-0.5">
                                                  <Sparkles size={11} /> Learn
                                                </span>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            /* START FROM SCRATCH EXPLAINER */
                            <div className="border border-blue-500/10 bg-blue-50/10 rounded-2xl p-6 text-center space-y-3 shadow-xs">
                              <h3 className="text-xs sm:text-sm font-black text-blue-900">Custom Survey Template Selected</h3>
                              <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                                You chose to build from scratch. Our AI will set up a placeholder template, and you'll be able to add, re-order, and design customized survey cards question-by-question immediately inside the editor workspace.
                              </p>
                            </div>
                          )}

                          {/* Footer action buttons */}
                          <div className="flex justify-between pt-4 border-t border-slate-100">
                            <button
                              id="btn_onboarding_back_3_questions"
                              onClick={() => setStep(2)}
                              className="text-slate-500 hover:text-slate-800 text-xs font-bold px-4 py-2"
                            >
                              ← Back
                            </button>
                            <button
                              id="btn_onboarding_next_3_questions"
                              onClick={() => {
                                setWorkspaceSubStep('behavior');
                                setPreviewActiveQuestionIndex(0);
                                setPreviewSelectedChoice('');
                                setPreviewSubmitted(false);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                            >
                              Next Step <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Right column - SURVEY PREVIEW BOX (100% MATCHES THE SCREENSHOT) */}
                        <div className="md:col-span-5 space-y-4 text-left">
                          <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                              Survey Preview: {creationMode === 'scratch' ? 'Build from scratch' : 'Use a Template'}
                            </h3>
                            <p className="text-slate-400 text-[11px] mt-0.5">Survey representation below.</p>
                          </div>

                          <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-5 flex flex-col justify-between min-h-[380px] relative shadow-inner">
                            {/* Centered card mockup */}
                            <div className="flex-grow flex items-center justify-center py-4">
                              {creationMode === 'scratch' ? (
                                /* START FROM SCRATCH MOCKUP CARD */
                                <div className="bg-white rounded-2xl p-5 w-full max-w-[270px] border border-slate-200/80 shadow-md relative">
                                  <button
                                    type="button"
                                    onClick={() => {}}
                                    className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 text-xs font-bold"
                                  >
                                    ✕
                                  </button>
                                  <h4 className="text-[13px] font-black text-slate-950 mb-1.5">Example Slide</h4>
                                  <p className="text-[11px] text-slate-500 leading-normal mb-4 font-medium">
                                    This is an example slide. Your published customerlens will look look something like this given your current settings.
                                  </p>
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      className="bg-[#1e293b] hover:bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm transition-all"
                                    >
                                      Close <span className="font-sans">✕</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* TEMPLATE CHOSEN MOCKUP CARD */
                                <div className="bg-white rounded-2xl p-5 w-full max-w-[270px] border border-slate-200/80 shadow-md relative text-left">
                                  {/* Close corner action */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewActiveQuestionIndex(0);
                                      setPreviewSelectedChoice('');
                                      setPreviewSubmitted(false);
                                    }}
                                    className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 text-xs font-bold outline-none"
                                    title="Reset"
                                  >
                                    ✕
                                  </button>

                                  {previewSubmitted ? (
                                    /* Preview Submitted Success view */
                                    <div className="text-center py-4 space-y-2">
                                      <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                        <Check size={18} className="stroke-[3]" />
                                      </div>
                                      <h5 className="text-[11px] font-black text-slate-950">Thank you!</h5>
                                      <p className="text-[10px] text-slate-500 leading-normal">Your response was recorded. Have a great day!</p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPreviewActiveQuestionIndex(0);
                                          setPreviewSelectedChoice('');
                                          setPreviewSubmitted(false);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-[10px] font-bold underline mt-1 block w-full"
                                      >
                                        Restart Preview
                                      </button>
                                    </div>
                                  ) : (
                                    /* Active Question view */
                                    <div>
                                      {/* Question metadata */}
                                      <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1">
                                        Question {previewActiveQuestionIndex + 1} of{' '}
                                        {(selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0}
                                      </div>

                                      {/* Question Headline */}
                                      <h4 className="text-[12px] sm:text-[13px] font-black text-slate-950 mb-3 leading-snug">
                                        {(selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.questionText}
                                      </h4>

                                      {/* Question options */}
                                      {((selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.type === 'multiple-choice') ? (
                                        <div className="space-y-1.5">
                                          {(selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.options.map((opt) => (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={() => {
                                                setPreviewSelectedChoice(opt);
                                                // Handle autoAdvance
                                                const totalQuestions = (selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0;
                                                if (autoAdvance) {
                                                  if (previewActiveQuestionIndex + 1 < totalQuestions) {
                                                    setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                                    setPreviewSelectedChoice('');
                                                  } else {
                                                    setPreviewSubmitted(true);
                                                  }
                                                }
                                              }}
                                              className={`w-full text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-between ${
                                                previewSelectedChoice === opt
                                                  ? 'border-blue-600 bg-blue-50/15 text-blue-900'
                                                  : 'border-slate-200 bg-white hover:bg-slate-50/30 text-slate-800'
                                              }`}
                                            >
                                              <span>{opt}</span>
                                              <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${previewSelectedChoice === opt ? 'border-blue-600 text-blue-600' : 'border-slate-300'}`}>
                                                {previewSelectedChoice === opt && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="space-y-1.5">
                                          <input
                                            type="text"
                                            disabled
                                            placeholder="Respondent types answer here..."
                                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-[10px] outline-none placeholder-slate-400 font-medium"
                                          />
                                        </div>
                                      )}

                                      {/* Preview Bottom Controls */}
                                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                        {/* Back button (Only if allowEdits and not first question) */}
                                        {allowEdits && previewActiveQuestionIndex > 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPreviewActiveQuestionIndex(previewActiveQuestionIndex - 1);
                                              setPreviewSelectedChoice('');
                                            }}
                                            className="text-slate-500 hover:text-slate-700 text-[10px] font-bold flex items-center gap-0.5"
                                          >
                                            ← Back
                                          </button>
                                        ) : (
                                          <div />
                                        )}

                                        {/* Next button (If autoAdvance is false OR it is a text question) */}
                                        {(!autoAdvance || (selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.type !== 'multiple-choice') && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const totalQuestions = (selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0;
                                              if (previewActiveQuestionIndex + 1 < totalQuestions) {
                                                setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                                setPreviewSelectedChoice('');
                                              } else {
                                                setPreviewSubmitted(true);
                                              }
                                            }}
                                            className="bg-slate-900 hover:bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm ml-auto"
                                          >
                                            {previewActiveQuestionIndex + 1 < ((selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0) ? 'Next' : 'Submit'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Bottom info banner */}
                            <div className="bg-[#f0f9ff] border border-sky-100 rounded-xl p-3 flex items-start gap-2 text-left">
                              <div className="p-1 rounded-lg bg-sky-100 text-sky-800 flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5 transform rotate-180 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7" />
                                </svg>
                              </div>
                              <p className="text-[10px] text-sky-950 leading-relaxed font-bold">
                                A preview of your survey template is printed in the box above. Feel free to click through it. You can always edit this template after saving.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* BEHAVIOR SUB-STEP (MATCHES THE FIRST SCREENSHOT) */
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left">
                        {/* Left column - Behavior Config */}
                        <div className="md:col-span-7 space-y-5">
                          <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Survey Summary</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Click any step below to make changes.</p>
                          </div>

                          {/* Checklist items to go back */}
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setWorkspaceSubStep('questions')}
                              className="w-full text-left flex items-center justify-between border border-slate-200/75 rounded-xl px-4 py-2.5 bg-white text-slate-800 text-[11px] font-extrabold shadow-xs hover:border-blue-500/30 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Check className="text-emerald-500 stroke-[3]" size={14} />
                                <span>Step 1: Questions</span>
                              </div>
                              <span className="text-blue-600 hover:underline font-bold">
                                {creationMode === 'scratch'
                                  ? 'Build from scratch'
                                  : (selectedTemplateId === 'custom-prompt-temp' ? 'Custom Prompt Survey' : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId)?.title || 'Simple Post Purchase Survey')}
                              </span>
                            </button>

                            <div className="flex items-center justify-between border border-slate-200/75 rounded-xl px-4 py-2.5 bg-white text-slate-800 text-[11px] font-extrabold shadow-xs">
                              <div className="flex items-center gap-2">
                                <Check className="text-emerald-500 stroke-[3]" size={14} />
                                <span>Step 2: Delivery</span>
                              </div>
                              <span className="text-slate-400 font-normal">Link Only</span>
                            </div>
                          </div>

                          {/* Behavior Questions Header */}
                          <div className="pt-2">
                            <h3 className="text-[13px] font-black text-slate-900 tracking-tight">How should this survey behave?</h3>
                            <p className="text-slate-400 text-xs mt-0.5">Adjust how this survey runs. You can edit these and more options later.</p>
                          </div>

                          {/* Behavior Config Toggle List */}
                          <div className="border border-blue-500/15 bg-blue-50/5 rounded-2xl p-4.5 space-y-4.5 shadow-xs">
                            {/* ALLOW EDITS */}
                            <div className="flex items-start gap-4">
                              <OnboardingToggle checked={allowEdits} onChange={() => setAllowEdits(!allowEdits)} />
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">ALLOW EDITS</span>
                                <p className="text-xs font-bold text-slate-800 leading-normal">
                                  Let respondents go back and change their answers before submitting.
                                </p>
                              </div>
                            </div>

                            {/* AUTOMATICALLY ADVANCE SLIDES */}
                            <div className="flex items-start gap-4 border-t border-slate-100 pt-3">
                              <OnboardingToggle checked={autoAdvance} onChange={() => setAutoAdvance(!autoAdvance)} />
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">AUTOMATICALLY ADVANCE SLIDES</span>
                                <p className="text-xs font-bold text-slate-800 leading-normal">
                                  Automatically move to the next slide on selection.
                                </p>
                              </div>
                            </div>

                            {/* ALLOW RESUBMISSIONS */}
                            <div className="flex items-start gap-4 border-t border-slate-100 pt-3">
                              <OnboardingToggle checked={allowResubmissions} onChange={() => setAllowResubmissions(!allowResubmissions)} />
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">ALLOW RESUBMISSIONS</span>
                                <p className="text-xs font-bold text-slate-800 leading-normal">
                                  Let the same participant submit this survey more than once.
                                </p>
                              </div>
                            </div>

                            {/* NOTIFY ME ON RESPONSE */}
                            <div className="flex items-start gap-4 border-t border-slate-100 pt-3">
                              <OnboardingToggle checked={notifyOnResponse} onChange={() => setNotifyOnResponse(!notifyOnResponse)} />
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">NOTIFY ME ON RESPONSE</span>
                                <p className="text-xs font-bold text-slate-800 leading-normal">
                                  Send an email to your team whenever someone responds.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer action buttons */}
                          <div className="flex justify-between pt-4 border-t border-slate-100">
                            <button
                              id="btn_onboarding_back_3_behavior"
                              onClick={() => setWorkspaceSubStep('questions')}
                              className="text-slate-500 hover:text-slate-800 text-xs font-bold px-4 py-2"
                            >
                              ← Back to Questions
                            </button>
                            <button
                              id="btn_onboarding_next_3_behavior"
                              onClick={handleStep3}
                              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                            >
                              Next Step <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Right column - Preview Column */}
                        <div className="md:col-span-5 space-y-4">
                          <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                              Survey Preview: {creationMode === 'scratch' ? 'Build from scratch' : 'Use a Template'}
                            </h3>
                            <p className="text-slate-400 text-[11px] mt-0.5">Survey representation below.</p>
                          </div>

                          <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-5 flex flex-col justify-between min-h-[380px] relative shadow-inner">
                            {/* Centered card mockup */}
                            <div className="flex-grow flex items-center justify-center py-4">
                              {creationMode === 'scratch' ? (
                                <div className="bg-white rounded-2xl p-5 w-full max-w-[270px] border border-slate-200/80 shadow-md relative">
                                  <button type="button" className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 text-xs font-bold">
                                    ✕
                                  </button>
                                  <h4 className="text-[13px] font-black text-slate-950 mb-1.5">Example Slide</h4>
                                  <p className="text-[11px] text-slate-500 leading-normal mb-4 font-medium">
                                    This is an example slide. Your published customerlens will look look something like this given your current settings.
                                  </p>
                                  <div className="flex justify-end">
                                    <button type="button" className="bg-[#1e293b] hover:bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-sm transition-all">
                                      Close <span className="font-sans">✕</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white rounded-2xl p-5 w-full max-w-[270px] border border-slate-200/80 shadow-md relative">
                                  {/* Close corner action */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewActiveQuestionIndex(0);
                                      setPreviewSelectedChoice('');
                                      setPreviewSubmitted(false);
                                    }}
                                    className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 text-xs font-bold outline-none"
                                  >
                                    ✕
                                  </button>

                                  {previewSubmitted ? (
                                    <div className="text-center py-4 space-y-2">
                                      <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                        <Check size={18} className="stroke-[3]" />
                                      </div>
                                      <h5 className="text-[11px] font-black text-slate-950">Thank you!</h5>
                                      <p className="text-[10px] text-slate-500 leading-normal">Your response was recorded. Have a great day!</p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPreviewActiveQuestionIndex(0);
                                          setPreviewSelectedChoice('');
                                          setPreviewSubmitted(false);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-[10px] font-bold underline mt-1 block w-full"
                                      >
                                        Restart Preview
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      {/* Question metadata */}
                                      <div className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1">
                                        Question {previewActiveQuestionIndex + 1} of{' '}
                                        {(selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0}
                                      </div>

                                      {/* Question Headline */}
                                      <h4 className="text-[12px] sm:text-[13px] font-black text-slate-950 mb-3 leading-snug">
                                        {(selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.questionText}
                                      </h4>

                                      {/* Question options */}
                                      {((selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.type === 'multiple-choice') ? (
                                        <div className="space-y-1.5">
                                          {(selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.options.map((opt) => (
                                            <button
                                              key={opt}
                                              type="button"
                                              onClick={() => {
                                                setPreviewSelectedChoice(opt);
                                                const totalQuestions = (selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0;
                                                if (autoAdvance) {
                                                  if (previewActiveQuestionIndex + 1 < totalQuestions) {
                                                    setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                                    setPreviewSelectedChoice('');
                                                  } else {
                                                    setPreviewSubmitted(true);
                                                  }
                                                }
                                              }}
                                              className={`w-full text-left px-3 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-between ${
                                                previewSelectedChoice === opt
                                                  ? 'border-blue-600 bg-blue-50/15 text-blue-900'
                                                  : 'border-slate-200 bg-white hover:bg-slate-50/30 text-slate-800'
                                              }`}
                                            >
                                              <span>{opt}</span>
                                              <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${previewSelectedChoice === opt ? 'border-blue-600 text-blue-600' : 'border-slate-300'}`}>
                                                {previewSelectedChoice === opt && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="space-y-1.5">
                                          <input
                                            type="text"
                                            disabled
                                            placeholder="Respondent types answer here..."
                                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-[10px] outline-none placeholder-slate-400 font-medium"
                                          />
                                        </div>
                                      )}

                                      {/* Preview Bottom Controls */}
                                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                        {/* Back button */}
                                        {allowEdits && previewActiveQuestionIndex > 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPreviewActiveQuestionIndex(previewActiveQuestionIndex - 1);
                                              setPreviewSelectedChoice('');
                                            }}
                                            className="text-slate-500 hover:text-slate-700 text-[10px] font-bold flex items-center gap-0.5"
                                          >
                                            ← Back
                                          </button>
                                        ) : (
                                          <div />
                                        )}

                                        {/* Next button */}
                                        {(!autoAdvance || (selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions[previewActiveQuestionIndex]?.type !== 'multiple-choice') && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const totalQuestions = (selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0;
                                              if (previewActiveQuestionIndex + 1 < totalQuestions) {
                                                setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                                setPreviewSelectedChoice('');
                                              } else {
                                                setPreviewSubmitted(true);
                                              }
                                            }}
                                            className="bg-slate-900 hover:bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm ml-auto"
                                          >
                                            {previewActiveQuestionIndex + 1 < ((selectedTemplateId === 'custom-prompt-temp' ? customPromptTemplate : ONBOARDING_TEMPLATES.find(t => t.id === selectedTemplateId))?.questions.length || 0) ? 'Next' : 'Submit'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Bottom info banner */}
                            <div className="bg-[#f0f9ff] border border-sky-100 rounded-xl p-3 flex items-start gap-2 text-left">
                              <div className="p-1 rounded-lg bg-sky-100 text-sky-800 flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5 transform rotate-180 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7" />
                                </svg>
                              </div>
                              <p className="text-[10px] text-sky-950 leading-relaxed font-bold">
                                A preview of your survey template is printed in the box above. Feel free to click through it. You can always edit this template after saving.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Standard step 3 list (Non-Workspace flow, eg. Shopify) */}
                    <div className="max-w-2xl mb-6 text-left">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Select your primary conversion goal
                      </h1>
                      <p className="text-slate-500 text-sm font-medium">
                        Our AI models will formulate targeted questions and trigger criteria tuned specifically to this milestone.
                      </p>
                    </div>

                    <div className="space-y-3 max-w-2xl max-h-[320px] overflow-y-auto pr-2 custom-scrollbar mb-8 text-left">
                      {GOALS.map((g) => (
                        <button
                          key={g.id}
                          id={`btn_goal_${g.id.replace(/\s+/g, '_')}`}
                          onClick={() => setGoal(g.id)}
                          className={`w-full text-left px-5 py-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-4 hover:bg-slate-50/50 focus:outline-none ${
                            goal === g.id 
                              ? 'border-indigo-600 bg-indigo-50/20' 
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${goal === g.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-300 bg-white'}`}>
                            {goal === g.id && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{g.text}</p>
                            <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed mt-0.5">{g.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        id="btn_onboarding_back_3"
                        onClick={() => setStep(2)}
                        className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-4 py-2"
                      >
                        Back
                      </button>
                      <button
                        id="btn_onboarding_next_3"
                        onClick={handleStep3}
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        Build AI Surveys <Sparkles size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: AI Generated Survey Preview & Theme Selection */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[350px] flex flex-col justify-center"
              >
                {loading ? (
                  <div className="text-center py-12 space-y-4">
                    <Loader2 size={44} className="animate-spin text-indigo-600 mx-auto" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 tracking-tight animate-pulse">Consulting CustomerLens AI Specialist...</h3>
                      <p className="text-indigo-600 text-xs font-mono mt-1.5 font-bold tracking-wider uppercase bg-indigo-50 inline-block px-3 py-1 rounded-full">{loadingPhrase}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="max-w-2xl mb-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold mb-2 border border-emerald-100">
                        <Sparkles size={12} className="text-emerald-600" /> Co-designed by Gemini AI
                      </div>
                      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Your custom exit-intent survey is ready!
                      </h1>
                      <p className="text-slate-500 text-sm">
                        Based on your primary target to <strong className="text-indigo-600 font-bold">{goal}</strong>, our AI prepared a customized feedback workflow.
                      </p>
                    </div>

                    {generatedSurvey && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Survey specs summary */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1 font-mono">Recommended Placement</span>
                            <div className="flex items-center gap-2 text-slate-800">
                              <Layers size={16} className="text-indigo-500" />
                              <span className="text-xs font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded">{generatedSurvey.recommendedPlacement}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1 font-mono">Aesthetic Design Theme Accent</span>
                            <div className="flex items-center gap-2.5">
                              <Palette size={16} className="text-indigo-500" />
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200/60 px-2 py-1 rounded-lg">
                                <div className="h-3.5 w-3.5 rounded-full border border-slate-300" style={{ backgroundColor: generatedSurvey.colors.accent }} />
                                <span className="font-mono text-[10px] font-extrabold uppercase text-slate-600">{generatedSurvey.colors.accent}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5 font-mono">AI Suggested Question Blueprint</span>
                            <div className="space-y-2">
                              {generatedSurvey.questions.map((q: any, i: number) => (
                                <div key={q.id} className="text-xs bg-white border border-slate-200/40 p-2.5 rounded-xl flex items-start gap-2.5">
                                  <span className="font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded text-[10px]">{i+1}</span>
                                  <div>
                                    <p className="font-semibold text-slate-800 text-[11px] leading-snug">{q.questionText}</p>
                                    <p className="text-slate-400 text-[9px] mt-0.5 uppercase tracking-wide font-mono font-bold">{q.type}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Visual Mock-up */}
                        <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ backgroundColor: generatedSurvey.colors.background, color: generatedSurvey.colors.text }}>
                          <div className="absolute right-3 top-3 text-[9px] font-bold font-mono tracking-wider opacity-30 uppercase">Interactive Widget Mockup</div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Wait! Before you go...</p>
                            <h3 className="text-base font-black tracking-tight mt-1 mb-4 leading-snug">{generatedSurvey.headline}</h3>
                            
                            {/* Dummy Options for First Question */}
                            <div className="space-y-1.5">
                              {generatedSurvey.questions[0]?.options?.slice(0, 4).map((opt: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:opacity-85" style={{ borderColor: generatedSurvey.colors.accent + '25', backgroundColor: generatedSurvey.colors.background }}>
                                  <div className="h-3 w-3 rounded-full border border-slate-300 flex-shrink-0" />
                                  <span>{opt}</span>
                                </div>
                              )) || (
                                <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center text-xs opacity-50">
                                  No options needed for ratings/text responses.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 flex justify-end gap-2 text-xs pt-4 border-t border-slate-100/50">
                            <button className="px-3 py-1.5 font-semibold opacity-60 rounded-lg">Skip</button>
                            <button className="px-3 py-1.5 text-white font-semibold rounded-lg shadow-sm" style={{ backgroundColor: generatedSurvey.colors.accent }}>Submit</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        id="btn_onboarding_back_4"
                        onClick={() => setStep(3)}
                        className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-4 py-2"
                      >
                        Back
                      </button>
                      <button
                        id="btn_onboarding_next_4"
                        onClick={handleStep4}
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        Go to Final Step <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Celebratory Launch Screen */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center py-6"
              >
                <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
                  🚀
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Ready for launch!
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Your CustomerLens tracker has been compiled successfully. You are now ready to capture exit-intent feedback on your website and analyze results.
                  </p>
                </div>

                {/* Configuration Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto text-left pt-2">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Connected Website</span>
                    <p className="font-extrabold text-slate-800 text-xs truncate" title={websiteUrl || 'Not set'}>{websiteUrl || 'Not specified'}</p>
                    <p className="text-[10px] text-slate-500 font-medium font-mono">{businessName || 'Default Store'}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Target Conversion Goal</span>
                    <p className="font-extrabold text-slate-800 text-xs truncate" title={goal}>{goal}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">🟢 Optimization Active</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Selected Platform</span>
                    <p className="font-extrabold text-slate-800 text-xs truncate">{businessType} Integration</p>
                    <p className="text-[10px] text-indigo-600 font-bold">1 Click Install Ready</p>
                  </div>
                </div>

                {/* Simulated Telemetry Banner Removed (Architectural Honesty) */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl max-w-xl mx-auto text-center">
                  <p className="text-xs font-bold text-emerald-800 leading-normal flex items-center justify-center gap-1.5">
                    <Check size={14} className="text-emerald-600 stroke-[3]" /> All systems ready. Dashboard configuration initialized successfully!
                  </p>
                </div>

                {/* Launch Button */}
                <div className="pt-4 flex justify-between max-w-xl mx-auto border-t border-slate-100">
                  <button
                    id="btn_onboarding_back_5"
                    onClick={() => setStep(4)}
                    className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    id="btn_onboarding_launch"
                    onClick={handleLaunch}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-sm px-10 py-4 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 shadow-indigo-600/10 transition-all transform hover:-translate-y-0.5"
                  >
                    Launch Now! <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Footer copyright */}
      <div className={`${isWorkspaceStep ? 'max-w-5xl' : 'max-w-4xl'} mx-auto w-full text-center text-xs text-slate-400 font-mono mt-8 transition-all duration-300`}>
        CustomerLens Onboarding System • No Manual Support Approval Required • 🟢 Self-Service Activated
      </div>
    </div>
  );
}
