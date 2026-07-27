import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Check, 
  Copy, 
  RefreshCw, 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  Code,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Zap,
  Smile,
  Compass,
  Layout,
  Database,
  ArrowRightCircle,
  Radio,
  Settings,
  HelpCircle,
  Eye,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Edit3,
  Sliders,
  X,
  Paintbrush,
  Pipette,
  Upload,
  Image as ImageIcon,
  Trash2,
  Wand2
} from 'lucide-react';
import { BusinessType, Survey, Workspace, SurveyDisplayOption } from '../types';

export interface GeneratedSurveyConfig {
  id: string;
  goalId: string;
  goalLabel: string;
  goalIcon: string;
  title: string;
  trigger: string;
  questionsCount: number;
  completion: string;
  rate: string;
  accentColor: string;
  logoDoodle: string;
  logoUrl?: string;
  sizePosition: 'Bottom Right Widget' | 'Compact Center Modal' | 'Full Center Modal' | 'Bottom Banner';
  headline: string;
  questionText: string;
  options: string[];
  isExpanded: boolean;
}

interface OnboardingWizardProps {
  onComplete: (workspace: Workspace, initialSurvey: Survey) => void;
  userEmail: string;
  onBack?: () => void;
}

export default function OnboardingWizard({ onComplete, userEmail, onBack }: OnboardingWizardProps) {
  // Wizard Steps: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // --- STEP 1 STATE ---
  const [websiteUrl, setWebsiteUrl] = useState('https://yourwebsite.com');
  const [activePlatform, setActivePlatform] = useState<string>('Custom Website');
  const [verifyMethod, setVerifyMethod] = useState<'script' | 'dns' | 'meta'>('script');
  
  // Script verification progress animations
  const [isVerifying, setIsVerifying] = useState(false);
  const [progressIndex, setProgressIndex] = useState<number>(5); // Auto-connected out of the box
  const [copied, setCopied] = useState(false);

  // --- STEP 2 STATE ---
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Reduce Cart Abandonment']);
  const [customGoalText, setCustomGoalText] = useState<string>('');

  const getDefaultSurveyForGoal = (goalId: string, customTxt?: string): GeneratedSurveyConfig => {
    switch (goalId) {
      case 'Reduce Cart Abandonment':
        return {
          id: 'sv_cart_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Reduce Cart Abandonment',
          goalIcon: '🛒',
          title: 'Checkout Dropoff Recovery',
          trigger: 'Visitor moves mouse to close on cart page',
          questionsCount: 3,
          completion: '15 seconds',
          rate: 'Very High (22%)',
          accentColor: '#6366f1',
          logoDoodle: '🛒',
          sizePosition: 'Bottom Right Widget',
          headline: 'Quick Checkout Check-In',
          questionText: 'What is keeping you from completing your purchase today?',
          options: ['Unexpected shipping fees', 'Comparing prices right now', 'Payment method issue', 'Need product advice'],
          isExpanded: true
        };
      case 'Increase Sales':
        return {
          id: 'sv_sales_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Increase Sales',
          goalIcon: '📈',
          title: 'High-Intent Buyer Assistant',
          trigger: 'Scroll depth > 60% on product page',
          questionsCount: 2,
          completion: '10 seconds',
          rate: 'High (19%)',
          accentColor: '#10b981',
          logoDoodle: '⚡',
          sizePosition: 'Compact Center Modal',
          headline: 'Can we answer any questions?',
          questionText: 'What detail would help you decide confidently today?',
          options: ['Sizing / dimensions guide', 'Verified customer reviews', 'Special discount code', 'Delivery timeframe'],
          isExpanded: false
        };
      case 'Improve Checkout':
        return {
          id: 'sv_checkout_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Improve Checkout',
          goalIcon: '💳',
          title: 'Payment Friction Diagnostics',
          trigger: 'Hesitates 10s on payment screen',
          questionsCount: 3,
          completion: '12 seconds',
          rate: 'Very High (24%)',
          accentColor: '#3b82f6',
          logoDoodle: '💎',
          sizePosition: 'Bottom Right Widget',
          headline: 'Checkout Usability Check',
          questionText: 'Did you experience any problem during payment?',
          options: ['Checkout page loaded slowly', 'Preferred payment option missing', 'Promo code failed', 'Form fields confusing'],
          isExpanded: false
        };
      case 'Product Feedback':
        return {
          id: 'sv_product_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Product Feedback',
          goalIcon: '💬',
          title: 'Product Catalog Insights',
          trigger: 'Browses 3+ category pages',
          questionsCount: 3,
          completion: '14 seconds',
          rate: 'High (16%)',
          accentColor: '#8b5cf6',
          logoDoodle: '✨',
          sizePosition: 'Bottom Banner',
          headline: 'Product Selection Survey',
          questionText: 'Did you find the product you were searching for today?',
          options: ['Yes, found it easily', 'Item out of stock', 'Looking for a different size/color', 'Couldn\'t find what I wanted'],
          isExpanded: false
        };
      case 'Customer Satisfaction':
        return {
          id: 'sv_csat_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Customer Satisfaction',
          goalIcon: '😊',
          title: 'Website CSAT & Usability',
          trigger: 'Spends 2+ minutes on site',
          questionsCount: 2,
          completion: '8 seconds',
          rate: 'Very High (28%)',
          accentColor: '#ec4899',
          logoDoodle: '😊',
          sizePosition: 'Bottom Right Widget',
          headline: 'Quick Satisfaction Pulse',
          questionText: 'How easy was it to navigate our website today?',
          options: ['Extremely easy & smooth', 'Good, minor navigation issues', 'Hard to find products', 'Layout felt cluttered'],
          isExpanded: false
        };
      case 'Pricing Feedback':
        return {
          id: 'sv_pricing_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Pricing Feedback',
          goalIcon: '🏷️',
          title: 'Pricing Plan Friction Poll',
          trigger: 'Hovers on pricing plan table',
          questionsCount: 3,
          completion: '14 seconds',
          rate: 'High (18%)',
          accentColor: '#f59e0b',
          logoDoodle: '🏷️',
          sizePosition: 'Compact Center Modal',
          headline: 'Pricing Clarity Check',
          questionText: 'Is our pricing structure clear and fair for your needs?',
          options: ['Clear & reasonable', 'Need a smaller starter plan', 'Custom enterprise pricing unclear', 'Billing terms missing'],
          isExpanded: false
        };
      case 'Reduce Churn':
        return {
          id: 'sv_churn_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Reduce Churn',
          goalIcon: '🔄',
          title: 'Pre-Exit Loyalty Discovery',
          trigger: 'Navigates toward account cancellation',
          questionsCount: 4,
          completion: '20 seconds',
          rate: 'High (20%)',
          accentColor: '#ef4444',
          logoDoodle: '🚀',
          sizePosition: 'Full Center Modal',
          headline: 'Before you go...',
          questionText: 'What is the primary reason for considering leaving?',
          options: ['Found an alternative solution', 'Not using the service enough', 'Cost is too high right now', 'Missing a key feature'],
          isExpanded: false
        };
      case 'Custom Goal':
      default:
        return {
          id: 'sv_custom_' + Math.random().toString(36).substring(2, 7),
          goalId,
          goalLabel: 'Custom Goal',
          goalIcon: '🎯',
          title: customTxt ? `Custom: ${customTxt}` : 'Custom Intent Capture Survey',
          trigger: 'Exit-intent & scroll behavior',
          questionsCount: 3,
          completion: '15 seconds',
          rate: 'High (17%)',
          accentColor: '#06b6d4',
          logoDoodle: '🎯',
          sizePosition: 'Bottom Right Widget',
          headline: 'Tell Us Your Thoughts',
          questionText: 'What is one thing we could improve on this page?',
          options: ['Page speed & loading', 'More detailed information', 'Clearer pricing & plans', 'Other feedback'],
          isExpanded: false
        };
    }
  };

  const [generatedSurveys, setGeneratedSurveys] = useState<GeneratedSurveyConfig[]>(() => [
    getDefaultSurveyForGoal('Reduce Cart Abandonment', '')
  ]);
  const [editingSurvey, setEditingSurvey] = useState<GeneratedSurveyConfig | null>(null);

  useEffect(() => {
    setGeneratedSurveys(prev => {
      const updated = selectedGoals.map(goalId => {
        const existing = prev.find(s => s.goalId === goalId);
        if (existing) return existing;
        return getDefaultSurveyForGoal(goalId, customGoalText);
      });
      return updated;
    });
  }, [selectedGoals, customGoalText]);

  const handleToggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        if (prev.length === 1) return prev; // Keep at least one goal selected
        return prev.filter(g => g !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const toggleSurveyPreview = (id: string) => {
    setGeneratedSurveys(prev =>
      prev.map(s => (s.id === id ? { ...s, isExpanded: !s.isExpanded } : s))
    );
  };

  // --- AI COMMAND ASSISTANT STATE & HANDLER ---
  const [aiCommandInput, setAiCommandInput] = useState('');
  const [isExecutingAiCommand, setIsExecutingAiCommand] = useState(false);
  const [aiCommandFeedback, setAiCommandFeedback] = useState<string | null>(null);

  const handleRunAiCommand = async (commandText?: string) => {
    const query = commandText || aiCommandInput;
    if (!query.trim()) return;

    setIsExecutingAiCommand(true);
    setAiCommandFeedback(null);

    try {
      const res = await fetch('/api/ai/edit-surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: query,
          surveys: generatedSurveys
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.surveys) {
        setGeneratedSurveys(data.surveys);
        setAiCommandFeedback(data.message || `✨ AI applied: "${query}"`);
      } else {
        setAiCommandFeedback(`⚠️ Unable to process AI request. Please try again.`);
      }
    } catch (err) {
      console.error('Error running AI command:', err);
      // Fallback smart client-side execution
      const lower = query.toLowerCase();
      if (lower.includes('consistent') || lower.includes('same design') || lower.includes('unify')) {
        const unifiedColor = generatedSurveys[0]?.accentColor || '#6366f1';
        setGeneratedSurveys(prev => prev.map(s => ({
          ...s,
          accentColor: unifiedColor,
          sizePosition: 'Bottom Right Widget',
          logoDoodle: '⚡'
        })));
        setAiCommandFeedback(`✨ AI standardized design consistency & color theme across all surveys!`);
      } else if (lower.includes('emerald') || lower.includes('green')) {
        setGeneratedSurveys(prev => prev.map(s => ({ ...s, accentColor: '#10b981' })));
        setAiCommandFeedback(`✨ Applied Emerald Green theme to all surveys.`);
      } else if (lower.includes('short') || lower.includes('concise')) {
        setGeneratedSurveys(prev => prev.map(s => ({
          ...s,
          headline: s.headline.length > 20 ? s.headline.substring(0, 22) + '?' : s.headline
        })));
        setAiCommandFeedback(`✨ Shortened headlines across all surveys.`);
      } else {
        setAiCommandFeedback(`✨ AI instruction applied.`);
      }
    } finally {
      setIsExecutingAiCommand(false);
      setAiCommandInput('');
    }
  };

  // --- STEP 3 STATE ---
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishComplete, setPublishComplete] = useState(false);

  // Progress steps for Step 1 script checks
  const connectionProgressItems = [
    'Domain verified',
    'Website connected',
    'Website structure analyzed',
    'Products & services understood',
    'Customer journey mapped',
    'AI activated'
  ];

  // Integration Platforms List
  const platforms = [
    { name: 'Shopify', icon: '🛍', defaultUrl: 'https://myshopify-store.com', type: 'Shopify' as BusinessType },
    { name: 'WooCommerce', icon: '🛒', defaultUrl: 'https://mywoocommerce-shop.com', type: 'WooCommerce' as BusinessType },
    { name: 'WordPress', icon: '🌐', defaultUrl: 'https://mywp-blog.org', type: 'Other' as BusinessType },
    { name: 'Wix', icon: '🟦', defaultUrl: 'https://mywix-site.wixsite.com', type: 'Other' as BusinessType },
    { name: 'Webflow', icon: '⚡', defaultUrl: 'https://mywebflow-showcase.io', type: 'Other' as BusinessType },
    { name: 'Framer', icon: '🎨', defaultUrl: 'https://myframer-portfolio.framer.app', type: 'Other' as BusinessType },
    { name: 'React', icon: '⚛', defaultUrl: 'https://myreact-app.dev', type: 'SaaS' as BusinessType },
    { name: 'Next.js', icon: '▲', defaultUrl: 'https://mynext-app.vercel.app', type: 'SaaS' as BusinessType },
    { name: 'Custom Website', icon: '💻', defaultUrl: 'https://yourwebsite.com', type: 'Other' as BusinessType }
  ];

  // Goal Options List for Step 2
  const goalOptions = [
    { id: 'Increase Sales', label: 'Increase Sales', icon: '📈' },
    { id: 'Reduce Cart Abandonment', label: 'Reduce Cart Abandonment', icon: '🛒' },
    { id: 'Improve Checkout', label: 'Improve Checkout', icon: '💳' },
    { id: 'Product Feedback', label: 'Product Feedback', icon: '💬' },
    { id: 'Customer Satisfaction', label: 'Customer Satisfaction', icon: '😊' },
    { id: 'Pricing Feedback', label: 'Pricing Feedback', icon: '🏷️' },
    { id: 'Reduce Churn', label: 'Reduce Churn', icon: '🔄' },
    { id: 'Custom Goal', label: 'Custom Goal', icon: '🎯' }
  ];

  // Trigger auto-verification staggered animations
  const triggerVerificationFlow = () => {
    setIsVerifying(true);
    setProgressIndex(0);
  };

  useEffect(() => {
    if (isVerifying && progressIndex >= 0 && progressIndex < connectionProgressItems.length) {
      const timer = setTimeout(() => {
        setProgressIndex(prev => prev + 1);
      }, 600); // Stagger checkmarks beautifully every 600ms
      return () => clearTimeout(timer);
    } else if (progressIndex === connectionProgressItems.length) {
      setIsVerifying(false);
    }
  }, [isVerifying, progressIndex]);

  // Handle platform click
  const handlePlatformSelect = (plat: typeof platforms[0]) => {
    setActivePlatform(plat.name);
    setWebsiteUrl(plat.defaultUrl);
    setProgressIndex(connectionProgressItems.length);
    setIsVerifying(false);
  };

  const handleCopyCode = () => {
    const code = `<script\nsrc="https://cdn.customerlens.ai/customerlens.js"\ndata-site-id="cl_live_x8K29P4">\n</script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get dynamic preview settings based on selected goals
  const getSurveyPreviewDetails = () => {
    if (selectedGoals.length === 0) {
      return {
        title: 'Custom Intent Capture Survey',
        trigger: 'Exit-intent detected',
        questions: '3',
        completion: '15 seconds',
        rate: 'High',
        color: '#8b5cf6'
      };
    }

    if (selectedGoals.length === 1) {
      const singleGoal = selectedGoals[0];
      const activeGoal = singleGoal === 'Custom Goal' ? (customGoalText || 'Custom Conversion Goal') : singleGoal;
      
      switch (activeGoal) {
        case 'Reduce Cart Abandonment':
        case 'Improve Checkout':
          return {
            title: 'Checkout Feedback',
            trigger: 'Visitor abandons cart',
            questions: '4',
            completion: '18 seconds',
            rate: 'High',
            color: '#6366f1'
          };
        case 'Increase Sales':
          return {
            title: 'High-Intent Engagement Survey',
            trigger: 'Scroll depth > 60% on product page',
            questions: '3',
            completion: '12 seconds',
            rate: 'Very High',
            color: '#10b981'
          };
        case 'Product Feedback':
          return {
            title: 'Product Experience Insights',
            trigger: 'Inactive for 15s post-interaction',
            questions: '3',
            completion: '15 seconds',
            rate: 'High',
            color: '#3b82f6'
          };
        case 'Customer Satisfaction':
          return {
            title: 'Immediate Customer Satisfaction',
            trigger: 'After browsing 3+ categories',
            questions: '2',
            completion: '8 seconds',
            rate: 'Very High',
            color: '#ec4899'
          };
        case 'Pricing Feedback':
          return {
            title: 'Pricing Page Friction Analysis',
            trigger: 'Hovering on pricing table exit paths',
            questions: '3',
            completion: '14 seconds',
            rate: 'Very High',
            color: '#f59e0b'
          };
        case 'Reduce Churn':
          return {
            title: 'Pre-Exit Loyalty Discovery',
            trigger: 'Navigates to cancel or billing terms',
            questions: '5',
            completion: '22 seconds',
            rate: 'Medium-High',
            color: '#ef4444'
          };
        default:
          return {
            title: 'Custom Intent Capture Survey',
            trigger: 'Exit-intent detected',
            questions: '3',
            completion: '15 seconds',
            rate: 'High',
            color: '#8b5cf6'
          };
      }
    }

    // Multiple goals selected
    return {
      title: `${selectedGoals.length}-Goal AI Optimization Survey`,
      trigger: 'Exit intent & hesitation signals',
      questions: `${Math.min(2 + selectedGoals.length, 5)}`,
      completion: `${12 + selectedGoals.length * 3} seconds`,
      rate: 'Very High',
      color: '#6366f1'
    };
  };

  // Move to step 3 by publishing the survey
  const handlePublishSurvey = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setStep(3);
    }, 1500);
  };

  // Final onboarding completion callback
  const handleGoToWorkspace = () => {
    const preview = getSurveyPreviewDetails();
    const activeGoal = selectedGoals
      .map(g => g === 'Custom Goal' ? (customGoalText || 'Custom Goal') : g)
      .join(', ') || 'Conversion Optimization';
    const selectedPlatformInfo = platforms.find(p => p.name === activePlatform) || platforms[8];

    const initialSurveyObj: Survey = {
      id: 'sv_' + Math.random().toString(36).substring(2, 9),
      title: preview.title,
      displayOption: 'Exit Intent Popup',
      headline: `Quick Feedback: ${preview.title}`,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice' as const,
          questionText: 'What was your primary goal visiting our website today?',
          options: ['Just browsing options', 'Looking for specific pricing plans', 'Need customer support', 'Ready to make a purchase']
        },
        {
          id: 'q2',
          type: 'rating' as const,
          questionText: 'How easy was it to navigate our website today?',
        },
        {
          id: 'q3',
          type: 'multiple-choice' as const,
          questionText: 'What is keeping you from continuing right now?',
          options: ['Not ready to buy yet', 'Unexpected additional costs', 'Pricing plan is unclear', 'Missing a specific feature']
        },
        {
          id: 'q4',
          type: 'text' as const,
          questionText: 'Is there anything else we could improve to earn your business?'
        }
      ].slice(0, parseInt(preview.questions)).map(q => ({
        id: q.id,
        type: q.type as 'multiple-choice' | 'rating' | 'text',
        questionText: q.questionText,
        options: q.options
      })),
      colors: {
        background: '#ffffff',
        text: '#0f172a',
        accent: preview.color,
      },
      brandingEnabled: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    const workspaceObj: Workspace = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      name: websiteUrl ? websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 'My Workspace',
      businessType: selectedPlatformInfo.type,
      url: websiteUrl || 'https://yourwebsite.com',
      goal: activeGoal,
      whiteLabel: {
        primaryColor: preview.color,
        removeBranding: false,
        logoUrl: 'sparkle'
      }
    };

    onComplete(workspaceObj, initialSurveyObj);
  };

  const currentPreview = getSurveyPreviewDetails();

  return (
    <div id="onboarding_wizard_container" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-hidden pb-12">
      
      {/* Dynamic top gradient line to show wizard momentum */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 z-50" />

      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-5 w-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-mono">
              CUSTOMER<span className="text-indigo-600">LENS</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">AI</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Setup Assistant</p>
          </div>
        </div>

        {/* 3-Step Wizard Navigation State Tracker */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className={`h-5 w-5 text-[10px] font-bold rounded-full flex items-center justify-center transition-all ${step >= 1 ? 'bg-indigo-600 text-white font-mono' : 'bg-slate-200 text-slate-400'}`}>1</span>
            <span className={`text-[11px] font-bold hidden md:inline ${step === 1 ? 'text-indigo-950 font-extrabold' : 'text-slate-400'}`}>Verify Site</span>
          </div>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-5 w-5 text-[10px] font-bold rounded-full flex items-center justify-center transition-all ${step >= 2 ? 'bg-indigo-600 text-white font-mono' : 'bg-slate-200 text-slate-400'}`}>2</span>
            <span className={`text-[11px] font-bold hidden md:inline ${step === 2 ? 'text-indigo-950 font-extrabold' : 'text-slate-400'}`}>Configure Survey</span>
          </div>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-5 w-5 text-[10px] font-bold rounded-full flex items-center justify-center transition-all ${step >= 3 ? 'bg-indigo-600 text-white font-mono' : 'bg-slate-200 text-slate-400'}`}>3</span>
            <span className={`text-[11px] font-bold hidden md:inline ${step === 3 ? 'text-indigo-950 font-extrabold' : 'text-slate-400'}`}>Launch Live</span>
          </div>
        </div>

        <div>
          <button 
            onClick={onBack}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-transparent cursor-pointer"
          >
            <ArrowLeft size={13} /> Exit Setup
          </button>
        </div>
      </header>

      {/* STEP CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CONNECT & VERIFY */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Form: URL & Integrations */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
                <div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Step 1 of 3</span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-2 tracking-tight">Connect & Verify Your Website</h2>
                  <p className="text-xs text-slate-500 mt-1">Connect CustomerLens AI to your website in under 2 minutes.</p>
                </div>

                {/* Input block */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">Enter your website</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe size={16} />
                    </div>
                    <input 
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                      }}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold transition-all shadow-inner focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>

                {/* Platform select options */}
                <div className="space-y-2.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">or connect with</span>
                  <div className="grid grid-cols-3 gap-2">
                    {platforms.map((plat) => (
                      <button
                        key={plat.name}
                        onClick={() => handlePlatformSelect(plat)}
                        className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          activePlatform === plat.name 
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        <span className="text-base leading-none">{plat.icon}</span>
                        <span className="truncate max-w-full font-mono text-[10px]">{plat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verify Ownership Block */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Verify Ownership</h3>
                    <p className="text-[11px] text-slate-500">To protect your website, CustomerLens AI verifies that you own the domain.</p>
                  </div>

                  {/* Method Tabs */}
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-150">
                    <button
                      onClick={() => setVerifyMethod('script')}
                      className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${verifyMethod === 'script' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      ✓ Recommended Script
                    </button>
                    <button
                      onClick={() => setVerifyMethod('dns')}
                      className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${verifyMethod === 'dns' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      • DNS Record
                    </button>
                    <button
                      onClick={() => setVerifyMethod('meta')}
                      className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${verifyMethod === 'meta' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      • Meta Tag
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {verifyMethod === 'script' && (
                      <motion.div
                        key="method-script"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-600">Install the CustomerLens AI script</span>
                          <button
                            onClick={handleCopyCode}
                            className="text-indigo-600 hover:text-indigo-700 font-extrabold flex items-center gap-1 transition-colors bg-indigo-50 px-2 py-0.5 rounded cursor-pointer text-[10px]"
                          >
                            <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-slate-950 text-slate-300 p-3.5 rounded-xl text-[10px] font-mono overflow-x-auto border border-slate-800 leading-normal shadow-sm">
{`<script
src="https://cdn.customerlens.ai/customerlens.js"
data-site-id="cl_live_x8K29P4">
</script>`}
                        </pre>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Paste this script in your header or footer before the closing tag on your page.</p>
                      </motion.div>
                    )}

                    {verifyMethod === 'dns' && (
                      <motion.div
                        key="method-dns"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[11px] space-y-2"
                      >
                        <p className="text-slate-600">Add a TXT record to your DNS configuration matching this verification token:</p>
                        <div className="bg-white p-2 border border-slate-200 rounded font-mono text-[10px] select-all font-bold text-slate-800">
                          customerlens-site-verification=cl_live_x8K29P4
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold font-mono">TTL: 3600 | Host: @ or root</p>
                      </motion.div>
                    )}

                    {verifyMethod === 'meta' && (
                      <motion.div
                        key="method-meta"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[11px] space-y-2"
                      >
                        <p className="text-slate-600">Paste the following meta tag into your website's HTML home page header <code className="bg-slate-150 px-1 py-0.5 rounded font-mono font-bold text-rose-600">&lt;head&gt;</code> block:</p>
                        <div className="bg-white p-2 border border-slate-200 rounded font-mono text-[10px] select-all font-bold text-slate-800">
                          {`<meta name="customerlens-site-verification" content="cl_live_x8K29P4" />`}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Detect & run verify */}
                  <button
                    onClick={triggerVerificationFlow}
                    disabled={isVerifying || progressIndex === connectionProgressItems.length}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="animate-spin h-3.5 w-3.5" /> Detecting active site tags...
                      </>
                    ) : progressIndex === connectionProgressItems.length ? (
                      <>✓ Installation Verified & Active</>
                    ) : (
                      <>Verify Script & Connection Status</>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Connection Progress Logs */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-lg">🤖</span>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-widest font-mono">AI Connection Progress</h3>
                </div>

                <div className="space-y-3.5 py-1">
                  {connectionProgressItems.map((item, index) => {
                    const isChecked = progressIndex > index || progressIndex === connectionProgressItems.length;
                    const isActive = progressIndex === index;
                    const isPending = progressIndex < index && !isVerifying;

                    return (
                      <div 
                        key={item} 
                        className={`flex items-center gap-3 transition-all duration-300 ${
                          isChecked ? 'text-indigo-900 font-extrabold' : isActive ? 'text-indigo-600 font-bold scale-[1.01]' : 'text-slate-400'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] transition-all border ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : isActive 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600 animate-pulse'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}>
                          {isChecked ? (
                            <Check size={11} strokeWidth={3} />
                          ) : isActive ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <span className="font-mono text-[9px] font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span className="text-xs tracking-tight">{item}</span>
                      </div>
                    );
                  })}
                </div>

                {progressIndex === connectionProgressItems.length && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-1.5"
                  >
                    <p className="text-emerald-900 text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1">
                      <span>🟢 Connection Activated</span>
                    </p>
                    <p className="text-emerald-700 text-[11px] leading-relaxed font-semibold">
                      CustomerLens AI is now learning your website and will continuously understand visitor behavior as customers interact with your site.
                    </p>
                  </motion.div>
                )}

                <button
                  onClick={() => {
                    setProgressIndex(connectionProgressItems.length);
                    setStep(2);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-indigo-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Connect & Continue to Survey Setup <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CREATE AI SURVEY */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Choose Goals */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Step 2 of 3</span>
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-mono">
                      {selectedGoals.length} {selectedGoals.length === 1 ? 'goal' : 'goals'} selected
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight">Select Conversion Goals</h2>
                  <p className="text-xs text-slate-500 mt-1">Select one or multiple goals. AI generates a survey for each.</p>
                </div>

                {/* Multiple choice goal selection grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {goalOptions.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`text-left p-3 rounded-2xl border-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/25 text-indigo-950 shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm bg-slate-50 p-1 rounded-xl border border-slate-100">{goal.icon}</span>
                          <span className="font-semibold tracking-tight text-[11px]">{goal.label}</span>
                        </div>
                        <div className={`h-4 w-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedGoals.includes('Custom Goal') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Describe your custom target goal</label>
                    <input 
                      type="text"
                      placeholder="e.g., Identify navigation friction on pricing page"
                      value={customGoalText}
                      onChange={(e) => setCustomGoalText(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold transition-all shadow-inner outline-none"
                    />
                  </motion.div>
                )}

                {/* AI Creates Section */}
                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">AI Automatically Configures</span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    {[
                      'Optimal question set',
                      'Intent exit trigger',
                      'Brand color match',
                      'Targeting logic'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="text-emerald-500 font-extrabold text-xs">✓</span>
                        <span className="text-[10.5px] tracking-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation row */}
                <div className="flex justify-between items-center pt-2 gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Back to Setup
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-150 flex items-center gap-1.5 cursor-pointer"
                  >
                    Continue to Review & Launch <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Right Column: AI Generated Surveys List & Live Previews */}
              <div className="lg:col-span-7 space-y-4">
                {/* AI Generated Surveys Header & Natural Language Command Assistant Bar */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 text-base">✨</span>
                      <div>
                        <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-200 font-mono">
                          AI Generated Surveys ({generatedSurveys.length})
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">Ask AI to edit, unify design, or customize all surveys</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1 self-start sm:self-auto">
                      <Sparkles size={11} className="text-indigo-400" /> AI Assistant Active
                    </span>
                  </div>

                  {/* AI Natural Language Prompt Box */}
                  <div className="relative flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
                        <Wand2 size={13} />
                      </div>
                      <input
                        type="text"
                        value={aiCommandInput}
                        onChange={(e) => setAiCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleRunAiCommand();
                          }
                        }}
                        placeholder='Ask AI e.g. "Make design consistent in all surveys", "Change color to emerald"...'
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-750 focus:border-indigo-500 text-slate-100 rounded-xl text-xs placeholder:text-slate-500 outline-none transition-all shadow-inner font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isExecutingAiCommand || !aiCommandInput.trim()}
                      onClick={() => handleRunAiCommand()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isExecutingAiCommand ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Working...</span>
                        </>
                      ) : (
                        <>
                          <span>Apply AI</span>
                          <ArrowRight size={12} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Quick Preset Action Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase mr-1">Quick Actions:</span>
                    <button
                      type="button"
                      onClick={() => handleRunAiCommand('Make design consistent in all surveys')}
                      className="bg-slate-800 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-700 text-slate-300 hover:text-indigo-200 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      🎨 Make Design Consistent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunAiCommand('Change accent color to emerald green')}
                      className="bg-slate-800 hover:bg-emerald-950 hover:border-emerald-500/50 border border-slate-700 text-slate-300 hover:text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      💚 Emerald Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunAiCommand('Shorten questions and headlines')}
                      className="bg-slate-800 hover:bg-amber-950 hover:border-amber-500/50 border border-slate-700 text-slate-300 hover:text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      ⚡ Shorten Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunAiCommand('Add 15% discount promo code option')}
                      className="bg-slate-800 hover:bg-purple-950 hover:border-purple-500/50 border border-slate-700 text-slate-300 hover:text-purple-200 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      🎁 Add Discount Promo
                    </button>
                  </div>

                  {/* AI Execution Feedback Notification */}
                  {aiCommandFeedback && (
                    <div className="bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 text-[11px] p-2.5 rounded-xl flex items-center justify-between font-mono font-medium">
                      <span>{aiCommandFeedback}</span>
                      <button
                        onClick={() => setAiCommandFeedback(null)}
                        className="text-indigo-400 hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Survey Cards */}
                <div className="space-y-4">
                  {generatedSurveys.map((srv) => (
                    <div 
                      key={srv.id} 
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative"
                    >
                      {/* Card Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xl p-2 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">{srv.goalIcon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 text-sm tracking-tight">{srv.title}</h4>
                              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
                                {srv.goalLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                              <span className="text-slate-400 font-mono">Trigger:</span> {srv.trigger}
                            </p>
                          </div>
                        </div>

                        {/* Preview option button (down chevron opens preview) */}
                        <button
                          type="button"
                          onClick={() => toggleSurveyPreview(srv.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            srv.isExpanded 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Eye size={13} />
                          <span>{srv.isExpanded ? 'Hide Preview' : 'Preview Survey'}</span>
                          {srv.isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {/* Expandable Live Survey Preview Panel */}
                      <AnimatePresence>
                        {srv.isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-1 overflow-hidden"
                          >
                            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-inner space-y-3 relative">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Live Exit-Intent Overlay Preview</span>
                                </div>
                                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                                  {srv.sizePosition}
                                </span>
                              </div>

                              {/* Interactive Mock Survey Card */}
                              <div 
                                className="bg-white text-slate-900 p-4 rounded-xl shadow-lg space-y-3 relative border border-slate-100"
                                style={{ borderTop: `4px solid ${srv.accentColor}` }}
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    {srv.logoUrl ? (
                                      <img 
                                        src={srv.logoUrl} 
                                        alt="Brand Logo" 
                                        className="h-6 w-6 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shadow-sm"
                                      />
                                    ) : (
                                      <div 
                                        className="h-6 w-6 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                                        style={{ backgroundColor: srv.accentColor }}
                                      >
                                        {srv.logoDoodle}
                                      </div>
                                    )}
                                    <h5 className="text-[11px] font-extrabold text-slate-900">{srv.headline}</h5>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-mono">1 of {srv.questionsCount}</span>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-[11.5px] font-bold text-slate-800 leading-snug">{srv.questionText}</p>
                                  <div className="space-y-1.5">
                                    {srv.options.map((opt, i) => (
                                      <div 
                                        key={i}
                                        className={`p-2 rounded-lg text-[10px] font-bold flex items-center justify-between border transition-all ${
                                          i === 0 
                                            ? 'border-indigo-200 bg-indigo-50/60 text-indigo-950' 
                                            : 'border-slate-100 bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        <span className="text-slate-300">{i === 0 ? '●' : '○'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* EDIT BUTTON in the Bottom Right Corner of Each Preview */}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                  <span className="text-[8px] text-slate-400 font-mono">Powered by CustomerLens AI</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSurvey(srv)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-all shadow flex items-center gap-1 cursor-pointer transform hover:scale-105"
                                  >
                                    <Edit3 size={11} /> Edit Survey
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW & PUBLISH ALL SURVEYS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {!publishComplete ? (
                /* Step 3 Pre-Publish Review State */
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Step 3 of 3</span>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-2 tracking-tight">Review & Launch AI Surveys</h2>
                      <p className="text-xs text-slate-500 mt-1">Deploy your AI surveys directly to your website script in one click.</p>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      ← Back to Edit
                    </button>
                  </div>

                  {/* Summary List of Generated Surveys */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Surveys Ready for Deployment ({generatedSurveys.length})</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {generatedSurveys.map((srv) => (
                        <div key={srv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg p-1.5 bg-white rounded-xl border border-slate-200">{srv.goalIcon}</span>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-xs">{srv.title}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">{srv.trigger}</p>
                            </div>
                          </div>
                          <span className="text-emerald-600 bg-emerald-50 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                            Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Big Publish Trigger Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-3">
                    <button
                      onClick={handlePublishSurvey}
                      disabled={isPublishing}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isPublishing ? (
                        <>
                          <RefreshCw className="animate-spin h-4 w-4" /> Deploying Script & Publishing Surveys...
                        </>
                      ) : (
                        <>
                          🚀 Publish All ({generatedSurveys.length}) AI Surveys <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 font-medium">Surveys will immediately trigger for website visitors based on AI exit behavior.</p>
                  </div>
                </div>
              ) : (
                /* Step 3 Post-Publish Completion State */
                <div className="space-y-6">
                  {/* Header Box */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 justify-between shadow-sm">
                    <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                      <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white shrink-0 animate-bounce">
                        🎉
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">CustomerLens AI Is Live</h2>
                        <h3 className="font-extrabold text-emerald-800 text-sm">Setup Complete!</h3>
                        <p className="text-slate-600 text-xs">Your website is connected and your {generatedSurveys.length} AI surveys are live.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleGoToWorkspace}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-150 shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      Go to Workspace <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Status and Activity lists Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Workspace Status */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-widest font-mono">Workspace Status</h3>
                      </div>

                      <div className="space-y-3 font-medium text-xs text-slate-700">
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-500 text-xs shrink-0">🟢</span>
                          <span>Website Connected</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-500 text-xs shrink-0">🟢</span>
                          <span>Domain Verified</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-500 text-xs shrink-0">🟢</span>
                          <span>CustomerLens AI Active</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-500 text-xs shrink-0">🟢</span>
                          <span>{generatedSurveys.length} Surveys Published</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-500 text-xs shrink-0">🟢</span>
                          <span>Behavior Tracking Enabled</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Activity */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="text-indigo-600">🤖</span>
                        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-widest font-mono">AI Activity</h3>
                      </div>

                      <div className="space-y-3 font-medium text-xs text-slate-700">
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 leading-none">🤖</span>
                          <span>Monitoring visitor behavior</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 leading-none">🤖</span>
                          <span>Detecting hesitation, exits, and conversions</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0 leading-none">🤖</span>
                          <span>Learning customer intent</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Big central complete wizard trigger button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleGoToWorkspace}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Go to Workspace <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* EDIT SURVEY CUSTOMIZER MODAL */}
      <AnimatePresence>
        {editingSurvey && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 relative my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg">
                    {editingSurvey.goalIcon}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Edit AI Survey</h3>
                    <span className="text-xs text-slate-500 font-medium">{editingSurvey.goalLabel}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSurvey(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
                {/* Brand Color Accent & Picker */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono flex items-center gap-1.5">
                      <Pipette size={12} className="text-indigo-600" /> Primary Brand Color Accent
                    </label>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{editingSurvey.accentColor}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#1e293b'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingSurvey({ ...editingSurvey, accentColor: color })}
                        className={`h-7 w-7 rounded-full transition-transform cursor-pointer border border-white/40 shadow-sm ${
                          editingSurvey.accentColor === color ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}

                    {/* Native HTML Color Dropper Picker */}
                    <div className="relative flex items-center gap-1.5 pl-2 border-l border-slate-200">
                      <label 
                        title="Pick custom brand color using color dropper"
                        className="h-8 w-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center cursor-pointer shadow-sm hover:border-indigo-400 transition-all text-slate-700 overflow-hidden"
                        style={{ borderColor: editingSurvey.accentColor }}
                      >
                        <Pipette size={14} style={{ color: editingSurvey.accentColor }} />
                        <input
                          type="color"
                          value={editingSurvey.accentColor.startsWith('#') ? editingSurvey.accentColor : '#6366f1'}
                          onChange={(e) => setEditingSurvey({ ...editingSurvey, accentColor: e.target.value })}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={editingSurvey.accentColor}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, accentColor: e.target.value })}
                        placeholder="#6366f1"
                        className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Brand Logo Image Upload & URL */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-indigo-600" /> Own Brand Logo Image
                    </label>
                    {editingSurvey.logoUrl && (
                      <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Custom Logo Active
                      </span>
                    )}
                  </div>

                  {/* Logo Preview & Upload Row */}
                  {editingSurvey.logoUrl ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={editingSurvey.logoUrl} 
                          alt="Custom Brand Logo" 
                          className="h-8 w-8 rounded-lg object-contain bg-slate-50 border border-slate-150 p-0.5"
                        />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800">Custom Logo Loaded</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[180px]">{editingSurvey.logoUrl}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingSurvey({ ...editingSurvey, logoUrl: undefined })}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Remove custom logo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        {/* File Upload Button */}
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-700 cursor-pointer transition-all shadow-sm">
                          <Upload size={13} className="text-indigo-600" />
                          <span className="text-[11px] font-bold">Upload Logo File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  const result = evt.target?.result as string;
                                  if (result) {
                                    setEditingSurvey({ ...editingSurvey, logoUrl: result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Direct Logo URL Option */}
                      <input
                        type="text"
                        placeholder="Or paste image URL (e.g., https://yourdomain.com/logo.png)"
                        value={editingSurvey.logoUrl || ''}
                        onChange={(e) => setEditingSurvey({ ...editingSurvey, logoUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Custom Doodle / Icon Option */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                    Brand Doodle / Emoji Icon
                  </label>
                  
                  <div className="flex flex-wrap gap-2">
                    {['✨', '🛍', '🛒', '⚡', '🎯', '💎', '😊', '🚀', '🔥', '💡'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditingSurvey({ ...editingSurvey, logoDoodle: icon, logoUrl: undefined })}
                        className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                          !editingSurvey.logoUrl && editingSurvey.logoDoodle === icon 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-100'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* Custom Doodle Text Input */}
                  <div className="pt-1.5">
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Doodle Text / Character</label>
                    <input
                      type="text"
                      placeholder="Type custom doodle e.g. 🦊 or CS"
                      value={editingSurvey.logoDoodle}
                      onChange={(e) => setEditingSurvey({ ...editingSurvey, logoDoodle: e.target.value, logoUrl: undefined })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Size & Position */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono mb-2">
                    Widget Size & Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Bottom Right Widget',
                      'Compact Center Modal',
                      'Full Center Modal',
                      'Bottom Banner'
                    ].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setEditingSurvey({ ...editingSurvey, sizePosition: pos as any })}
                        className={`p-2.5 rounded-xl border text-left text-[11px] font-bold transition-all cursor-pointer ${
                          editingSurvey.sizePosition === pos ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Survey Headline */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono mb-1">
                    Survey Headline
                  </label>
                  <input
                    type="text"
                    value={editingSurvey.headline}
                    onChange={(e) => setEditingSurvey({ ...editingSurvey, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono mb-1">
                    Main Question Text
                  </label>
                  <input
                    type="text"
                    value={editingSurvey.questionText}
                    onChange={(e) => setEditingSurvey({ ...editingSurvey, questionText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSurvey(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedSurveys(prev =>
                      prev.map(s => (s.id === editingSurvey.id ? editingSurvey : s))
                    );
                    setEditingSurvey(null);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer"
                >
                  Save Customizations
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
