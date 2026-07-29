import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPageInfographic from './LandingPageInfographic';
import { 
  Sprout, 
  Beer, 
  Download, 
  Users, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Eye,
  ArrowRight, 
  Mail, 
  MapPin, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  X, 
  Send,
  MessageSquare,
  Compass,
  CheckCircle2,
  Lock,
  Globe,
  Search,
  ThumbsDown,
  Frown,
  Heart,
  Smile,
  User,
  TrendingUp,
  HelpCircle,
  Tag,
  Star,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'register' | 'forgot' | 'dashboard') => void;
  onLaunchDemo: () => void;
  onGetStartedFree: () => void;
  onTriggerAISurvey?: (reason: string) => void;
  isLoggedIn?: boolean;
  hasWorkspace?: boolean;
  userEmail?: string;
}

interface Project {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  tag?: string;
  stats?: string;
}

interface PayPalSmartButtonProps {
  planId: 'starter' | 'pro' | 'advance' | 'premium' | string;
  onSuccess?: () => void;
  onError?: (err?: any) => void;
}

function PayPalSmartButton({ planId, onSuccess, onError }: PayPalSmartButtonProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const AI_URL = "https://customerlens-ai.sangeeta-codes.workers.dev";
    const mappedPlan = planId === 'advance' ? 'starter' : planId === 'premium' ? 'pro' : planId;

    const initPayPal = async () => {
      let attempts = 0;
      while (typeof (window as any).paypal === 'undefined' && attempts < 20) {
        await new Promise((r) => setTimeout(r, 200));
        attempts++;
      }

      if (!isMounted || !containerRef.current) return;

      const paypal = (window as any).paypal;
      if (typeof paypal !== 'undefined' && containerRef.current) {
        containerRef.current.innerHTML = '';
        try {
          paypal.Buttons({
            createOrder: async function() {
              try {
                let res = await fetch(AI_URL + "/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ plan_id: mappedPlan })
                });
                if (!res.ok) {
                  res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan_id: mappedPlan })
                  });
                }
                const data = await res.json();
                if (data.error) {
                  if (isMounted) setErrorMsg(data.error);
                  if (onError) onError(data.error);
                  return;
                }
                return data.order_id;
              } catch (err) {
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ plan_id: mappedPlan })
                });
                const data = await res.json();
                return data.order_id;
              }
            },
            onApprove: async function(data: any) {
              try {
                let res = await fetch(AI_URL + "/api/paypal/capture", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ order_id: data.orderID })
                });
                if (!res.ok) {
                  res = await fetch("/api/paypal/capture", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order_id: data.orderID })
                  });
                }
                const result = await res.json();
                if (result.status === "COMPLETED") {
                  if (isMounted) {
                    setSuccess(true);
                    setErrorMsg('');
                  }
                  if (onSuccess) onSuccess();
                } else {
                  if (isMounted) setErrorMsg('Payment unverified. Please try again.');
                  if (onError) onError();
                }
              } catch (e) {
                if (isMounted) setSuccess(true);
                if (onSuccess) onSuccess();
              }
            },
            onError: function(err: any) {
              if (isMounted) setErrorMsg('Payment process encountered an issue. Please try again.');
              if (onError) onError(err);
            }
          }).render(containerRef.current);
          if (isMounted) setLoading(false);
        } catch (e) {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    initPayPal();

    return () => {
      isMounted = false;
    };
  }, [planId]);

  return (
    <div className="w-full space-y-2">
      {success ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
          ✅ Payment successful! Your plan is now active.
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium text-center">
              ❌ {errorMsg}
            </div>
          )}
          <div ref={containerRef} className="cl-paypal-btn min-h-[50px] w-full" />
        </>
      )}
    </div>
  );
}

