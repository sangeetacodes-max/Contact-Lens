import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'register' | 'forgot' | 'dashboard') => void;
  onLaunchDemo: () => void;
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

export default function LandingPage({ onNavigate, onLaunchDemo }: LandingPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; category: string; content: string; date: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  // PayPal Checkout State
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<{ id: string; name: string; price: number } | null>(null);
  const [paypalCheckoutSuccess, setPaypalCheckoutSuccess] = useState(false);
  const [simulatedPaying, setSimulatedPaying] = useState(false);
  const [paypalSimStep, setPaypalSimStep] = useState<'details' | 'login' | 'review' | 'success'>('details');
  const [paypalUserEmail, setPaypalUserEmail] = useState('');
  const [paypalUserPassword, setPaypalUserPassword] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

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
      <section className="bg-slate-950 text-white relative overflow-hidden pt-6 pb-28 border-b border-slate-900">
        
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
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative z-10">
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
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-6 text-center mt-20 relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
              ✨ ENGINEERED FOR ENTREPRENEURS TO MAKE SMART DECISIONS
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              CUSTOMER <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">LENS</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Engineered for entrepreneurs to make smart decisions. CustomerLens captures precise visitor exit-intent patterns, intercepts bounce traffic, and converts raw visitor behaviors into actionable insights to scale your business.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <a 
              href="#about-lens"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              WHAT IS CUSTOMERLENS?
            </a>
            
            <button 
              onClick={onLaunchDemo}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-950/50 flex items-center justify-center gap-2 border border-indigo-400/20"
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

      {/* 3. CORE WHAT IS CUSTOMERLENS SECTION (With Custom Comparative Graphics) */}
      <section id="about-lens" className="py-24 max-w-6xl mx-auto px-6 border-b border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & 3 Explanatory Points */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase font-mono border border-indigo-100">
                🚀 WHAT IS CUSTOMERLENS?
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                CUSTOMER <span className="text-indigo-600">LENS</span>
              </h2>
              <div className="w-12 h-1 bg-indigo-600 rounded" />
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Engineered for entrepreneurs to understand exactly why visitors buy or bounce. CustomerLens aligns customer needs with active store operations.
              </p>
            </div>

            {/* 3 Short Clear Points */}
            <div className="space-y-5">
              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-extrabold font-mono text-sm border border-indigo-100/60">
                  01
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-950 tracking-tight">Profitable Intent Intercepts</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    It takes surveys at the exact moment the customer has a profitable intent—when they leave, when they buy or they are happy.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-extrabold font-mono text-sm border border-indigo-100/60">
                  02
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-950 tracking-tight">AI-Detected Behavior Triggers</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    When they do something, real-time AI detects it and asks questions that help.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-extrabold font-mono text-sm border border-indigo-100/60">
                  03
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-950 tracking-tight">Direct Contextual Questions</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Bypasses slow feedback loops with short, clear questions that help.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic SVG Comparative Visual Scenario Cards */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* CARD 1: THE FEEDBACK GAP (WITHOUT) */}
            <div className="relative bg-[#090e1a] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col justify-between text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-3 mb-4">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 font-mono">SCENARIO A: THE FEEDBACK GAP</span>
                <span className="text-[9px] w-fit px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold uppercase tracking-wider">WITHOUT CUSTOMERLENS</span>
              </div>
              
              <div className="relative flex-1 w-full aspect-[3/2] rounded-2xl overflow-hidden border border-slate-800/60 shadow-inner bg-[#090e1a] select-none">
                <img 
                  src="/src/assets/images/scenario_a_clean_1783946720069.jpg" 
                  alt="Scenario A: The Feedback Gap Diagram" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* CARD 2: THE ALIGNED VALUE (WITH) */}
            <div className="relative bg-[#090e1a] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col justify-between text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/40 pb-3 mb-4">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 font-mono">SCENARIO B: THE ALIGNED VALUE</span>
                <span className="text-[9px] w-fit px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">WITH CUSTOMERLENS</span>
              </div>
              
              <div className="relative flex-1 w-full aspect-[3/2] rounded-2xl overflow-hidden border border-slate-800/60 shadow-inner bg-[#090e1a] select-none">
                {/* Core illustration image */}
                <img 
                  src="/src/assets/images/scenario_b_clean_1783946737629.jpg" 
                  alt="CustomerLens Scenario B Loop Diagram" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3.5 PRICING SECTION */}
      <section id="pricing" className="py-24 max-w-5xl mx-auto px-6">
        {/* Pricing Heading */}
        <div className="text-center max-w-2xl mx-auto mt-28 mb-12 space-y-4">
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
                  <span>1 Active Survey</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>100 Responses / Month</span>
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
                onClick={() => onNavigate('register')}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs py-3.5 rounded-xl transition-all text-center block shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Advance Package */}
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
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 font-mono block">Advance</span>
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
                  <span>Shopify & Website Integration</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2.5">
              <button 
                onClick={() => onNavigate('register')}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs py-3.5 rounded-xl transition-all text-center block shadow-md"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => {
                  setActiveCheckoutPlan({ id: 'advance', name: 'CustomerLens Advance', price: 20 });
                  setPaypalSimStep('details');
                }}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs py-3.5 rounded-xl transition-all text-center block shadow-lg shadow-indigo-600/10"
              >
                pay $20 via paypal
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
                  <span>Everything in Advance</span>
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

        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            ABOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">CUSTOMER LENS</span>
          </h2>
          <div className="w-12 h-1 bg-indigo-500 mx-auto rounded" />
          
          <p className="text-indigo-200 text-lg md:text-xl font-bold leading-relaxed max-w-2xl mx-auto">
            When customers feel understood, loyalty follows.
          </p>
          
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl mx-auto">
            Every click, every survey response, every review, and every piece of feedback reveals an opportunity to improve. CustomerLens transforms those scattered opinions into clear, AI-powered insights that help businesses make smarter decisions with confidence.
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
                  <span>1 Active Survey</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>100 Responses / Month</span>
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
                onClick={() => onNavigate('register')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all text-center block"
              >
                Get Started
              </button>
            </div>

            {/* Advance Plan */}
            <div className="bg-gradient-to-b from-indigo-50/50 to-white p-6 rounded-2xl border-2 border-indigo-600 shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono uppercase">
                ⭐ MOST POPULAR
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono block">Advance</span>
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
                  <span>Shopify & Website Integration</span>
                </li>
              </ul>

              <button 
                onClick={() => {
                  setActiveCheckoutPlan({ id: 'advance', name: 'CustomerLens Advance', price: 20 });
                  setPaypalSimStep('details');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all text-center block shadow-sm"
              >
                Pay $20/mo via PayPal
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
                  <span>Everything in Advance</span>
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

            <div className="mt-4 border border-slate-200/80 rounded-3xl overflow-hidden shadow-md max-w-[240px] bg-[#090e1a] select-none">
              <img 
                src="/src/assets/images/waving_entrepreneur_desk_1783946313289.jpg" 
                alt="Entrepreneur waving hello at desk" 
                className="w-full aspect-square object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
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
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">YOUR SELECTION</span>
                    <h4 className="text-base font-black text-slate-900 mt-1">{activeCheckoutPlan.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-black text-slate-900">${activeCheckoutPlan.price}.00</span>
                      <span className="text-slate-500 text-xs">USD / Month</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200/50 text-[10px] text-slate-500 leading-relaxed">
                      🔒 Recipient PayPal Email:<br />
                      <strong className="text-slate-700 font-mono font-bold">sangeeta.codes@gmail.com</strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Live Checkout Option */}
                    <a 
                      href={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=sangeeta.codes@gmail.com&item_name=CustomerLens%20${encodeURIComponent(activeCheckoutPlan.name)}%20Subscription&amount=${activeCheckoutPlan.price}.00&currency_code=USD&no_shipping=1&charset=UTF-8`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#ffc439] hover:bg-[#f4b41a] text-[#003087] font-black text-xs py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-sm border border-[#f4b41a]/50"
                    >
                      <span className="font-extrabold">Pay via Real PayPal Account</span>
                      <ArrowRight size={14} />
                    </a>

                    {/* Simulation/Sandbox Option */}
                    <button 
                      onClick={() => setPaypalSimStep('login')}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-2"
                    >
                      <span>Simulate Instant Sandbox Payment</span>
                      <Sparkles size={12} className="text-yellow-400" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    By choosing PayPal, you are routed directly to safe checkout networks. Direct merchant credentials are never handled by CustomerLens.
                  </p>
                </div>
              )}

              {/* Step 2: Simulated Login */}
              {paypalSimStep === 'login' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Log in with PayPal Sandbox</h4>
                    <p className="text-[11px] text-slate-500">Enter mock login details to complete instant verification.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Sandbox Email</label>
                      <input 
                        type="email"
                        value={paypalUserEmail}
                        onChange={(e) => setPaypalUserEmail(e.target.value)}
                        placeholder="sandbox-buyer@example.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Sandbox Password</label>
                      <input 
                        type="password"
                        value={paypalUserPassword}
                        onChange={(e) => setPaypalUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setPaypalSimStep('details')}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (paypalUserEmail || true) { // Allow auto sandbox
                          if (!paypalUserEmail) setPaypalUserEmail('sandbox-buyer@customerlens.com');
                          setPaypalSimStep('review');
                        }
                      }}
                      className="w-1/2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review simulated payment */}
              {paypalSimStep === 'review' && (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Confirm Sandbox Authorization</h4>
                    <p className="text-[11px] text-slate-500 font-mono text-indigo-600">Secure Token: PAY-9S27401X280145Y</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Authorized Buyer:</span>
                      <span className="text-slate-800 font-mono">{paypalUserEmail}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Destination Account:</span>
                      <span className="text-slate-800 font-mono font-bold">sangeeta.codes@gmail.com</span>
                    </div>
                    <div className="h-px bg-slate-200/50" />
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>Total Subscription Charge:</span>
                      <span>${activeCheckoutPlan.price}.00 USD</span>
                    </div>
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
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay Now with PayPal</span>
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
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Payment Completed Successfully!</h4>
                    <p className="text-xs text-slate-500">Invoice: <span className="font-mono font-bold text-slate-700">INV-CL-92015</span></p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed text-left space-y-2 border">
                    <p className="font-semibold text-slate-800">✅ Sandbox Premium Access Verified!</p>
                    <p>Your subscription to <strong className="text-slate-900">{activeCheckoutPlan.name}</strong> is now fully active under account <strong className="text-slate-900">sangeeta.codes@gmail.com</strong>.</p>
                    <p className="text-[10px] text-slate-400">A receipt and configuration guide has been sent to your registered email address.</p>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveCheckoutPlan(null);
                      setPaypalSimStep('details');
                      onNavigate('register'); // Send to register so they can finalize their premium account setup!
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow"
                  >
                    Set Up Your Active Store Dashboard →
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

