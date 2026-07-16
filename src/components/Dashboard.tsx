import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldAlert, 
  Layout, 
  Code, 
  Eye, 
  LineChart, 
  CreditCard, 
  Settings, 
  Users, 
  LogOut, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  Trash2, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  Maximize2, 
  HelpCircle, 
  FileText, 
  Sliders, 
  Upload, 
  Globe, 
  UserCheck, 
  Smartphone, 
  Menu 
} from 'lucide-react';
import { 
  User, 
  Workspace, 
  Survey, 
  SurveyResponse, 
  ConnectedWebsite, 
  AIRecommendation, 
  BillingHistoryItem 
} from '../types';

interface DashboardProps {
  user: User;
  workspace: Workspace;
  initialSurvey: Survey;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onUpdateWorkspace: (updatedWorkspace: Partial<Workspace>) => void;
}

export default function Dashboard({ 
  user, 
  workspace, 
  initialSurvey, 
  onLogout, 
  onUpdateUser, 
  onUpdateWorkspace 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'install' | 'surveys' | 'simulator' | 'analytics' | 'billing' | 'domain' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core States (using localStorage for durable client-side persistence)
  const [websites, setWebsites] = useState<ConnectedWebsite[]>(() => {
    const saved = localStorage.getItem('cl_websites');
    return saved ? JSON.parse(saved) : [
      { id: 'web-1', platform: 'Shopify', url: workspace.url || 'myshopify-store.com', status: 'Not Installed' }
    ];
  });

  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem('cl_surveys');
    return saved ? JSON.parse(saved) : [initialSurvey];
  });

  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('cl_responses');
    return saved ? JSON.parse(saved) : [
      {
        id: 'resp-1',
        surveyId: initialSurvey.id,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        answers: [
          { questionId: 'q1', answer: 'Price Too High' },
          { questionId: 'q2', answer: '4' },
          { questionId: 'q3', answer: 'I would buy if shipping was cheaper!' }
        ],
        visitorMeta: { browser: 'Chrome', country: 'US', pageUrl: '/products/premium-jacket' }
      },
      {
        id: 'resp-2',
        surveyId: initialSurvey.id,
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        answers: [
          { questionId: 'q1', answer: 'Just Browsing' },
          { questionId: 'q2', answer: '5' },
          { questionId: 'q3', answer: 'Love the minimalist layouts.' }
        ],
        visitorMeta: { browser: 'Safari', country: 'CA', pageUrl: '/' }
      },
      {
        id: 'resp-3',
        surveyId: initialSurvey.id,
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        answers: [
          { questionId: 'q1', answer: 'Shipping Cost' },
          { questionId: 'q2', answer: '3' },
          { questionId: 'q3', answer: '$15 postage is crazy for standard ground shipping.' }
        ],
        visitorMeta: { browser: 'Firefox', country: 'UK', pageUrl: '/checkout/step2' }
      }
    ];
  });

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>(() => {
    const saved = localStorage.getItem('cl_billing_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'inv-1294',
        date: new Date().toLocaleDateString(),
        amount: user.plan === 'Business' ? 99 : user.plan === 'Pro' ? 49 : 0,
        plan: `${user.plan} Plan Trial`,
        status: 'Paid',
        paymentMethod: 'Stripe',
        invoiceUrl: '#'
      }
    ];
  });

  // AI Exit Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [analyzingExit, setAnalyzingExit] = useState(false);

  // Setup wizard and active survey
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(initialSurvey.id);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [testingInstallation, setTestingInstallation] = useState(false);
  
  // Custom Domain Inputs
  const [domainInput, setDomainInput] = useState(workspace.customDomain || '');
  const [dnsVerified, setDnsVerified] = useState(workspace.customDomainStatus === 'Active');

  // White Label State
  const [wlLogo, setWlLogo] = useState<string>(workspace.whiteLabel?.logoUrl || '');
  const [wlColor, setWlColor] = useState<string>(workspace.whiteLabel?.primaryColor || '#6366f1');
  const [wlEmail, setWlEmail] = useState<string>(workspace.whiteLabel?.emailBranding || '');
  const [wlRemoveBranding, setWlRemoveBranding] = useState<boolean>(workspace.whiteLabel?.removeBranding || false);

  // Billing states
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(user.billingPeriod);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g. 20 for 20%
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<'Pro' | 'Business' | null>(null);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<'Stripe' | 'PayPal'>('Stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Notifications
  const [notif, setNotif] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Simulator Triggers
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simulatorSelectedAnswer, setSimulatorSelectedAnswer] = useState<string>('');
  const [simulatorFeedbackText, setSimulatorFeedbackText] = useState<string>('');
  const [simulatorRating, setSimulatorRating] = useState<number>(5);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 3000);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cl_websites', JSON.stringify(websites));
  }, [websites]);

  useEffect(() => {
    localStorage.setItem('cl_surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('cl_responses', JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem('cl_billing_history', JSON.stringify(billingHistory));
  }, [billingHistory]);

  // Load recommendations once on mount
  useEffect(() => {
    triggerRecommendationsLoad();
    triggerExitAnalysisLoad();
  }, []);

  const triggerRecommendationsLoad = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType: workspace.businessType, goal: workspace.goal })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const triggerExitAnalysisLoad = async () => {
    setAnalyzingExit(true);
    try {
      const res = await fetch('/api/api-exit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, businessName: workspace.name, goal: workspace.goal })
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingExit(false);
    }
  };

  const handleTestInstallation = () => {
    setTestingInstallation(true);
    setTimeout(() => {
      setTestingInstallation(false);
      const updated = websites.map(w => ({ ...w, status: 'Connected' as const }));
      setWebsites(updated);
      showNotification('🟢 Website code verified! Widget status is now Connected.', 'success');
    }, 2000);
  };

  const handleReconnect = () => {
    const updated = websites.map(w => ({ ...w, status: 'Not Installed' as const }));
    setWebsites(updated);
    showNotification('🔴 Widget disconnected. Re-paste the script or verify to connect.', 'info');
  };

  // Shopify Simulated 1-Click Install
  const handleShopifyOneClickInstall = () => {
    showNotification('Redirecting to Shopify App Store OAuth flow...', 'info');
    setTimeout(() => {
      const updated = websites.map(w => {
        if (w.platform === 'Shopify') {
          return { ...w, status: 'Connected' as const, installedAt: new Date().toLocaleDateString() };
        }
        return w;
      });
      setWebsites(updated);
      showNotification('🟢 Successfully connected with Shopify! No manual theme code needed.', 'success');
    }, 1500);
  };

  // Survey Builder Functions
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyPlacement, setNewSurveyPlacement] = useState<Survey['displayOption']>('Exit Intent Popup');
  const [newSurveyHeadline, setNewSurveyHeadline] = useState('Wait! We value your feedback.');
  const [newSurveyColors, setNewSurveyColors] = useState({ background: '#ffffff', text: '#0f172a', accent: '#4f46e5' });

  const handleCreateSurvey = () => {
    if (!newSurveyTitle) {
      showNotification('Please enter a survey title', 'error');
      return;
    }
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      title: newSurveyTitle,
      displayOption: newSurveyPlacement,
      headline: newSurveyHeadline,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: 'What was missing from our website today?',
          options: ['Clear Pricing', 'Faster Checkout', 'Better Search Filters', 'Other Product Varieties']
        },
        {
          id: 'q2',
          type: 'rating',
          questionText: 'Rate our design out of 5 stars',
          options: []
        }
      ],
      colors: newSurveyColors,
      brandingEnabled: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    setSurveys([newSurvey, ...surveys]);
    setSelectedSurveyId(newSurvey.id);
    setNewSurveyTitle('');
    showNotification('🟢 New survey created with customizable default answers!', 'success');
  };

  // Simulator submit handler
  const handleSimulatorSubmit = () => {
    const activeSurvey = surveys.find(s => s.id === selectedSurveyId) || initialSurvey;
    const newResp: SurveyResponse = {
      id: `resp-${Date.now()}`,
      surveyId: activeSurvey.id,
      timestamp: new Date().toISOString(),
      answers: [
        { questionId: 'q1', answer: simulatorSelectedAnswer || 'Price Too High' },
        { questionId: 'q2', answer: simulatorRating.toString() },
        { questionId: 'q3', answer: simulatorFeedbackText || 'Simulated visitor text response.' }
      ],
      visitorMeta: {
        browser: 'Chrome (Simulated)',
        country: 'US',
        pageUrl: '/simulated-exit'
      }
    };

    const nextResponses = [newResp, ...responses];
    setResponses(nextResponses);
    setShowSimulatorModal(false);
    setSimulatorSelectedAnswer('');
    setSimulatorFeedbackText('');
    showNotification('Survey feedback received! Adding to analytics databases.', 'success');
    
    // Automatically re-trigger analysis
    setTimeout(() => {
      triggerExitAnalysisLoad();
    }, 1000);
  };

  // Custom Domain Setup
  const handleDomainVerify = () => {
    if (!domainInput) {
      showNotification('Please enter a subdomain', 'error');
      return;
    }
    showNotification('Checking DNS records for CNAME customerlens.app...', 'info');
    setTimeout(() => {
      setDnsVerified(true);
      onUpdateWorkspace({
        customDomain: domainInput,
        customDomainStatus: 'Active'
      });
      showNotification('🟢 Domain successfully connected! SSL certificate is active.', 'success');
    }, 2000);
  };

  // White Label updates
  const handleSaveWhiteLabel = () => {
    if (user.plan !== 'Business') {
      showNotification('White Label branding is restricted to Business plan subscribers.', 'error');
      return;
    }
    onUpdateWorkspace({
      whiteLabel: {
        logoUrl: wlLogo,
        primaryColor: wlColor,
        emailBranding: wlEmail,
        removeBranding: wlRemoveBranding
      }
    });
    showNotification('🟢 Custom White Label guidelines applied globally.', 'success');
  };

  // Coupon codes
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'LENS20') {
      setAppliedDiscount(20);
      showNotification('Success! 20% discount coupon applied.', 'success');
    } else if (code === 'GROWTH50') {
      setAppliedDiscount(50);
      showNotification('Epic! 50% discount coupon applied.', 'success');
    } else {
      showNotification('Invalid coupon code.', 'error');
    }
  };

  // Upgrade/payment processing
  const handleUpgradeClick = (plan: 'Pro' | 'Business') => {
    setSelectedPlanForUpgrade(plan);
    setBillingModalOpen(true);
  };

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    const basePrice = selectedPlanForUpgrade === 'Business' ? 99 : 49;
    const finalPrice = Math.round(basePrice * (1 - appliedDiscount / 100) * (billingPeriod === 'yearly' ? 10 : 1)); // 2 months free for yearly

    showNotification(`Processing secure transaction via ${paymentMethodSelected}...`, 'info');

    setTimeout(() => {
      // Update subscription states
      onUpdateUser({
        plan: selectedPlanForUpgrade,
        billingPeriod,
        subscriptionActive: true,
        trialEndsAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString() // Extended subscription
      });

      // Insert billing ledger
      const newInvoice: BillingHistoryItem = {
        id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(),
        amount: finalPrice,
        plan: `${selectedPlanForUpgrade} Plan (${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'})`,
        status: 'Paid',
        paymentMethod: paymentMethodSelected,
        invoiceUrl: '#'
      };

      setBillingHistory([newInvoice, ...billingHistory]);
      setBillingModalOpen(false);
      showNotification(`🟢 Welcome to CustomerLens ${selectedPlanForUpgrade}! Your account is activated.`, 'success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Dynamic Toast banner */}
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 shadow-xl px-5 py-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
              notif.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              notif.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {notif.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <ShieldAlert size={16} className="text-rose-600" />}
            {notif.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Grid */}
      <div className="flex-grow flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
          
          {/* Top segment */}
          <div>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  CL
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-white block">CustomerLens</span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wide">{workspace.name}</span>
                </div>
              </div>
              <button 
                className="md:hidden text-slate-400 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Nav List */}
            <nav className={`p-4 space-y-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              <button 
                id="tab_nav_home"
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Layout size={16} /> Overview
              </button>
              
              <button 
                id="tab_nav_install"
                onClick={() => { setActiveTab('install'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'install' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Code size={16} /> Embed Code & QR
              </button>

              <button 
                id="tab_nav_surveys"
                onClick={() => { setActiveTab('surveys'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'surveys' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Sliders size={16} /> Survey Builder
              </button>

              <button 
                id="tab_nav_simulator"
                onClick={() => { setActiveTab('simulator'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'simulator' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Eye size={16} /> Exit Intent Simulator
              </button>

              <button 
                id="tab_nav_analytics"
                onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <LineChart size={16} /> AI Exit CRO Analytics
              </button>

              <button 
                id="tab_nav_billing"
                onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'billing' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <CreditCard size={16} /> Billing & Stripe / PayPal
              </button>

              <button 
                id="tab_nav_domain"
                onClick={() => { setActiveTab('domain'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'domain' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Settings size={16} /> White Label & Domains
              </button>

              {/* Master Admin Portal */}
              <button 
                id="tab_nav_admin"
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border-t border-slate-800 mt-4 pt-4 ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-indigo-400 hover:text-indigo-300'}`}
              >
                <Users size={16} /> Admin Console
              </button>
            </nav>
          </div>

          {/* User Account bottom widget */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold bg-indigo-950/50 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded">
                {user.plan} {user.subscriptionActive ? 'Active' : 'Trial'}
              </span>
              <button 
                id="btn_logout"
                onClick={onLogout}
                className="hover:text-white flex items-center gap-1 font-semibold"
              >
                Logout <LogOut size={12} />
              </button>
            </div>
          </div>
        </aside>

        {/* WORKSPACE VIEWPORT */}
        <main className="flex-grow p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          
          {/* TAB 1: OVERVIEW / HOME */}
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Overview</h1>
                  <p className="text-slate-500 text-xs">Observe live connection statuses, widget performance logs, and custom AI improvement suggestions.</p>
                </div>
                
                {/* Integration Health Panel */}
                <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200/80 flex items-center gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Widget Connection Status</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {websites[0]?.status === 'Connected' ? (
                        <>
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-bold text-emerald-800">🟢 Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-sm font-bold text-rose-800">🔴 Widget Not Installed</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      id="btn_retest_connection"
                      onClick={handleTestInstallation}
                      disabled={testingInstallation}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {testingInstallation ? <RefreshCw className="animate-spin" size={12} /> : <Check size={12} />} Test Connection
                    </button>
                    <button 
                      id="btn_reconnect_widget"
                      onClick={handleReconnect}
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Reconnect
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Grid Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Exit Responses</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{responses.length}</p>
                  <p className="text-emerald-600 text-[10px] font-semibold mt-1">▲ 14% higher than last week</p>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Rating Score</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">4.2 / 5.0</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-300">
                    <span className="text-[10px] text-emerald-600 font-semibold">▲ Satisfactory</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Survey Placement</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1.5 truncate">{surveys[0]?.displayOption || 'Exit Intent Popup'}</p>
                  <p className="text-slate-400 text-[10px] mt-1 uppercase font-mono">Optimized for Conversion</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Plan Billing Status</span>
                  <p className="text-sm font-bold text-indigo-600 mt-1.5 uppercase">{user.plan} Free Trial</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-mono">14-Days Active</p>
                </div>
              </div>

              {/* Weekly AI Recommendations segment */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={18} />
                    <h3 className="font-bold text-slate-900 text-sm">Weekly AI Recommendations</h3>
                  </div>
                  <button 
                    id="btn_regenerate_recs"
                    onClick={triggerRecommendationsLoad}
                    disabled={loadingRecs}
                    className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {loadingRecs ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCw size={12} />} Regenerate Recommendations
                  </button>
                </div>

                {loadingRecs ? (
                  <div className="text-center py-8">
                    <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-mono">Consulting customer response analytics database...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          rec.type === 'warning' ? 'bg-amber-500' :
                          rec.type === 'success' ? 'bg-emerald-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-bold text-slate-950 text-xs">{rec.title}</p>
                          <p className="text-slate-500 text-xs mt-1 leading-relaxed">{rec.description}</p>
                          <span className="text-[9px] text-slate-400 block mt-2 font-mono">Insight timestamp: {rec.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 2: WEBSITE INSTALLATION / EMBED CODE & QR */}
          {activeTab === 'install' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">No-Code Installation Center</h1>
                <p className="text-slate-500 text-xs">Select your platform and install the CustomerLens script. No manual approval or support is required.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Integration Options Column */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Supported Integrations</span>
                  
                  <button 
                    id="btn_platform_shopify"
                    onClick={handleShopifyOneClickInstall}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold text-xs">S</div>
                      <span className="text-xs font-semibold text-slate-800">Shopify 1-Click install</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono uppercase font-bold">Auto</span>
                  </button>

                  <div className="p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">W</div>
                      <span className="text-xs font-semibold text-slate-800">WooCommerce WordPress Plugin</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Provide the plugin ZIP connection code below. Auto verifies connected status.</p>
                    <div className="bg-slate-50 p-2 rounded-lg text-[10px] font-mono text-slate-700 flex justify-between items-center">
                      <span>Plugin Slug: cl_woocommerce_v1.0</span>
                      <button className="text-indigo-600 hover:underline">Download</button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center font-bold text-xs">F</div>
                      <span className="text-xs font-semibold text-slate-800">Webflow API Connection</span>
                    </div>
                    <input 
                      id="input_webflow_api_key"
                      type="password" 
                      placeholder="Paste Webflow API Key..." 
                      className="w-full px-2.5 py-1.5 border rounded bg-slate-50 text-xs font-mono"
                    />
                    <button 
                      id="btn_webflow_save"
                      onClick={() => showNotification('Webflow Key stored securely. Connection verified.', 'success')}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg"
                    >
                      Connect API
                    </button>
                  </div>
                </div>

                {/* Embed Codes & Manual Embeds */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Script copy-paste */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-slate-950 text-sm">Custom JavaScript Embed Code</h3>
                    <p className="text-xs text-slate-500">Copy this lightweight script tag and paste it before the closing <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">&lt;/body&gt;</code> tag of your website.</p>
                    
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed">
{`<script src="https://customerlens.app/widget.js" data-id="cl-widget-129"></script>`}
                      </pre>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('<script src="https://customerlens.app/widget.js" data-id="cl-widget-129"></script>');
                          showNotification('Embed code copied!', 'success');
                        }}
                        className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-md"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2">
                      <QrCode className="text-amber-700 flex-shrink-0" size={18} />
                      <div>
                        <p className="font-bold text-amber-900 text-xs">Test instant QR feedback preview</p>
                        <p className="text-amber-700 text-[11px] mt-0.5">Scan or copy-paste this code to instantly display and view the customer survey widget on external mobile test runs.</p>
                      </div>
                    </div>
                  </div>

                  {/* Manual connection confirmation panel */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Globe size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Installation Verification</h4>
                        <p className="text-slate-500 text-xs">Ready to go? Run an automated crawler check to verify that CustomerLens widget.js is loaded.</p>
                      </div>
                    </div>
                    
                    <button 
                      id="btn_test_install_center"
                      onClick={handleTestInstallation}
                      disabled={testingInstallation}
                      className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {testingInstallation ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />} Verify Installation Status
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: SURVEY BUILDER */}
          {activeTab === 'surveys' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Survey Builder</h1>
                  <p className="text-slate-500 text-xs">Create and design custom, targeted customer surveys. Set triggers, questions, themes, and branding.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Creator Controls */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm">Create New Survey Blueprint</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Survey Title / Name</label>
                    <input 
                      id="input_survey_title_new"
                      type="text" 
                      value={newSurveyTitle}
                      onChange={(e) => setNewSurveyTitle(e.target.value)}
                      placeholder="e.g. Abandonment Checkout Survey"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Survey Display Trigger Placement</label>
                    <select 
                      id="select_survey_placement"
                      value={newSurveyPlacement}
                      onChange={(e) => setNewSurveyPlacement(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      <option value="Exit Intent Popup">Exit Intent Popup</option>
                      <option value="Popup After X Seconds">Popup After X Seconds</option>
                      <option value="Floating Widget">Floating Widget</option>
                      <option value="Embedded Form">Embedded Form</option>
                      <option value="Thank You Page">Thank You Page</option>
                      <option value="Slide In">Slide In</option>
                      <option value="Bottom Bar">Bottom Bar</option>
                      <option value="Full Page Survey">Full Page Survey</option>
                      <option value="Button Triggered Survey">Button Triggered Survey</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Engaging Headline Message</label>
                    <input 
                      id="input_survey_headline_new"
                      type="text" 
                      value={newSurveyHeadline}
                      onChange={(e) => setNewSurveyHeadline(e.target.value)}
                      placeholder="Before you go..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Color Palette (Accent Button)</label>
                    <div className="flex gap-2">
                      <input 
                        id="input_survey_color_new"
                        type="color" 
                        value={newSurveyColors.accent}
                        onChange={(e) => setNewSurveyColors({ ...newSurveyColors, accent: e.target.value })}
                        className="h-8 w-12 rounded cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={newSurveyColors.accent}
                        onChange={(e) => setNewSurveyColors({ ...newSurveyColors, accent: e.target.value })}
                        className="flex-grow px-2 py-1.5 border rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button 
                    id="btn_submit_create_survey"
                    onClick={handleCreateSurvey}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    Save & Create Survey
                  </button>
                </div>

                {/* List of Active Surveys & Previews */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Active Surveys Blueprint</h3>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {surveys.map((survey) => (
                        <div key={survey.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                              <Layout size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-950 text-sm">{survey.title}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{survey.displayOption}</span>
                                <span>•</span>
                                <span className="font-mono">{survey.questions.length} questions</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setSelectedSurveyId(survey.id);
                                showNotification(`Selected: ${survey.title} for Exit Intent simulator runs!`, 'info');
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                selectedSurveyId === survey.id 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {selectedSurveyId === survey.id ? '🟢 Active Simulator' : 'Select for Simulator'}
                            </button>
                            <button 
                              onClick={() => {
                                setSurveys(surveys.filter(s => s.id !== survey.id));
                                showNotification('Survey removed.', 'info');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE EXIT INTENT SIMULATOR */}
          {activeTab === 'simulator' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exit Intent Simulator Playground</h1>
                <p className="text-slate-500 text-xs">Experience how exiting is dynamically tracked! Click below to trigger the actual pop-up, choose custom selections, and save responses.</p>
              </div>

              {/* Simulation Stage */}
              <div className="bg-slate-900 rounded-3xl p-8 text-center min-h-[350px] flex flex-col justify-center items-center relative overflow-hidden border border-slate-800 shadow-xl">
                <div className="absolute top-4 right-4 bg-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full border border-slate-700">
                  Exit Trackers: Active 🟢
                </div>
                
                <div className="max-w-md space-y-4">
                  <h3 className="font-bold text-white text-xl tracking-tight">Interactive Sandboxed Frame</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Under real production environments, a <strong className="text-indigo-400">mouse-out (mouseleave)</strong> event targeting the window viewport boundary triggers the modal. In this sandbox frame, click below to trigger or test our layout.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button 
                      id="btn_trigger_simulator_popup"
                      onClick={() => setShowSimulatorModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-1.5"
                    >
                      <Eye size={16} /> Trigger Exit-Intent Popup
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Exit Intent Modal Simulator Overlay */}
              <AnimatePresence>
                {showSimulatorModal && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl relative overflow-hidden text-slate-900"
                      style={{
                        backgroundColor: surveys.find(s => s.id === selectedSurveyId)?.colors.background || '#ffffff',
                        color: surveys.find(s => s.id === selectedSurveyId)?.colors.text || '#0f172a'
                      }}
                    >
                      {/* Custom Logo/Header based on White label settings */}
                      {user.plan === 'Business' && wlLogo && (
                        <div className="mb-4">
                          <img src={wlLogo} alt="Workspace Logo" className="h-8 object-contain" />
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Wait!</p>
                          <h3 className="text-xl font-bold tracking-tight mt-1 mb-1 leading-snug">
                            {surveys.find(s => s.id === selectedSurveyId)?.headline || "Before you go..."}
                          </h3>
                          <p className="text-xs opacity-60">Why are you leaving our website today?</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {[
                            'Price Too High',
                            'Just Browsing',
                            'Couldn\'t Find What I Needed',
                            'Shipping Cost',
                            'Website Problem',
                            'Other'
                          ].map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSimulatorSelectedAnswer(opt)}
                              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-3 transition-all ${
                                simulatorSelectedAnswer === opt 
                                  ? 'bg-slate-50 border-slate-900' 
                                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-800'
                              }`}
                              style={{
                                borderColor: simulatorSelectedAnswer === opt ? (surveys.find(s => s.id === selectedSurveyId)?.colors.accent || '#4f46e5') : undefined
                              }}
                            >
                              <div className="h-3 w-3 rounded-full border flex items-center justify-center border-slate-300">
                                {simulatorSelectedAnswer === opt && (
                                  <div 
                                    className="h-1.5 w-1.5 rounded-full" 
                                    style={{ backgroundColor: surveys.find(s => s.id === selectedSurveyId)?.colors.accent || '#4f46e5' }}
                                  />
                                )}
                              </div>
                              {opt}
                            </button>
                          ))}
                        </div>

                        {/* Optional text segment */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide opacity-50 mb-1">Additional Feedback (Optional)</label>
                          <textarea 
                            value={simulatorFeedbackText}
                            onChange={(e) => setSimulatorFeedbackText(e.target.value)}
                            placeholder="Help us improve our service..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 outline-none"
                          />
                        </div>

                        {/* White-Label logic inside mockup */}
                        {(!wlRemoveBranding || user.plan !== 'Business') && (
                          <div className="text-center pt-2">
                            <span className="text-[9px] text-slate-400 font-mono">Powered by <strong className="text-indigo-600">CustomerLens</strong></span>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button 
                            id="btn_close_simulator_modal"
                            onClick={() => setShowSimulatorModal(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                          >
                            Close
                          </button>
                          <button 
                            id="btn_submit_simulator_survey"
                            onClick={handleSimulatorSubmit}
                            className="text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
                            style={{ backgroundColor: surveys.find(s => s.id === selectedSurveyId)?.colors.accent || '#4f46e5' }}
                          >
                            Submit
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* TAB 5: AI EXIT ANALYTICS & CRO REPORTS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI CRO Exit-Intent Analysis</h1>
                  <p className="text-slate-500 text-xs">Run real-time deep-learning sweeps on exit feedback logs using the Gemini API.</p>
                </div>
                
                <button 
                  id="btn_trigger_exit_analysis"
                  onClick={triggerExitAnalysisLoad}
                  disabled={analyzingExit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {analyzingExit ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />} Run Real-Time AI Sweep
                </button>
              </div>

              {analyzingExit ? (
                <div className="text-center py-16 bg-white border rounded-2xl">
                  <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
                  <p className="text-slate-800 font-bold text-sm">Processing survey databases through Gemini CRO models...</p>
                  <p className="text-slate-400 text-xs mt-1 animate-pulse font-mono">Mapping common customer complaint paths...</p>
                </div>
              ) : (
                aiAnalysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Charts Column */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Top Exit Reasons</span>
                        <div className="space-y-3.5 mt-3">
                          {aiAnalysis.topExitReasons.map((item: any, i: number) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-slate-800">
                                <span>{item.reason}</span>
                                <span>{item.percentage}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">UX Sentiment Assessment</span>
                        <div className="mt-2.5 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-800 truncate">{aiAnalysis.sentiment}</span>
                            <span className="text-lg font-bold text-indigo-600 font-mono">{aiAnalysis.sentimentScore}/100</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${aiAnalysis.sentimentScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Suggestions and Common Complaints Column */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Recommendations */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="text-indigo-600" size={18} />
                          <h3 className="font-bold text-slate-900 text-sm">Actionable CRO Recommendations</h3>
                        </div>

                        <div className="space-y-3">
                          {aiAnalysis.aiSuggestions.map((sug: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-100 flex items-start gap-3.5">
                              <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {i+1}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{sug.issue}</p>
                                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{sug.recommendation}</p>
                                <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 uppercase font-mono">{sug.impact} Impact</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Raw Answers / Common Complaints log */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Most Common Complaints Swept</span>
                        <ul className="mt-3 space-y-2.5">
                          {aiAnalysis.mostCommonComplaints.map((comp: string, i: number) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                              <span className="text-indigo-500 font-semibold">•</span>
                              <span>{comp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                  </div>
                )
              )}

            </motion.div>
          )}

          {/* TAB 6: BILLING & PAYMENT GATEWAY INTEGRATIONS */}
          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Stripe/PayPal Subscriptions</h1>
                <p className="text-slate-500 text-xs">Self-service upgrades and payment gateway management. Secure billing processing with Stripe and PayPal.</p>
              </div>

              {/* Plans Comparison */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                
                {/* Billing toggle */}
                <div className="flex justify-center items-center gap-3 mb-8">
                  <span className={`text-xs font-semibold ${billingPeriod === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Bill Monthly</span>
                  <button 
                    onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                    className="w-12 h-6 bg-slate-200 rounded-full p-0.5 transition-all relative"
                  >
                    <div className={`w-5 h-5 bg-indigo-600 rounded-full transition-all ${billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                  <span className={`text-xs font-semibold ${billingPeriod === 'yearly' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Bill Yearly <strong className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">2 Months Free</strong></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Trial Tier */}
                  <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Sandbox</span>
                      <h3 className="font-bold text-slate-900 text-lg mt-1">14-Day Free Trial</h3>
                      <p className="text-xs text-slate-500 mt-1">Perfect for prototyping exit-intent widget functionality.</p>
                      
                      <div className="my-5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900">$0</span>
                        <span className="text-slate-400 text-xs">/ forever</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                        <li className="flex items-center gap-2">✔ Standard JavaScript Embed</li>
                        <li className="flex items-center gap-2">✔ Exit Intent Triggering</li>
                        <li className="flex items-center gap-2">✔ Up to 50 feedback responses</li>
                        <li className="flex items-center gap-2 text-slate-400">❌ White-Labeling Settings</li>
                      </ul>
                    </div>
                    
                    <button className="w-full mt-6 bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-lg cursor-not-allowed" disabled>
                      Currently Active
                    </button>
                  </div>

                  {/* PRO Plan */}
                  <div className="border border-indigo-200 bg-indigo-50/10 rounded-2xl p-5 flex flex-col justify-between ring-2 ring-indigo-600/10">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-indigo-600">Grower</span>
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">Popular</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mt-1">Pro Plan</h3>
                      <p className="text-xs text-slate-500 mt-1">Ideal for expanding stores seeking conversions.</p>
                      
                      <div className="my-5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900">${billingPeriod === 'monthly' ? '49' : '39'}</span>
                        <span className="text-slate-400 text-xs">/ month</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                        <li className="flex items-center gap-2">✔ Unlimited surveys</li>
                        <li className="flex items-center gap-2">✔ Shopify & WooCommerce plugins</li>
                        <li className="flex items-center gap-2">✔ AI Exit Analysis integration</li>
                        <li className="flex items-center gap-2 text-slate-400">❌ Custom Domain connection</li>
                      </ul>
                    </div>
                    
                    <button 
                      id="btn_select_plan_pro"
                      onClick={() => handleUpgradeClick('Pro')}
                      className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm"
                    >
                      {user.plan === 'Pro' ? 'Manage Billing' : 'Upgrade to Pro'}
                    </button>
                  </div>

                  {/* BUSINESS Plan */}
                  <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Enterprise</span>
                      <h3 className="font-bold text-slate-900 text-lg mt-1">Business Plan</h3>
                      <p className="text-xs text-slate-500 mt-1">Full white-label suite and custom subdomains.</p>
                      
                      <div className="my-5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900">${billingPeriod === 'monthly' ? '99' : '79'}</span>
                        <span className="text-slate-400 text-xs">/ month</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                        <li className="flex items-center gap-2">✔ Own Domain CNAME connections</li>
                        <li className="flex items-center gap-2">✔ 100% White-Label Branding</li>
                        <li className="flex items-center gap-2">✔ Custom logo upload</li>
                        <li className="flex items-center gap-2">✔ Full Express Webhooks</li>
                      </ul>
                    </div>
                    
                    <button 
                      id="btn_select_plan_business"
                      onClick={() => handleUpgradeClick('Business')}
                      className="w-full mt-6 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 rounded-lg"
                    >
                      {user.plan === 'Business' ? 'Manage Billing' : 'Upgrade to Business'}
                    </button>
                  </div>

                </div>

              </div>

              {/* Invoices Ledger */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Invoice Ledger & Payment History</span>
                
                <div className="space-y-2">
                  {billingHistory.map((inv) => (
                    <div key={inv.id} className="p-4 border rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{inv.plan}</p>
                        <p className="text-slate-400 mt-0.5">{inv.date} • Paid via {inv.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">${inv.amount}.00</p>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded">🟢 {inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Payment Checkout Modal */}
              <AnimatePresence>
                {billingModalOpen && selectedPlanForUpgrade && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl text-slate-900"
                    >
                      <h3 className="font-bold text-slate-900 text-lg mb-1">Confirm Subscription</h3>
                      <p className="text-xs text-slate-500 mb-6">Set up your secure CustomerLens payment routing ledger.</p>
                      
                      <form onSubmit={handleProcessCheckout} className="space-y-4">
                        
                        {/* Selector Payment Gateway */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            type="button"
                            id="btn_pay_with_stripe"
                            onClick={() => setPaymentMethodSelected('Stripe')}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                              paymentMethodSelected === 'Stripe' 
                                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900' 
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            Pay with Stripe
                          </button>
                          
                          <button
                            type="button"
                            id="btn_pay_with_paypal"
                            onClick={() => setPaymentMethodSelected('PayPal')}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                              paymentMethodSelected === 'PayPal' 
                                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900' 
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            Pay with PayPal
                          </button>
                        </div>

                        {/* Coupon field */}
                        <div className="flex gap-2">
                          <input 
                            id="input_coupon_code"
                            type="text" 
                            placeholder="Enter Promo Coupon..." 
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-grow px-3 py-2 border rounded-xl text-xs uppercase outline-none"
                          />
                          <button 
                            type="button"
                            id="btn_apply_coupon"
                            onClick={handleApplyCoupon}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
                          >
                            Apply
                          </button>
                        </div>

                        {/* stripe fields vs paypal fields */}
                        {paymentMethodSelected === 'Stripe' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Card Number</label>
                              <input 
                                id="input_cc_number"
                                type="text" 
                                required
                                placeholder="4242 •••• •••• 4242" 
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs outline-none font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Expiry</label>
                                <input type="text" placeholder="MM/YY" required className="w-full px-3 py-2 border rounded-xl text-xs outline-none" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">CVV</label>
                                <input type="password" placeholder="•••" required className="w-full px-3 py-2 border rounded-xl text-xs outline-none" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">PayPal Email Account</label>
                            <input 
                              id="input_paypal_email"
                              type="email" 
                              required
                              placeholder="you@paypal-account.com" 
                              value={paypalEmail}
                              onChange={(e) => setPaypalEmail(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none font-mono"
                            />
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                          <button 
                            type="button"
                            id="btn_cancel_upgrade"
                            onClick={() => setBillingModalOpen(false)}
                            className="px-4 py-2 text-slate-500 font-bold"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            id="btn_submit_payment"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md"
                          >
                            Pay & Activate Plan
                          </button>
                        </div>

                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* TAB 7: WHITE LABEL & CUSTOM DOMAIN */}
          {activeTab === 'domain' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">White-Label & Custom Domains</h1>
                <p className="text-slate-500 text-xs">Configure custom domain CNAME records and design brand colors/header logos. (Reserved for Business Plan).</p>
              </div>

              {user.plan !== 'Business' && (
                <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Feature Locked to Business Plan</h4>
                    <p className="text-indigo-700 text-xs mt-0.5">Custom domains and 100% white-labeling elements are restricted to Enterprise/Business subscribers.</p>
                  </div>
                  <button 
                    id="btn_domain_unlock_upgrade"
                    onClick={() => handleUpgradeClick('Business')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}

              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${user.plan !== 'Business' ? 'opacity-40 pointer-events-none' : ''}`}>
                
                {/* Custom Domain setup */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm">Custom Domain CNAME Mapping</h3>
                  <p className="text-xs text-slate-500">Route feedback surveys through your company branding directories (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">feedback.company.com</code>).</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Company Feedback Subdomain</label>
                      <div className="flex gap-2">
                        <input 
                          id="input_custom_domain"
                          type="text" 
                          placeholder="feedback.your-store.com" 
                          value={domainInput}
                          onChange={(e) => setDomainInput(e.target.value)}
                          className="flex-grow px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono outline-none"
                        />
                        <button 
                          id="btn_verify_dns"
                          onClick={handleDomainVerify}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                        >
                          Verify DNS
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-[11px] font-mono">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">DNS DNS/CNAME Guideline</span>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-400">Record Type</span>
                        <span className="font-bold">CNAME</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-400">Host/Alias</span>
                        <span className="font-bold">feedback</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Points to</span>
                        <span className="font-bold">cname.customerlens.app</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${dnsVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-slate-800">{dnsVerified ? '🟢 Active Routing Verified' : '🔴 Pending CNAME Registration'}</span>
                    </div>
                  </div>
                </div>

                {/* White Labeling panel */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm">100% White Label Customizations</h3>
                  <p className="text-xs text-slate-500">Remove all CustomerLens watermarks and style headers/emails matching your corporate identity guidelines.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Company Header Logo URL</label>
                      <input 
                        id="input_white_label_logo"
                        type="url" 
                        placeholder="https://yourdomain.com/assets/logo.png" 
                        value={wlLogo}
                        onChange={(e) => setWlLogo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Brand Theme Color Primary</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={wlColor} 
                          onChange={(e) => setWlColor(e.target.value)}
                          className="h-8 w-12 rounded cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={wlColor} 
                          onChange={(e) => setWlColor(e.target.value)}
                          className="flex-grow px-2.5 py-1.5 border rounded text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Feedback Email Branding Header</label>
                      <input 
                        id="input_white_label_email"
                        type="text" 
                        placeholder="e.g. Acme Support Team" 
                        value={wlEmail}
                        onChange={(e) => setWlEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        id="checkbox_wl_remove_branding"
                        type="checkbox" 
                        checked={wlRemoveBranding} 
                        onChange={(e) => setWlRemoveBranding(e.target.checked)}
                        className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Remove CustomerLens watermark badge</p>
                        <p className="text-[10px] text-slate-500">Completely hides the "Powered by CustomerLens" footer tagline from surveys.</p>
                      </div>
                    </div>

                    <button 
                      id="btn_save_white_label"
                      onClick={handleSaveWhiteLabel}
                      className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      Save Branding Configurations
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 8: ADMIN MASTER CONSOLE */}
          {activeTab === 'admin' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Admin Panel Console</h1>
                <p className="text-slate-500 text-xs">Observe all connected stores, track active installation logs, verify subscription payments, and manage user catalogs.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active catalogs list */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Connected website catalog */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-3">Global Website Connection Logs</span>
                    
                    <div className="space-y-3">
                      {websites.map((w) => (
                        <div key={w.id} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold font-mono">
                              {w.platform.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{w.url}</p>
                              <p className="text-slate-400 text-[10px]">{w.platform} • Installed via self-service api</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              w.status === 'Connected' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {w.status === 'Connected' ? '🟢 Active Tracker' : '🔴 Code Not Found'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Users logs */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-3">Self-Service User Catalog</span>
                    
                    <div className="space-y-2">
                      <div className="p-3 border bg-slate-50/50 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-slate-400 text-[10px]">{user.email} • Trial expires: {new Date(user.trialEndsAt).toLocaleDateString()}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase text-[9px]">Verified Account</span>
                      </div>

                      <div className="p-3 border rounded-xl flex justify-between items-center text-xs opacity-65">
                        <div>
                          <p className="font-bold text-slate-900">John Doe (Demo Store)</p>
                          <p className="text-slate-400 text-[10px]">demo-shop@gmail.com • Subscribed: Pro</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase text-[9px]">Active Sub</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Performance overview metrics */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Global Billing Overview</span>
                    
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-baseline text-slate-800 text-xs">
                        <span className="font-semibold">All Payments Captured</span>
                        <span className="font-bold text-slate-950">${billingHistory.reduce((sum, item) => sum + item.amount, 0)}.00</span>
                      </div>
                      
                      <div className="flex justify-between items-baseline text-slate-800 text-xs">
                        <span className="font-semibold">Active Trials Running</span>
                        <span className="font-bold text-slate-950">2 Accounts</span>
                      </div>

                      <div className="flex justify-between items-baseline text-slate-800 text-xs">
                        <span className="font-semibold">Platform Server Health</span>
                        <span className="text-emerald-700 font-bold">100% Online</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </main>

      </div>

    </div>
  );
}