export default function LandingPage({ isLoggedIn, hasWorkspace, userEmail, onNavigate, onLaunchDemo, onGetStartedFree, onTriggerAISurvey }: LandingPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; category: string; content: string; date: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  // PayPal Checkout State
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<{ id: string; name: string; price: number; isTrial?: boolean } | null>(null);
  const [paypalCheckoutSuccess, setPaypalCheckoutSuccess] = useState(false);
  const [simulatedPaying, setSimulatedPaying] = useState(false);
  const [paypalSimStep, setPaypalSimStep] = useState<'details' | 'login' | 'review' | 'success'>('details');
  const [paypalUserEmail, setPaypalUserEmail] = useState('');
  const [paypalUserPassword, setPaypalUserPassword] = useState('');
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [checkoutDiscountApplied, setCheckoutDiscountApplied] = useState(false);
  const [checkoutCouponError, setCheckoutCouponError] = useState('');

  // Auto-detect if user completed the survey and pre-apply 15% discount
  useEffect(() => {
    if (activeCheckoutPlan) {
      const savedCode = localStorage.getItem('cl_survey_completed_code');
      if (savedCode) {
        setCheckoutCouponCode(savedCode);
        setCheckoutDiscountApplied(true);
        setCheckoutCouponError('');
      } else {
        // Reset states on fresh open if no saved code
        setCheckoutCouponCode('');
        setCheckoutDiscountApplied(false);
        setCheckoutCouponError('');
      }
    }
  }, [activeCheckoutPlan]);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Interactive Survey Slides state
  const [surveySlideIndex, setSurveySlideIndex] = useState(0);
  const [surveyAnswerOne, setSurveyAnswerOne] = useState<string | null>(null);
  const [surveyAnswerHear, setSurveyAnswerHear] = useState<string | null>(null);
  const [surveyEmail, setSurveyEmail] = useState('');
  const [surveyCopied, setSurveyCopied] = useState(false);
  const [activeAboutFaq, setActiveAboutFaq] = useState<number | null>(null);

  // New Chat States for Dynamic Survey Follow-up
  const [chatMessages, setChatMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Custom user input for "Other" options in the interactive survey
  const [customHearText, setCustomHearText] = useState('');
  const [customHesitationText, setCustomHesitationText] = useState('');

  // Landing Page Website Analyzer Playground State
  const [playgroundUrl, setPlaygroundUrl] = useState('');
  const [playgroundCategory, setPlaygroundCategory] = useState('SaaS');
  const [playgroundIsAnalyzing, setPlaygroundIsAnalyzing] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any | null>(null);
  const [playgroundError, setPlaygroundError] = useState('');

  const handleAnalyzePlayground = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundUrl.trim()) return;
    setPlaygroundIsAnalyzing(true);
    setPlaygroundError('');
    setPlaygroundResult(null);

    try {
      const response = await fetch('/api/ai/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: playgroundUrl,
          businessType: playgroundCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setPlaygroundResult(data);
    } catch (err) {
      console.error(err);
      setPlaygroundError('Something went wrong during the analysis. Please check the URL and try again.');
    } finally {
      setPlaygroundIsAnalyzing(false);
    }
  };

  const isCurrentSlideCompleted = () => {
    if (surveySlideIndex === 0) {
      return !!surveyAnswerHear && surveyAnswerHear !== "Other? Let us know!";
    }
    if (surveySlideIndex === 1) {
      return !!surveyAnswerOne && surveyAnswerOne !== "other";
    }
    if (surveySlideIndex === 2) return chatMessages.some(m => m.sender === 'user');
    if (surveySlideIndex === 3) return !!surveyEmail.trim() && surveyEmail.includes('@');
    return true;
  };

  const handleSelectOption = (optionLabel: string, followUp: string) => {
    setSurveyAnswerOne(optionLabel);
    setChatMessages([
      { sender: 'ai', text: followUp }
    ]);
    setSurveySlideIndex(2);
  };

  useEffect(() => {
    const isEngaged = !!(
      selectedProject || 
      selectedArticle || 
      activeCheckoutPlan || 
      playgroundIsAnalyzing || 
      playgroundResult || 
      surveySlideIndex > 0 ||
      contactName ||
      contactEmail ||
      contactMessage ||
      emailInput
    );
    (window as any).cl_is_user_actively_engaged = isEngaged;
  }, [
    selectedProject, 
    selectedArticle, 
    activeCheckoutPlan, 
    playgroundIsAnalyzing, 
    playgroundResult, 
    surveySlideIndex,
    contactName,
    contactEmail,
    contactMessage,
    emailInput
  ]);

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatTyping) return;

    const userText = chatInput.trim();
    setChatInput('');
    
    const updatedMessages = [...chatMessages, { sender: 'user' as const, text: userText }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);

    try {
      const response = await fetch('/api/ai/survey-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          option: surveyAnswerOne,
          history: updatedMessages,
          newMessage: userText
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (err) {
      console.error('Error during survey chat:', err);
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "I appreciate you sharing that! CustomerLens is completely committed to helping you understand your visitors. Let me know if there's anything else I can clarify." 
      }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const projects: Project[] = [
    {
      id: 'customerlens',
      name: 'CUSTOMERLENS',
      category: 'FLAGSHIP CRO SAAS',
      type: 'SAAS APPLICATION',
      description: 'Engineered for entrepreneurs to make smart decisions. Features advanced self-service exit-intent cursor tracking, live-simulator customer feedback modals, and server-side Gemini AI model loops for absolute strategic clarity.',
      icon: Eye,
      color: 'bg-indigo-600 text-white',
      tag: 'NEW FLAGSHIP',
      stats: '⚡ 4.2% Conversion Boost Avg'
    },
    {
      id: 'the-43rd-prairie',
      name: 'THE 43RD PRAIRIE',
      category: 'CONSERVATION PROJECT',
      type: 'ENVIRONMENTAL LAND',
      description: '54 acres of former cropland in Hutchinson that is being painstakingly restored to native tallgrass prairie and wildflower sanctuary.',
      icon: Sprout,
      color: 'bg-emerald-600 text-white',
      tag: 'ACTIVE RESTORATION',
      stats: '🌱 54 Acres Protected'
    },
    {
      id: 'stonebridge-park',
      name: 'STONEBRIDGE PARK',
      category: 'CONSERVATION PROJECT',
      type: 'GREEN SPACE',
      description: 'A beautiful 3-acre urban greenspace located within a Kansas neighborhood, providing local wildlife shelter and native oak woodlands.',
      icon: Sprout,
      color: 'bg-teal-600 text-white',
      tag: 'COMPLETED',
      stats: '🌳 3-Acre Reserve'
    },
    {
      id: 'sandhills-brewing',
      name: 'SANDHILLS BREWING',
      category: 'MICROBREWERY',
      type: 'CRAFT BREWING',
      description: 'Central Kansas craft brewery focusing on barrel-aged wild ales, bringing community together through authentic local hospitality.',
      icon: Beer,
      color: 'bg-amber-600 text-white',
      tag: 'COMMUNITY FAVORITE',
      stats: '🍺 4.8★ Untappd Rating'
    },
    {
      id: 'payouts-service',
      name: 'PAYOUTS SERVICE',
      category: 'ECOMMERCE SERVICE',
      type: 'FINTECH PLATFORM',
      description: 'Automated merchant payouts. Securely manages payment disbursements for thousands of affiliates, digital creators, and retail vendors.',
      icon: CreditCard,
      color: 'bg-blue-600 text-white',
      tag: 'PROJECT ACQUIRED',
      stats: '💳 $120M+ Disbursed'
    },
    {
      id: 'affiliatewp',
      name: 'AFFILIATEWP',
      category: 'WORDPRESS PLUGIN',
      type: 'MARKETING ENGINE',
      description: 'A top-tier, industry-leading affiliate program management platform built directly for WordPress and WooCommerce store integrations.',
      icon: Users,
      color: 'bg-red-500 text-white',
      tag: 'PROJECT ACQUIRED',
      stats: '📈 45,000+ Active Sites'
    },
    {
      id: 'easy-digital-downloads',
      name: 'EASY DIGITAL DOWNLOADS',
      category: 'WORDPRESS PLUGIN',
      type: 'ECOMMERCE PLUG',
      description: 'The standard WordPress eCommerce framework specialized in selling digital products, downloadable materials, eBooks, and media.',
      icon: Download,
      color: 'bg-sky-500 text-white',
      tag: 'PROJECT ACQUIRED',
      stats: '📥 1.2M+ Downloads'
    },
    {
      id: 'sugar-calendar',
      name: 'SUGAR CALENDAR',
      category: 'WORDPRESS PLUGIN',
      type: 'CALENDAR SCHEDULER',
      description: 'A beautifully clean, lightweight, and simple event scheduling plugin optimized for modern WordPress publication layouts.',
      icon: Calendar,
      color: 'bg-orange-500 text-white',
      tag: 'PROJECT ACQUIRED',
      stats: '📅 12,000+ Event Admins'
    },
    {
      id: 'wp-simple-pay',
      name: 'WP SIMPLE PAY',
      category: 'WORDPRESS PLUGIN',
      type: 'STRIPE GATEWAY',
      description: 'The easiest way to accept Stripe credit cards and instant one-time payments on WordPress without setting up full carts.',
      icon: DollarSign,
      color: 'bg-blue-500 text-white',
      tag: 'PROJECT ACQUIRED',
      stats: '💸 80,000+ Active Users'
    },
    {
      id: 'restrict-content-pro',
      name: 'RESTRICT CONTENT PRO',
      category: 'WORDPRESS PLUGIN',
      type: 'MEMBERSHIP ENGINE',
      description: 'A comprehensive, powerful role-based restriction and premium content subscription manager plugin for publishers.',
      icon: ShieldCheck,
      color: 'bg-purple-600 text-white',
      tag: 'PROJECT ACQUIRED',
      stats: '🔒 20,000+ Paid Clubs'
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setEmailInput('');
      }, 5000);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      }, 5000);
    }
  };

  const blogArticles = [
    {
      title: 'AWESOME MOTIVE HAS ACQUIRED OUR WORDPRESS PRODUCTS AND SERVICES',
      category: 'ACQUISITION BULLETIN',
      date: 'July 11, 2026',
      content: `Today is a momentous milestone for Sandhills Development. We are incredibly excited to share that our entire suite of WordPress products—including Easy Digital Downloads, AffiliateWP, WP Simple Pay, Sugar Calendar, and Restrict Content Pro—along with their stellar development, support, and marketing teams, have officially joined the Awesome Motive family!

Our journey building these plugins started with a simple belief: that creators deserve tools crafted with passion, absolute reliability, and absolute focus on user experience. Finding a partner who shares this philosophy was our highest priority. Awesome Motive has an outstanding track record of scaling WordPress software while keeping customers and communities at the absolute center of their focus.

Pippin Williamson reflects on this transition: 
"We built Sandhills to be a engine of craftsmanship and human-centric software. As these plugins grew, they required a larger scale of operations to reach their true global potential. Awesome Motive is uniquely positioned to carry this torch forward, letting the rest of Sandhills focus on conservation projects, local craft initiatives, and pioneering new SaaS technologies like CustomerLens."

What this means for existing customers:
All premium licensing, support agreements, and ongoing development will continue seamlessly without any interruptions. The teams you know and love are transitioning over as full-time stewards of these tools under Awesome Motive's premier infrastructure.

What's next for Sandhills Development:
Sandhills is returning to its roots—crafting localized physical projects like Sandhills Brewing, nurturing native wildlands at The 43rd Prairie, and funding pioneering indie-SaaS platforms like CustomerLens. We thank you from the bottom of our hearts for your trust over the last decade!`
    },
    {
      title: 'A 4-DAY WORK WEEK EXPERIMENT: THREE YEARS LATER',
      category: 'OPERATIONS',
      date: 'May 14, 2026',
      content: `Three years ago, Sandhills Development transitioned all staff to a standard 32-hour, 4-day work week (Monday through Thursday) with absolutely zero reduction in pay. 

In this retrospective, we review the hard metrics. Productivity did not drop; in fact, the quality of our code releases increased by 19% as fatigue-related bugs plummeted. More importantly, employee retention hit an all-time high of 100%, and team members report feeling more connected, rested, and motivated. 

We believe that human beings do not produce creative masterpieces by grinding. Creative energy is a finite well that must be replenished. Cultivating gardens, spending time with families, and enjoying nature on Fridays is what powers our engineering ingenuity.`
    },
    {
      title: 'TREES FOR THE LONG-TERM: NATIVE OAK RESTORATION',
      category: 'CONSERVATION',
      date: 'March 20, 2026',
      content: `This month, the Sandhills Conservation team planted over 400 native burr oak, post oak, and pecan saplings across the Stonebridge greenspace and The 43rd Prairie boundary lines.

Native trees are critical buffers against heavy soil erosion and act as essential nesting zones for local migratory birds. We choose slow-growing, resilient hardwood species because we design for the next century, not just the next fiscal quarter.`
    },
    {
      title: '2026 YEAR IN REVIEW: RECONCILING CRAFT AND SCALE',
      category: 'ANNUAL REPORT',
      date: 'January 2, 2026',
      content: `A comprehensive breakdown of Sandhills Development’s annual performance. We look at financial health, environmental offsets, customer satisfaction ratios, and gallons of wild barrel-aged ales brewed in our Hutchinson facility. We continue to prove that sustainable, localized business models can comfortably thrive while dedicating over 30% of profits directly to environmental conservation efforts.`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. HERO HEADER SEGMENT (Dark Premium Geometric Grid Background) */}
      <section className="bg-slate-950 text-white relative overflow-hidden pt-10 pb-44 md:pt-14 md:pb-60 min-h-[85vh] flex flex-col justify-between border-b border-slate-900">
        
        {/* Geometric Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Glowing Ambient Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

        {/* Abstract CSS Starry Field on Grid */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
          <div className="absolute top-24 left-3/4 w-1.5 h-1.5 bg-sky-300 rounded-full animate-ping [animation-duration:4s]" />
          <div className="absolute top-48 left-1/3 w-0.5 h-0.5 bg-indigo-100 rounded-full" />
          <div className="absolute top-72 left-2/3 w-1 h-1 bg-white rounded-full animate-pulse [animation-duration:3s]" />
          <div className="absolute top-1/2 left-10 w-1.5 h-1.5 bg-blue-300 rounded-full" />
          <div className="absolute top-2/3 left-4/5 w-0.5 h-0.5 bg-white rounded-full" />
          <div className="absolute top-10 right-20 w-1 h-1 bg-indigo-200 rounded-full" />
        </div>

        {/* Top Navbar */}
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white text-[#111e35] flex items-center justify-center font-extrabold text-xl shadow-lg border border-white/20">
              CL
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-widest block text-white font-mono">CUSTOMERLENS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-white transition-colors">ABOUT US</a>
            <a href="#contact" className="hover:text-white transition-colors">CONTACT</a>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative group">
                <button 
                  id="btn_landing_google_profile"
                  onClick={() => onNavigate('dashboard')}
                  className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-[1.5px] hover:scale-110 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer"
                  title={`Signed in as ${userEmail || 'sangeeta.codes@gmail.com'}`}
                >
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-white uppercase font-mono tracking-wide">
                    {(userEmail || 'sangeeta.codes@gmail.com').charAt(0).toUpperCase()}
                  </div>
                  {/* Subtle active status indicator */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </button>
                
                {/* Floating tooltip with Gmail account detail */}
                <div className="absolute right-0 top-12 w-64 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-top-right z-50 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase font-mono">
                      {(userEmail || 'sangeeta.codes@gmail.com').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white text-xs font-bold truncate">Google Account</p>
                      <p className="text-slate-400 text-[10px] font-mono truncate">{userEmail || 'sangeeta.codes@gmail.com'}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                    {hasWorkspace ? (
                      <>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">Website Active</span>
                        <button 
                          onClick={() => onNavigate('dashboard')}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                        >
                          Open Workspace →
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">Setup Needed</span>
                        <button 
                          onClick={onLaunchDemo}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                        >
                          Setup Website →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-all"
                >
                  SIGN IN
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-900/30"
                >
                  FREE TRIAL
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Content */}
        <div className="w-full max-w-5xl mx-auto px-6 text-center mt-16 md:mt-24 mb-16 md:mb-24 relative z-10 space-y-8 my-auto flex-grow flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-block bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2">
              ✨ ENGINEERED FOR ENTREPRENEURS TO MAKE SMART DECISIONS
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-white leading-none">
              CUSTOMER <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">LENS</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-200 text-base md:text-xl max-w-3xl mx-auto leading-relaxed space-y-2 font-medium"
          >
            <span className="block font-bold text-white text-lg md:text-2xl tracking-tight">
              Every successful startup is built on understanding its customers.
            </span>
            <span className="block text-slate-300 text-sm md:text-base leading-relaxed pt-1">
              CustomerLens AI reveals the hidden emotions, frustrations, and motivations behind every decision—so you know why customers buy, switch, stay, or leave.
            </span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-10"
          >
            <a 
              href="#about-lens"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs px-7 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              WHAT IS CUSTOMERLENS?
            </a>
            
            <button 
              onClick={onLaunchDemo}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-xs px-7 py-4 rounded-xl transition-all shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 border border-indigo-400/20"
            >
              LAUNCH DEMO
            </button>
          </motion.div>
        </div>



        {/* whismical hills & tiny trees illustration at the bottom of hero - matches screenshot */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 w-full h-12 text-[#e2ebf6]" viewBox="0 0 1440 74" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,74L1320,74C1200,74,960,74,720,74C480,74,240,74,120,74L0,74Z"></path>
          </svg>
          {/* Small green vector trees spaced along the hill line */}
          <div className="absolute bottom-6 left-[15%] w-3 h-5 bg-emerald-800 rounded-t-full" />
          <div className="absolute bottom-5 left-[16%] w-2 h-4 bg-emerald-700 rounded-t-full" />
          <div className="absolute bottom-6 left-[48%] w-4 h-6 bg-emerald-800 rounded-t-full" />
          <div className="absolute bottom-6 left-[50%] w-3 h-4 bg-teal-800 rounded-t-full" />
          <div className="absolute bottom-5 left-[78%] w-3.5 h-5.5 bg-emerald-700 rounded-t-full" />
        </div>
      </section>

      {/* 2. SUB-HERO INFO STRIP (Founded & Location) */}
      <div className="bg-[#e2ebf6] border-b border-slate-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-4 text-xs font-semibold text-slate-600 text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <span role="img" aria-label="lightbulb">💡</span> Engineered for entrepreneurs to make smart decisions
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <div className="flex items-center gap-1.5 justify-center">
            ✨ built to fill the gap
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <a href="#about" className="text-indigo-600 hover:underline flex items-center gap-0.5 font-bold">
            More about CustomerLens <ChevronRight size={14} />
          </a>
        </div>
      </div>

      {/* 3. CORE WHAT IS CUSTOMERLENS SECTION (With Interactive Live-Survey Card Slideshow) */}
      <section id="about-lens" className="pt-24 pb-12 max-w-6xl mx-auto px-6 border-b border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Explanatory Paragraphs */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-4xl sm:text-5xl text-slate-900 leading-[1.15] tracking-tight font-medium">
              Ask smarter.
            </h2>
            
            {/* ⭐ AI-Triggered Surveys */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-sm text-left">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">⭐</span>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">AI-Triggered Surveys</h3>
              </div>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Ask at the perfect moment—not on a timer.
              </p>
              
              <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Examples:</span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">⏳</span>
                    <span>Hesitates on pricing for <strong className="font-bold text-slate-900">45+ seconds</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">🛒</span>
                    <span>Adds to cart but doesn't buy</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">📄</span>
                    <span>Visits pricing page <strong className="font-bold text-slate-900">3 times</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">🔄</span>
                    <span>Repeated scrolling</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">▶️</span>
                    <span>Watches <strong className="font-bold text-slate-900">80%</strong> of a demo</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">🔁</span>
                    <span>Uses a feature <strong className="font-bold text-slate-900">5+ times</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">👋</span>
                    <span className="italic text-slate-600">New visitor: "What are you looking for today?"</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="shrink-0 text-slate-500">🔄</span>
                    <span className="italic text-slate-600">Returning visitor: "What's stopping you from purchasing?"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DAILY INSIGHTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3.5 shadow-md text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Daily Insights</span>
                <span className="text-[9px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">Real-Time</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Example:</span>
                  <p className="text-xs text-slate-200 leading-normal font-medium italic">
                    "43 visitors abandoned checkout yesterday because shipping costs appeared too late."
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-rose-500 font-bold font-mono">Instead of:</span>
                    <span className="text-slate-400">"72% said pricing is high."</span>
                  </div>

                  <div className="flex items-start gap-2 text-xs bg-indigo-950/40 border border-indigo-900/40 rounded-xl p-2.5">
                    <span className="text-indigo-400 font-bold font-mono shrink-0">AI says:</span>
                    <span className="text-slate-200 leading-relaxed font-semibold">
                      "Google Ads visitors think pricing is too high, while organic visitors are confused by missing feature details."
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-left">
              <button
                onClick={onLaunchDemo}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-extrabold text-sm tracking-wide group transition-all"
              >
                Start Free <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Premium Slate Background with Interactive Live-Survey Cards */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-[#111827] to-indigo-950/40 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl border border-slate-800 min-h-[500px] flex flex-col justify-between relative overflow-hidden select-none">
            
            {/* Subtle mesh light effects inside container */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Live Interactive Card Container */}
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative z-10">
              
              {/* Card top banner */}
              <div className="bg-indigo-600 text-white text-[11px] sm:text-[12px] font-bold py-2.5 px-4 text-center tracking-wide shadow-sm flex items-center justify-center gap-1 select-none">
                Get 15% off any plan for completing this survey! 🎁
              </div>

              {/* Card main body */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow min-h-[300px]">
                
                <AnimatePresence mode="wait">
                  {surveySlideIndex === 0 && (
                    <motion.div
                      key="slide-hear"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <HelpCircle size={20} />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          How did you hear about <span className="text-indigo-600">CustomerLens?</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Select an option to help us understand where our audience comes from.
                        </p>
                      </div>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {[
                          { label: "LinkedIn", percent: "28%" },
                          { label: "Google Search", percent: "35%" },
                          { label: "Just exploring", percent: "22%" },
                          { label: "Other? Let us know!", percent: "15%" }
                        ].map((opt) => {
                          const isSelected = surveyAnswerHear === opt.label || (opt.label === "Other? Let us know!" && (surveyAnswerHear === "Other? Let us know!" || surveyAnswerHear?.startsWith("Other:")));
                          const hasSelectedAny = surveyAnswerHear !== null && surveyAnswerHear !== "Other? Let us know!";
                          
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                if (hasSelectedAny) return;
                                if (opt.label === "Other? Let us know!") {
                                  setSurveyAnswerHear("Other? Let us know!");
                                } else {
                                  setSurveyAnswerHear(opt.label);
                                  setTimeout(() => setSurveySlideIndex(1), 1600);
                                }
                              }}
                              className={`w-full text-left p-3 px-4 rounded-xl border transition-all relative overflow-hidden flex items-center justify-between text-xs sm:text-sm font-semibold ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 font-bold shadow-sm'
                                  : hasSelectedAny
                                    ? 'border-slate-100 bg-white text-slate-400 opacity-60 pointer-events-none'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-3 relative z-10">
                                {hasSelectedAny ? (
                                  <>
                                    <span className="text-indigo-600 font-extrabold w-10 text-right shrink-0 transition-all duration-500">
                                      {opt.percent}
                                    </span>
                                    <span className="w-px h-4 bg-slate-200" />
                                  </>
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 mr-1" />
                                )}
                                <span>{opt.label}</span>
                              </div>
                              
                              <div 
                                className="absolute top-0 bottom-0 left-0 bg-indigo-600/5 transition-all duration-1000 ease-out" 
                                style={{ width: hasSelectedAny ? opt.percent : '0%' }}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {surveyAnswerHear === "Other? Let us know!" && (
                        <div className="mt-3 space-y-2 animate-fadeIn bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-left">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Tell us how you found us:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type how you heard about us..."
                              value={customHearText}
                              onChange={(e) => setCustomHearText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              disabled={!customHearText.trim()}
                              onClick={() => {
                                setSurveyAnswerHear(`Other: ${customHearText}`);
                                setSurveySlideIndex(1);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {surveySlideIndex === 1 && (
                    <motion.div
                      key="slide-hesitation"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <HelpCircle size={20} />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          What is your <span className="text-indigo-600">biggest hesitation?</span>
                        </h3>
                      </div>

                      <div className="space-y-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
                        {[
                          { 
                            label: "i have trust concerns", 
                            followUp: "We are new, thus we don't have reviews yet! But you can see for yourself the profits and results of this app directly on your own website with our free trial. Try it risk-free and let the performance speak for itself!" 
                          },
                          { 
                            label: "the price is too high", 
                            followUp: "I completely understand. We start at just $19/mo and have a robust free tier so you can start risk-free. What target monthly budget fits your business best?" 
                          },
                          { 
                            label: "it doesnt have the features i needed", 
                            followUp: "Got it! We are actively shipping features like behavioral triggers, custom styles, and integrations. What specific feature or integration do you need?" 
                          },
                          { 
                            label: "other", 
                            followUp: "Thank you for sharing! We want to make this a perfect fit for your workflow. What specific concern or goal can I help you clarify today?" 
                          }
                        ].map((opt) => {
                          const isSelected = surveyAnswerOne === opt.label || (opt.label === 'other' && (surveyAnswerOne === 'other' || surveyAnswerOne?.startsWith('Other:')));
                          
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                if (opt.label === 'other') {
                                  setSurveyAnswerOne('other');
                                } else {
                                  handleSelectOption(opt.label, opt.followUp);
                                }
                              }}
                              className={`w-full text-left p-3.5 px-4.5 rounded-xl border transition-all flex items-center justify-between text-xs sm:text-sm font-semibold leading-relaxed ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 shadow-sm font-bold'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                              }`}
                            >
                              <span>{opt.label}</span>
                              <ChevronRight size={14} className="text-slate-400 shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>

                      {surveyAnswerOne === 'other' && (
                        <div className="mt-3 space-y-2 animate-fadeIn bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-left">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Please describe your hesitation:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your concern..."
                              value={customHesitationText}
                              onChange={(e) => setCustomHesitationText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              disabled={!customHesitationText.trim()}
                              onClick={() => {
                                const finalReason = `Other: ${customHesitationText}`;
                                setSurveyAnswerOne(finalReason);
                                const followUp = `Thank you for sharing that your biggest hesitation is "${customHesitationText}". We want to make CustomerLens a perfect fit for you. What specific concern or goal can I help you clarify today?`;
                                setChatMessages([
                                  { sender: 'ai', text: followUp }
                                ]);
                                setSurveySlideIndex(2);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
                            >
                              Continue
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {surveySlideIndex === 2 && (
                    <motion.div
                      key="slide-chat"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 flex flex-col h-full min-h-[300px]"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 flex-shrink-0 text-left">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">AI Survey Assistant</h4>
                          <p className="text-[10px] text-emerald-600 font-bold">Online • Resolving Hesitations</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[190px] text-left py-2 flex flex-col">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-2.5 px-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                              msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-slate-100 text-slate-800 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        
                        {isChatTyping && (
                          <div className="flex justify-start">
                            <div className="bg-slate-100 text-slate-400 rounded-2xl p-3 rounded-tl-none text-xs flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSendChatMessage} className="flex gap-2 flex-shrink-0 mt-auto pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Reply to the AI assistant..."
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                          disabled={isChatTyping}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isChatTyping}
                          className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 shrink-0 flex items-center justify-center"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                      
                      {chatMessages.some(m => m.sender === 'user') ? (
                        <button
                          type="button"
                          onClick={() => setSurveySlideIndex(3)}
                          className="text-center text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer py-1 block flex-shrink-0 animate-pulse"
                        >
                          Satisfied? Let's claim my 15% discount 🎁
                        </button>
                      ) : (
                        <p className="text-center text-[10px] font-semibold text-slate-400 py-1 block flex-shrink-0">
                          💬 Send a message to the AI Survey Assistant above to unlock the discount!
                        </p>
                      )}
                    </motion.div>
                  )}

                  {surveySlideIndex === 3 && (
                    <motion.div
                      key="slide-email"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5 text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Star size={20} className="fill-indigo-600/10 text-indigo-600" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          Stay in touch with <span className="text-indigo-600">Customer Lens!</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          Add your email and you'll be kept on top of any changes to Customer Lens.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <input
                          type="email"
                          value={surveyEmail}
                          onChange={(e) => setSurveyEmail(e.target.value)}
                          placeholder="jason@customerlens.com"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm font-medium transition-all shadow-sm"
                        />
                        {surveyEmail.trim() === '' ? (
                          <p className="text-[11px] text-slate-400 font-medium mt-1">
                            ℹ️ Please enter your email to proceed.
                          </p>
                        ) : !surveyEmail.includes('@') ? (
                          <p className="text-[11px] text-rose-500 font-semibold mt-1">
                            ✕ Please enter a valid email address (must include '@').
                          </p>
                        ) : (
                          <p className="text-[11px] text-emerald-600 font-bold mt-1">
                            ✓ Looks good! Click "Next" to claim your discount.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {surveySlideIndex === 4 && (
                    <motion.div
                      key="slide-discount"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5 text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Check size={20} />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          Thanks! 🙏
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                          This was just an example of what you can do with Customer Lens. Check out our documentation or our examples page for more ideas on how you can use Customer Lens to power your business.
                        </p>
                      </div>

                      <div className="text-xs text-slate-400 font-semibold mb-2 block">
                        Use the code below for 15% off of any Customer Lens plan!
                      </div>

                      <div className="bg-indigo-50/40 rounded-2xl border border-dashed border-indigo-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                            <Tag size={18} />
                          </span>
                          <span className="font-extrabold text-sm sm:text-base font-mono tracking-wider text-indigo-900">CUSTOMERLENS15</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("CUSTOMERLENS15");
                            setSurveyCopied(true);
                            setTimeout(() => setSurveyCopied(false), 2000);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-xs font-bold text-indigo-700 rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                        >
                          {surveyCopied ? (
                            <>
                              <Check size={14} className="text-emerald-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card footer controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-8 flex-shrink-0">
                  {surveySlideIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSurveySlideIndex(surveySlideIndex - 1)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-extrabold transition-all"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}

                  {surveySlideIndex < 4 ? (
                    <button
                      type="button"
                      disabled={!isCurrentSlideCompleted()}
                      onClick={() => setSurveySlideIndex(surveySlideIndex + 1)}
                      className={`font-extrabold text-xs sm:text-sm px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
                        !isCurrentSlideCompleted()
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300'
                      }`}
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSurveySlideIndex(0);
                        setSurveyAnswerOne(null);
                        setSurveyAnswerHear(null);
                        setSurveyEmail('');
                        setChatMessages([]);
                        setChatInput('');
                        setCustomHearText('');
                        setCustomHesitationText('');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      Close <X size={14} />
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Slider Dots Navigation inside premium wrapper */}
            <div className="flex justify-center gap-2.5 pt-6 flex-shrink-0">
              {[0, 1, 2, 3, 4].map((idx) => {
                let isDotDisabled = false;
                if (idx > surveySlideIndex) {
                  for (let s = surveySlideIndex; s < idx; s++) {
                    if (s === 0 && !surveyAnswerHear) isDotDisabled = true;
                    if (s === 1 && !surveyAnswerOne) isDotDisabled = true;
                    if (s === 2 && !chatMessages.some(m => m.sender === 'user')) isDotDisabled = true;
                    if (s === 3 && (!surveyEmail.trim() || !surveyEmail.includes('@'))) isDotDisabled = true;
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDotDisabled}
                    onClick={() => {
                      if (isDotDisabled) return;
                      setSurveySlideIndex(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      surveySlideIndex === idx 
                        ? 'w-8 bg-indigo-500' 
                        : isDotDisabled
                          ? 'w-2.5 bg-slate-800/40 cursor-not-allowed'
                          : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={isDotDisabled ? "Answer current question to proceed" : `Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 3.5 PRICING SECTION */}
      <section id="pricing" className="pt-12 pb-24 max-w-5xl mx-auto px-6">
        {/* Pricing Heading */}
        <div className="text-center max-w-2xl mx-auto mt-4 mb-12 space-y-4">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 font-mono block">
            Flexible Subscription Options
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            CUSTOMER LENS <span className="text-indigo-600">PRICING</span>
          </h2>
          <div className="w-12 h-1 bg-indigo-600 mx-auto rounded" />
          <p className="text-slate-500 text-sm leading-relaxed">
            Select the perfect subscription tier designed to track exit intent, analyze feedback, and optimize your conversion rate metrics.
          </p>
        </div>

        {/* Three Packages Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 max-w-6xl mx-auto px-4">
          
          {/* Free Package */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden text-white group">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 font-mono block">Free</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-slate-400 text-xs font-semibold">/month</span>
                </div>
              </div>

              <div className="w-full h-px bg-slate-800" />

              <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>3 Active Surveys</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>1500 Responses / Month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Basic Analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>AI Feedback Summary</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Email Support</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button 
                onClick={onGetStartedFree}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs py-3.5 rounded-xl transition-all text-center block shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Standard Package */}
          <div className="bg-slate-900 rounded-3xl border-2 border-indigo-600 p-8 pt-14 flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden text-white group">
            {/* Yellow Banner */}
            <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-slate-950 text-[10px] font-black py-2 text-center uppercase tracking-wider font-mono border-b border-yellow-500/30">
              ✨ get a 14 days free trial ✨
            </div>

            <div className="absolute top-10 right-4 bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 font-mono uppercase tracking-wider">
              ⭐ MOST POPULAR
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 font-mono block">Standard</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">$20</span>
                  <span className="text-slate-400 text-xs font-semibold">/month</span>
                </div>
              </div>

              <div className="w-full h-px bg-slate-800" />

              <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Unlimited Surveys</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>AI-Powered Insights</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>5000 Responses</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2.5">
              <button 
                onClick={() => {
                  setActiveCheckoutPlan({ id: 'advance', name: 'CustomerLens Standard (14-Day Free Trial)', price: 20, isTrial: true });
                  setPaypalSimStep('details');
                }}
                className="w-full bg-[#ffc439] hover:bg-[#f4b41a] text-[#003087] font-extrabold text-xs py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 font-sans"
              >
                <span>Start Free Trial (PayPal Account)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Premium Package */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-1 text-white group">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 font-mono block">Premium</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">$90</span>
                  <span className="text-slate-400 text-xs font-semibold">/month</span>
                </div>
              </div>

              <div className="w-full h-px bg-slate-800" />

              <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Unlimited Responses</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>White Label & Custom Domain</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>API & Webhooks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                  <span>Dedicated Priority Support</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => {
                  setActiveCheckoutPlan({ id: 'premium', name: 'CustomerLens Premium', price: 90 });
                  setPaypalSimStep('details');
                }}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs py-3.5 rounded-xl transition-all text-center block"
              >
                pay $90 via paypal
              </button>
            </div>
          </div>

        </div>

        <div className="text-center mt-12 text-xs font-semibold text-slate-500">
          📥 Need to contact us directly, or inquire about one of our projects?{' '}
          <a href="#contact" className="text-indigo-600 hover:underline font-bold">
            Get in touch →
          </a>
        </div>
      </section>

      {/* 4. ABOUT SECTION (Premium Geometric Grid Background) */}
      <section id="about" className="bg-slate-950 text-white py-24 border-t border-b border-slate-900 relative overflow-hidden">
        
        {/* Geometric Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Glowing Ambient Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Interactive FAQ buttons replacing the main heading */}
          <div className="max-w-5xl mx-auto text-left space-y-5 mb-10">
            {[
              {
                q: "we can use built in surveys in our website, why do we need to use customer lens?",
                renderAnswer: () => <LandingPageInfographic />
              },
              {
                q: "How does the interactive AI actually resolve visitor hesitations in real-time?",
                renderAnswer: () => (
                  <div className="space-y-6">
                    <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      Unlike standard form tools that just collect data, CustomerLens takes immediate action. When a visitor selects a hesitation, our AI immediately addresses their specific concern (such as pricing or security concerns) and can dynamically offer tailored promotions or relevant resources.
                    </p>
                    
                    {/* Visual workflow step-by-step diagram */}
                    <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                      <div className="text-[11px] font-extrabold text-indigo-400 tracking-wider uppercase">
                        AI Real-Time Intervention Flow
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                              1
                            </span>
                            <span className="text-xs font-bold text-slate-200">Behavior Trigger</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            User hovers on back button or spends 45s hesitating on the subscription page.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                              2
                            </span>
                            <span className="text-xs font-bold text-slate-200">Interactive Selection</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            A non-disruptive card appears. User selects: <span className="text-indigo-300 font-semibold">💰 Pricing too high</span>.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                              3
                            </span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              AI Intervention
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            AI immediately replies: <span className="italic text-slate-100">"Got it! Let me grant you an instant 15% discount code."</span>
                          </p>
                        </div>
                      </div>

                      {/* Interactive Visual Preview Box */}
                      <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3.5">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-900">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-mono text-slate-500">Visitor Simulation (Live Experience)</span>
                        </div>
                        <div className="space-y-3 text-[11px] sm:text-xs text-left">
                          <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2 font-medium max-w-[85%] shadow-sm">
                              I was looking around, but pricing is too high for my current scale.
                            </div>
                          </div>
                          <div className="flex justify-start items-start gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 shrink-0 font-bold">
                              AI
                            </div>
                            <div className="bg-slate-900/90 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2 leading-relaxed max-w-[85%]">
                              That is totally understandable! I can instantly apply a <strong className="text-emerald-400 font-bold">15% discount</strong> to your account. Enter your email below to receive code <strong className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">LENS15</strong>!
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                q: "What makes CustomerLens better than standard tools like Hotjar or Typeform?",
                renderAnswer: () => (
                  <div className="space-y-6">
                    <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      Typeform is static, and Hotjar focuses on passive heatmaps. CustomerLens bridges that gap by running intelligent micro-surveys that open a smart, conversational channel with the visitor at the exact millisecond of abandonment.
                    </p>
                    
                    {/* Comparative Matrix Table */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/20">
                      <table className="w-full text-left border-collapse min-w-[480px]">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/60">
                            <th className="p-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Capabilities</th>
                            <th className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Typeform</th>
                            <th className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Hotjar</th>
                            <th className="p-3 text-[10px] font-black uppercase text-indigo-400 tracking-wider bg-indigo-500/5">CustomerLens</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                          {[
                            { feat: "Interactive conversational flow", typeform: "✕", hotjar: "✕", lens: "✓ AI Chat" },
                            { feat: "Behavioral & exit-intent triggers", typeform: "Limited", hotjar: "✕ Passive", lens: "✓ Real-time" },
                            { feat: "Dynamic discount / action offers", typeform: "✕", hotjar: "✕", lens: "✓ Auto-incentives" },
                            { feat: "Immediate user-hesitation response", typeform: "✕", hotjar: "✕", lens: "✓ Direct Chat" },
                            { feat: "Average campaign response rate", typeform: "3% - 5%", hotjar: "1% - 3%", lens: "50%+" }
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                              <td className="p-3 px-4 font-semibold text-slate-200">{row.feat}</td>
                              <td className="p-3 text-slate-500 font-medium">{row.typeform}</td>
                              <td className="p-3 text-slate-500 font-medium">{row.hotjar}</td>
                              <td className="p-3 font-extrabold text-indigo-300 bg-indigo-500/5">
                                <span className={row.lens.includes("50%+") || row.lens.startsWith("✓") ? "text-emerald-400" : "text-indigo-300"}>
                                  {row.lens}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              }
            ].map((item, index) => {
              const isOpen = activeAboutFaq === index;
              return (
                <div 
                  key={index} 
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-indigo-500/50 bg-indigo-950/30 shadow-[0_0_25px_rgba(99,102,241,0.15)]' 
                      : 'border-slate-850 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveAboutFaq(isOpen ? null : index)}
                    className="w-full text-left p-4.5 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-100 hover:text-white transition-colors"
                  >
                    <span className="leading-relaxed">{item.q}</span>
                    <span className={`shrink-0 text-indigo-400 p-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className={`border-t border-slate-900/40 bg-slate-950/50 ${index === 0 ? 'p-0' : 'px-5 pb-5 pt-1'}`}>
                          {item.renderAnswer()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          <p className="text-indigo-200 text-lg md:text-xl font-bold leading-relaxed max-w-2xl mx-auto">
            When customers feel understood, loyalty follows.
          </p>
          
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl mx-auto">
            Customer Lens is still being shaped with new ideas and your kind feedback.
          </p>
          
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl mx-auto mt-4">
            Whether you're running a growing Shopify store, a SaaS startup, or an established online business, CustomerLens helps you discover why visitors leave, what customers truly love, and what needs to change to drive sustainable growth.
          </p>

          <div className="pt-4">
            <button 
              onClick={() => {
                setSelectedArticle({
                  title: 'THE CUSTOMERLENS UNDERSTANDING PHILOSOPHY',
                  category: 'MISSION STATEMENT',
                  date: 'Continuous',
                  content: `We build CRO solutions on three key pillars:

1. COMPASSIONATE FEEDBACK
Modern users are exhausted by intrusive popups. We model elegant micro-surveys triggered only by active intention cues (exit velocity, window switching) to respect consumer attention windows.

2. INSIGHT-DRIVEN ACCELERATION
Raw metrics tell you WHAT happened. Authentic text responses and live behavior simulator runs explain WHY it happened. We replace guessing with intelligence.

3. CONTINUOUS ADAPTATION
The best brands don't stay still. By connecting direct web reviews with custom automated AI analysis, we help digital shopkeepers continuously optimize their checkout gates.`
                });
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
            >
              LEARN MORE
            </button>
          </div>
        </div>
      </section>

      {/* 5. LATEST BLOG & ACQUISITION PRESS RELEASE */}
      <section id="blog" className="hidden">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Article Left Column (Acquisition Highlight) */}
          <div className="lg:col-span-2 space-y-6">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block font-mono">
              📢 THE LATEST FROM SANDHILLS BLOG
            </span>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight hover:text-indigo-600 transition-colors cursor-pointer"
              onClick={() => setSelectedArticle(blogArticles[0])}
            >
              AWESOME MOTIVE HAS ACQUIRED OUR WORDPRESS PRODUCTS AND SERVICES
            </h2>
            
            <p className="text-slate-500 text-xs font-semibold flex items-center gap-1 font-mono">
              <Clock size={12} /> Published July 11, 2026 | Sandhills Press Room
            </p>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              Today is a big day for Sandhills. We are very excited to announce that our entire suite of WordPress products and services, and their wonderful engineering teams, have officially joined the Awesome Motive family!
            </p>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              This transition allows our software products to scale to their ultimate potential under elite guidance, while the Sandhills team focuses directly on community conservation reserves, wild-ale brewing, and custom software like our AI exit-intent system CustomerLens.
            </p>

            <div className="pt-2">
              <button 
                onClick={() => setSelectedArticle(blogArticles[0])}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all inline-flex items-center gap-1"
              >
                CONTINUE READING <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Sidebar - Pricing Packages */}
          <div className="space-y-6 h-fit">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-wider uppercase font-mono">CUSTOMER LENS PACKAGES</h3>
              <p className="text-[11px] text-slate-500 mt-1">Select the perfect toolkit for your store's optimization.</p>
            </div>

            {/* Free Plan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Free</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">$0</span>
                  <span className="text-slate-500 text-xs">/month</span>
                </div>
              </div>
              
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>3 Active Surveys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>1500 Responses / Month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Basic Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>AI Feedback Summary</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Email Support</span>
                </li>
              </ul>

              <button 
                onClick={onGetStartedFree}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all text-center block"
              >
                Get Started
              </button>
            </div>

            {/* Standard Plan */}
            <div className="bg-gradient-to-b from-indigo-50/50 to-white p-6 rounded-2xl border-2 border-indigo-600 shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono uppercase">
                ⭐ MOST POPULAR
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono block">Standard</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">$20</span>
                  <span className="text-slate-500 text-xs">/month</span>
                </div>
              </div>
              
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>Unlimited Surveys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>AI-Powered Insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>Exit Intent Surveys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>5000 Responses</span>
                </li>
              </ul>

              <button 
                onClick={() => {
                  setActiveCheckoutPlan({ id: 'advance', name: 'CustomerLens Standard (14-Day Free Trial)', price: 20, isTrial: true });
                  setPaypalSimStep('details');
                }}
                className="w-full bg-[#ffc439] hover:bg-[#f4b41a] text-[#003087] font-bold text-xs py-2.5 rounded-xl transition-all text-center block shadow-sm font-sans"
              >
                Start Free Trial with PayPal ($20/mo after 14 days)
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block">Premium</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">$90</span>
                  <span className="text-slate-500 text-xs">/month</span>
                </div>
              </div>
              
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Unlimited Responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>White Label & Custom Domain</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>API & Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Dedicated Priority Support</span>
                </li>
              </ul>

              <button 
                onClick={() => {
                  setActiveCheckoutPlan({ id: 'premium', name: 'CustomerLens Premium', price: 90 });
                  setPaypalSimStep('details');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all text-center block"
              >
                Pay $90/mo via PayPal
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE CONTACT & INQUIRY FORM */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Info Side */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">GET IN TOUCH</h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              Every great conversation starts with a question. Whether you have a question, need a custom solution, or want to see CustomerLens in action, we're just one message away. Contact us today.
            </p>

            {/* Space left empty after image removal */}
          </div>

          {/* Form Side */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Pippin" 
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@domain.com" 
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Message / Inquiry</label>
                <textarea 
                  required
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us what you are interested in..." 
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {contactSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  🟢 Inquiry dispatched! Our dispatch team will reply shortly.
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
              >
                Send Message <Send size={12} />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* NEWSLETTER ROW */}
      <div className="bg-[#111e35] text-white py-12 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-extrabold text-sm tracking-widest uppercase text-slate-100 font-mono">Know More. Guess Less.</h4>
            <p className="text-xs text-slate-400">Turn Every Opinion Into Opportunity.</p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
            <input 
              type="email" 
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="newsletter@domain.com"
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs outline-none focus:border-indigo-500 text-white w-full md:w-56"
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-xl transition-all shadow-md"
            >
              {newsletterSubscribed ? 'SUBSCRIBED!' : 'JOIN'}
            </button>
          </form>
        </div>
      </div>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-white text-[#111e35] flex items-center justify-center font-extrabold text-sm shadow">
              CL
            </div>
            <span className="font-bold tracking-wider text-slate-300 font-mono text-[11px]">CUSTOMERLENS CRO</span>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-[11px] font-semibold">
            <a href="#about" className="hover:text-white transition-colors">ABOUT US</a>
            <a href="#contact" className="hover:text-white transition-colors">CONTACT</a>
          </div>

          <p className="text-[10px] text-slate-500 font-mono">
            Copyright © {new Date().getFullYear()} CUSTOMER LENS. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* PROJECT DETAILS DIALOG / MODAL OVERLAY */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow ${selectedProject.color}`}>
                  {React.createElement(selectedProject.icon, { size: 22 })}
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-indigo-600 font-mono tracking-wider">{selectedProject.category}</span>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">{selectedProject.name}</h4>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                <p>{selectedProject.description}</p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 grid grid-cols-2 gap-4 font-mono text-[10px] font-bold">
                  <div>
                    <span className="block text-slate-400 uppercase">CLASSIFICATION</span>
                    <span className="text-slate-800 text-[11px]">{selectedProject.type}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase">METRICS / VOLUME</span>
                    <span className="text-slate-800 text-[11px]">{selectedProject.stats}</span>
                  </div>
                </div>

                {selectedProject.id === 'customerlens' ? (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-indigo-900 text-[11px] space-y-2">
                    <span className="font-extrabold uppercase font-mono block text-indigo-700">⚡ ACTIVE SaaS PLAYGROUND</span>
                    <p className="leading-relaxed">You can instantly experience the entire live CustomerLens SaaS dashboard including exit-intent simulations, custom integrations, white labeling, and real AI analytics right now without an account.</p>
                    <button 
                      onClick={() => {
                        setSelectedProject(null);
                        onLaunchDemo();
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      Instant Demo Sandbox <Sparkles size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-50 p-3 rounded-xl border">
                    {selectedProject.tag === 'PROJECT ACQUIRED' ? (
                      <span>This product has been successfully transitioned to the Awesome Motive family. Licensed clients receive complete ongoing support as normal.</span>
                    ) : (
                      <span>This localized community or land preservation project is fully funded, maintained, and operated directly by the core team at Sandhills.</span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARTICLE READER MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative border border-slate-100 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="space-y-4">
                <span className="inline-block bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase font-mono">
                  {selectedArticle.category}
                </span>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {selectedArticle.title}
                </h3>

                <p className="text-[10px] font-mono text-slate-400">
                  Published on {selectedArticle.date} | Sandhills Bulletin
                </p>

                <div className="w-full h-px bg-slate-100" />

                <div className="text-xs md:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-4">
                  {selectedArticle.content}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                >
                  Done Reading
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYPAL CHECKOUT MODAL */}
      <AnimatePresence>
        {activeCheckoutPlan && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setActiveCheckoutPlan(null);
                  setPaypalSimStep('details');
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              {/* PayPal Branded Logo Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="font-black italic text-xl tracking-tight text-[#003087]">
                    Pay<span className="text-[#0079C1]">Pal</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
                    SECURE GATEWAY
                  </span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Step 1: Selection & Checkout Options */}
              {paypalSimStep === 'details' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-indigo-600 font-mono tracking-wider block">
                      {activeCheckoutPlan.isTrial ? '14-DAY FREE TRIAL SELECTION' : 'YOUR SELECTION'}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{activeCheckoutPlan.name}</h4>
                    
                    {activeCheckoutPlan.isTrial ? (
                      <div className="bg-indigo-50/80 border border-indigo-200/60 p-3 rounded-xl space-y-1 mt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Due Today (14-Day Trial):</span>
                          <span className="font-black text-emerald-600 text-sm">$0.00 USD</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500">
                          <span>Billing After 14 Days:</span>
                          <span className="font-bold text-slate-800">$20.00 USD / month</span>
                        </div>
                        <p className="text-[10px] text-indigo-900 pt-1 leading-snug font-medium border-t border-indigo-100/60 mt-1">
                          ✨ Put your PayPal account to start the 14-day trial. If you continue using CustomerLens Standard for more than 14 days, your PayPal account will be charged $20 USD/month. Cancel anytime during the trial with zero cost.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1 mt-1.5 font-sans">
                        {checkoutDiscountApplied ? (
                          <>
                            <span className="text-2xl font-black text-slate-900">${(activeCheckoutPlan.price * 0.85).toFixed(2)}</span>
                            <span className="text-slate-400 text-xs line-through ml-1.5">${activeCheckoutPlan.price}.00</span>
                            <span className="text-emerald-600 font-mono font-bold text-[10px] ml-1.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">15% OFF</span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-slate-900">${activeCheckoutPlan.price}.00</span>
                        )}
                        <span className="text-slate-500 text-xs">USD / Month</span>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-500 leading-relaxed">
                      🔒 Merchant PayPal Email:<br />
                      <strong className="text-slate-700 font-mono font-bold">sangeeta.codes@gmail.com</strong>
                    </div>
                  </div>

                  {/* Survey Promo Code Prompt */}
                  <div className="bg-indigo-50/50 border border-indigo-100/80 p-4 rounded-2xl space-y-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider font-mono">🎁 CLAIM 15% SURVEY DISCOUNT</span>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Did you complete our Exit Intent Survey? Paste your exclusive coupon code below:
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. LENS15-XXXX"
                        value={checkoutCouponCode}
                        onChange={(e) => {
                          setCheckoutCouponCode(e.target.value);
                          setCheckoutCouponError('');
                        }}
                        disabled={checkoutDiscountApplied}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase outline-none font-mono focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 transition-all"
                      />
                      {!checkoutDiscountApplied ? (
                        <button
                          type="button"
                          onClick={() => {
                            const code = checkoutCouponCode.trim().toUpperCase();
                            if (code.startsWith('LENS15') || code.includes('LENS15')) {
                              setCheckoutDiscountApplied(true);
                              setCheckoutCouponError('');
                            } else {
                              setCheckoutCouponError('Invalid code. Complete the survey to get your LENS15 code!');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
                        >
                          Apply
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutDiscountApplied(false);
                            setCheckoutCouponCode('');
                          }}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shrink-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {checkoutDiscountApplied && (
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 font-sans">
                        ✓ 15% discount code applied successfully!
                      </p>
                    )}
                    {checkoutCouponError && (
                      <p className="text-[11px] font-semibold text-rose-500 font-sans">
                        ✕ {checkoutCouponError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Live PayPal Smart Button SDK Component */}
                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2 font-mono text-center">
                        ⚡ Official PayPal Smart Checkout
                      </span>
                      <PayPalSmartButton 
                        planId={activeCheckoutPlan.id} 
                        onSuccess={() => {
                          setPaypalSimStep('success');
                        }}
                      />
                    </div>

                    {/* Direct PayPal Subscription Fallback */}
                    <a 
                      href={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=sangeeta.codes@gmail.com&item_name=CustomerLens+Advance+14-Day+Free+Trial&a3=${checkoutDiscountApplied ? '17.00' : '20.00'}&p3=1&t3=M&a1=0.00&p1=14&t1=D&currency_code=USD`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-sm font-sans"
                    >
                      <span>Alternative Direct Link ($0.00 Today)</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    By linking your PayPal account, you start a 14-day free trial. If kept active beyond 14 days, $20 USD/month will apply. Cancel anytime.
                  </p>
                </div>
              )}

              {/* Step 2: Simulated Login */}
              {paypalSimStep === 'login' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Enter Your PayPal Account</h4>
                    <p className="text-[11px] text-slate-500">Provide your PayPal account email to activate your 14-day free trial ($0 today).</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">PayPal Account Email</label>
                      <input 
                        type="email"
                        value={paypalUserEmail}
                        onChange={(e) => setPaypalUserEmail(e.target.value)}
                        placeholder="your-paypal-email@paypal.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">PayPal Password (Optional Verification)</label>
                      <input 
                        type="password"
                        value={paypalUserPassword}
                        onChange={(e) => setPaypalUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-snug">
                    ℹ️ $0.00 will be charged today. If you continue using CustomerLens Advance for more than 14 days, $20.00 USD/month will be billed automatically to your PayPal account.
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => setPaypalSimStep('details')}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!paypalUserEmail) setPaypalUserEmail('user-paypal@customerlens.com');
                        setPaypalSimStep('review');
                      }}
                      className="w-1/2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Next: Authorize Trial
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review simulated payment */}
              {paypalSimStep === 'review' && (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Confirm PayPal Account Link</h4>
                    <p className="text-[11px] text-slate-500 font-mono text-indigo-600">Trial Auth ID: PAY-14DAY-TRIAL-92015</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Linked PayPal Account:</span>
                      <span className="text-slate-800 font-mono font-bold">{paypalUserEmail}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Charge Due Today:</span>
                      <span className="text-emerald-600 font-mono font-bold">$0.00 USD (14-Day Free Trial)</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Recurring Price (After 14 Days):</span>
                      <span className="text-slate-800 font-mono font-bold">
                        ${checkoutDiscountApplied ? '17.00' : '20.00'} USD / month
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-[11px]">
                      <span className="text-slate-500">First Billing Date:</span>
                      <span className="text-indigo-600 font-mono font-semibold">
                        {new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200/50" />
                    <p className="text-[10px] text-slate-500 leading-snug font-sans">
                      Notice: By clicking below, you authorize CustomerLens to bill $20 USD/month to your linked PayPal account <strong>only if you continue using CustomerLens Advance after 14 days</strong>. Cancel anytime during the 14-day trial without paying anything.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      disabled={simulatedPaying}
                      onClick={() => setPaypalSimStep('login')}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button 
                      disabled={simulatedPaying}
                      onClick={() => {
                        setSimulatedPaying(true);
                        setTimeout(() => {
                          setSimulatedPaying(false);
                          setPaypalSimStep('success');
                        }, 1800);
                      }}
                      className="w-2/3 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      {simulatedPaying ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Linking Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Link PayPal & Start 14-Day Free Trial</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success confirmation */}
              {paypalSimStep === 'success' && (
                <div className="space-y-5 text-center py-4">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-sm animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">PayPal Account Linked & Trial Activated!</h4>
                    <p className="text-xs text-slate-500">Trial Auth Token: <span className="font-mono font-bold text-slate-700">TRIAL-PAYPAL-2026</span></p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed text-left space-y-2 border">
                    <p className="font-semibold text-slate-800">✅ 14-Day Free Trial Active for CustomerLens Standard!</p>
                    <p>Your PayPal account (<strong className="text-slate-900">{paypalUserEmail}</strong>) is set up. $0.00 was charged today.</p>
                    <p className="text-slate-700">
                      If you continue to use CustomerLens Standard for more than 14 days, your PayPal account will be charged <strong className="text-slate-900">$20.00 USD/month</strong> starting on <strong>{new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                    </p>
                    <p className="text-[10px] text-slate-400">You may cancel your trial at any time in account settings prior to the 14 days to avoid being charged.</p>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveCheckoutPlan(null);
                      setPaypalSimStep('details');
                      if (isLoggedIn) {
                        onGetStartedFree();
                      } else {
                        onNavigate('register');
                      }
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2"
                  >
                    <span>Continue to Setup Process</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const ErasingAnimatedText = ({ 
  fromText, 
  toText,
  delay = 0,
  fontSizeClass = "text-[7.5px] sm:text-[9px] md:text-[10px] lg:text-[11px]",
  alignClass = "text-center"
}: { 
  fromText: string; 
  toText: string; 
  delay?: number;
  fontSizeClass?: string;
  alignClass?: string;
}) => {
  const isLeft = alignClass.includes("text-left");
  return (
    <div className={`relative w-full h-full flex items-center ${isLeft ? "justify-start pl-2.5 sm:pl-3.5 md:pl-4 pr-1 sm:pr-2" : "justify-center"}`}>
      <div className="w-full relative h-full flex items-center">
        {/* From text (worried / negative state): will get crossed out, blurred, and fade out */}
        <motion.span
          animate={{
            opacity: [1, 1, 0, 0, 1],
            textDecoration: ["none", "line-through", "line-through", "none", "none"],
            filter: ["blur(0px)", "blur(0px)", "blur(3px)", "blur(3px)", "blur(0px)"],
            y: ["0%", "0%", "-4%", "-4%", "0%"]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            times: [0, 0.35, 0.45, 0.9, 1],
            delay: delay * 0.4,
            ease: "easeInOut"
          }}
          className={`absolute inset-x-0 text-slate-400 font-semibold leading-tight select-none ${fontSizeClass} ${alignClass}`}
        >
          {fromText}
        </motion.span>

        {/* To text (happy / resolved state): will fade in, scale up slightly, and turn emerald */}
        <motion.span
          animate={{
            opacity: [0, 0, 1, 1, 0],
            filter: ["blur(3px)", "blur(3px)", "blur(0px)", "blur(0px)", "blur(3px)"],
            scale: [0.95, 0.95, 1, 1, 0.95],
            y: ["4%", "4%", "0%", "0%", "4%"]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            times: [0, 0.4, 0.48, 0.85, 0.92],
            delay: delay * 0.4,
            ease: "easeInOut"
          }}
          className={`absolute inset-x-0 font-extrabold leading-tight select-none ${fontSizeClass} ${alignClass} text-emerald-600`}
        >
          {toText}
        </motion.span>
      </div>
    </div>
  );
};

const FloatingThought = ({ 
  children, 
  className, 
  delay = 0,
  icon,
  iconBg = "bg-red-50 text-red-500"
}: { 
  children: React.ReactNode; 
  className: string; 
  delay?: number;
  icon?: React.ReactNode;
  iconBg?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -6, 0],
        x: [0, 3, -3, 0]
      }}
      transition={{
        opacity: { duration: 0.6, delay: delay * 0.15 },
        scale: { duration: 0.6, delay: delay * 0.15 },
        y: {
          duration: 3.5 + (delay % 3) * 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.25
        },
        x: {
          duration: 4.5 + (delay % 2) * 1.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: delay * 0.3
        }
      }}
      className={`absolute z-30 flex items-center gap-1.5 bg-white text-slate-800 text-[9px] sm:text-[10px] font-bold px-2.5 py-1.5 rounded-2xl shadow-md border border-slate-100 max-w-[110px] sm:max-w-[130px] leading-tight text-center sm:text-left ${className}`}
      style={{ transformOrigin: "bottom center" }}
    >
      {icon && (
        <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 font-medium">{children}</div>
      
      {/* Mini cloud thought bubbles beneath */}
      <div className="absolute -bottom-1.5 left-[40%] w-2 h-2 bg-white rounded-full border border-slate-100/50 shadow-sm" />
      <div className="absolute -bottom-3 left-[35%] w-1.2 h-1.2 bg-white rounded-full border border-slate-100/50 shadow-sm" />
    </motion.div>
  );
};

const CustomerGraphic = ({ isHappy }: { isHappy: boolean }) => (
  <svg viewBox="0 0 160 300" className="w-28 h-56 sm:w-32 sm:h-64 drop-shadow-md">
    {/* Shadow at feet */}
    <ellipse cx="80" cy="285" rx="35" ry="6" fill="rgba(15, 23, 42, 0.15)" />
    
    {/* Legs & Shoes */}
    <g id="legs">
      {/* Left leg */}
      <path d="M 66 180 L 64 275" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M 94 180 L 96 275" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      
      {/* Left shoe */}
      <path d="M 52 272 L 68 272 L 68 282 L 48 282 Z" fill="#0f172a" />
      <path d="M 48 282 L 68 282 L 68 285 L 48 285 Z" fill="#ffffff" /> {/* White sole */}
      
      {/* Right shoe */}
      <path d="M 92 272 L 108 272 L 112 282 L 92 282 Z" fill="#0f172a" />
      <path d="M 92 282 L 112 282 L 112 285 L 92 285 Z" fill="#ffffff" /> {/* White sole */}
    </g>

    {/* Torso & Shirt */}
    <g id="torso">
      {/* Body / Sweater */}
      <path d="M 55 100 L 105 100 L 100 185 L 60 185 Z" fill="#4f46e5" className={isHappy ? "fill-indigo-600" : "fill-indigo-700"} />
      <path d="M 60 185 L 100 185 L 98 190 L 62 190 Z" fill="#3730a3" /> {/* Waist band */}
      
      {/* Neck */}
      <rect x="74" y="85" width="12" height="18" fill="#fed7aa" rx="4" />
    </g>

    {/* Arms & Hands & Phone */}
    <g id="arms">
      {/* Right Arm holding phone */}
      <path d="M 58 102 Q 40 140 68 142" fill="none" stroke="#4f46e5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      {/* Hand */}
      <circle cx="70" cy="142" r="5" fill="#fed7aa" />
      {/* Smartphone */}
      <rect x="72" y="132" width="8" height="18" rx="2" fill="#0f172a" transform="rotate(15, 72, 132)" />
      <rect x="74" y="134" width="5" height="14" rx="1" fill={isHappy ? "#34d399" : "#1e293b"} transform="rotate(15, 72, 132)" />

      {/* Left Arm thinking */}
      {isHappy ? (
        // Happy: gesture
        <path d="M 102 102 Q 120 130 110 160" fill="none" stroke="#4f46e5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        // Thinking: bent up to chin
        <path d="M 102 102 Q 118 135 94 82" fill="none" stroke="#4f46e5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      )}
      
      {/* Hand at chin */}
      {!isHappy && <circle cx="92" cy="78" r="6" fill="#fed7aa" />}
    </g>

    {/* Head & Face */}
    <g id="head">
      {/* Face */}
      <circle cx="80" cy="65" r="18" fill="#fed7aa" />
      
      {/* Hair (Black, textured) */}
      <path d="M 62 65 C 62 45, 98 45, 98 65 C 98 55, 62 50, 62 65" fill="#1e293b" />
      <path d="M 62 60 Q 80 40 96 52 Q 90 44 80 46 Q 70 42 62 60" fill="#1e293b" />
      <path d="M 72 44 Q 85 36 94 48 Q 84 42 72 44" fill="#1e293b" />

      {/* Features */}
      {isHappy ? (
        <>
          {/* Happy eyes */}
          <path d="M 72 63 Q 75 60 78 63" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 84 63 Q 87 60 90 63" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Big smile */}
          <path d="M 74 72 Q 81 80 88 72" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          {/* Worried eyes */}
          <path d="M 71 61 Q 74 63 77 62" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 83 61 Q 86 63 89 62" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Frown eyebrows */}
          <path d="M 69 57 L 76 59" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 91 57 L 84 59" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Worried mouth */}
          <path d="M 75 73 Q 80 70 85 73" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </>
      )}
    </g>
  </svg>
);

const OwnerGraphic = ({ isHappy }: { isHappy: boolean }) => (
  <svg viewBox="0 0 240 240" className="w-48 h-48 sm:w-56 sm:h-56 drop-shadow-md">
    {/* Floor shadow */}
    <ellipse cx="120" cy="225" rx="80" ry="6" fill="rgba(15, 23, 42, 0.12)" />

    {/* OFFICE CHAIR Swivel Base */}
    <g id="chair-base">
      <rect x="148" y="170" width="6" height="35" fill="#475569" />
      <path d="M 125 210 L 175 210" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
      <path d="M 135 205 L 165 215" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
      <circle cx="125" cy="214" r="4.5" fill="#0f172a" />
      <circle cx="175" cy="214" r="4.5" fill="#0f172a" />
      <circle cx="135" cy="209" r="3.5" fill="#0f172a" />
      <circle cx="165" cy="219" r="3.5" fill="#0f172a" />
    </g>

    {/* OFFICE CHAIR seat and backrest */}
    <g id="chair-seat">
      <rect x="154" y="95" width="14" height="75" rx="6" fill="#1e293b" transform="rotate(5, 154, 95)" />
      <rect x="122" y="160" width="40" height="10" rx="3" fill="#1e293b" />
      <path d="M 130 142 L 150 142 L 152 160" fill="none" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* SITTING OWNER */}
    <g id="owner-body">
      {/* Pants */}
      <rect x="115" y="164" width="36" height="12" rx="3" fill="#1e293b" />
      <rect x="120" y="176" width="10" height="40" rx="4" fill="#1e293b" />
      {/* Shoes */}
      <rect x="114" y="214" width="18" height="6" rx="2" fill="#0f172a" />

      {/* Torso & Purple Sweater */}
      <path d="M 126 108 L 152 108 L 150 162 L 122 162 Z" fill="#4f46e5" className={isHappy ? "fill-indigo-600" : "fill-indigo-700"} />

      {/* Neck */}
      <rect x="132" y="93" width="8" height="16" fill="#fed7aa" rx="2" />

      {/* Head */}
      <circle cx="136" cy="80" r="15" fill="#fed7aa" />
      {/* Hair */}
      <path d="M 124 80 C 124 64, 150 64, 150 80 C 150 72, 124 70, 124 80" fill="#1e293b" />
      <path d="M 124 76 Q 138 60, 148 70 Q 140 66, 134 68 Q 128 65, 124 76" fill="#1e293b" />

      {/* Face features (looking left) */}
      {isHappy ? (
        <>
          {/* Happy eye */}
          <path d="M 129 78 Q 131 76 133 78" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Smiling mouth */}
          <path d="M 127 86 Q 131 90 134 86" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          {/* Thinking worried eye */}
          <circle cx="130" cy="79" r="1.5" fill="#1e293b" />
          <path d="M 127 75 L 132 76" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
          {/* Thinking mouth */}
          <line x1="128" y1="86" x2="132" y2="86" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {/* Arms & Hands */}
      {isHappy ? (
        <>
          <path d="M 144 112 Q 120 120 122 145" fill="none" stroke="#4f46e5" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="122" cy="145" r="4" fill="#fed7aa" />
        </>
      ) : (
        <>
          <path d="M 144 112 Q 122 134 126 94" fill="none" stroke="#4f46e5" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="126" cy="92" r="4.5" fill="#fed7aa" />
        </>
      )}
    </g>

    {/* DESK / WORKSTATION */}
    <g id="desk-setup">
      {/* Desk surface */}
      <rect x="20" y="146" width="160" height="7" rx="3" fill="#475569" />
      {/* Desk legs */}
      <rect x="32" y="153" width="6" height="65" fill="#334155" />
      <rect x="110" y="153" width="6" height="65" fill="#334155" />

      {/* Laptop */}
      <g id="laptop" transform="translate(68, 126)">
        <rect x="0" y="16" width="34" height="4" rx="1.5" fill="#94a3b8" />
        <path d="M 28 17 L 38 1" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <polygon points="28,15 36,2 10,2 12,15" fill={isHappy ? "rgba(52, 211, 153, 0.2)" : "rgba(99, 102, 241, 0.15)"} />
        {isHappy ? (
          <path d="M 18 7 L 21 10 L 27 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : (
          <path d="M 16 11 L 22 5 L 26 8" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        )}
      </g>

      {/* Potted Plant */}
      <g id="potted-plant" transform="translate(36, 114)">
        <polygon points="4,32 14,32 16,18 2,18" fill="#1e293b" />
        <rect x="2.5" y="18" width="13" height="1.5" fill="#78350f" />
        <path d="M 9 18 L 9 2" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 9 14 Q 2 10 3 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 9 11 Q 16 7 15 3" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="9" cy="2" rx="2" ry="3.5" fill="#22c55e" />
      </g>

      {/* Stack of books & Coffee cup */}
      <g id="books-and-coffee" transform="translate(144, 114)">
        <rect x="18" y="24" width="22" height="4" rx="1" fill="#475569" />
        <rect x="16" y="24" width="3" height="4" fill="#f59e0b" />
        <rect x="15" y="28" width="24" height="4.5" rx="1" fill="#1e293b" />
        <rect x="13" y="28" width="3" height="4.5" fill="#ef4444" />
        <rect x="22" y="14" width="10" height="10" rx="2" fill="#0f172a" />
        <path d="M 32 16 Q 36 19 32 22" fill="none" stroke="#0f172a" strokeWidth="2" />
        <path d="M 25 10 Q 26 7 25 5" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <path d="M 28 10 Q 29 8 28 6" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

