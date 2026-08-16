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
  Database, 
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
  Menu,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  FileSpreadsheet,
  Send,
  Activity,
  PieChart,
  Pipette,
  Paintbrush,
  ShieldCheck,
  CheckCircle,
  X,
  Bell,
  Lightbulb,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Filter,
  CalendarDays,
  RotateCcw
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
import CodeExporter from './CodeExporter';
import { WebsiteVerification } from './WebsiteVerification';

function ConversionOpportunitiesTab() {
  const [sessions, setSessions] = useState(10000);
  const [abandonRate, setAbandonRate] = useState(70);
  const visitors = Math.round(sessions * (abandonRate / 100));
  const recovered = Math.round(visitors * 0.15); // AI 15% recovery rate
  const revenue = Math.round(recovered * 45); // $45 average order value

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="text-indigo-600 animate-pulse" size={22} />
          Conversion Opportunities
        </h2>
        <p className="text-slate-500 text-xs mt-1">AI suggestions to increase sales.</p>
      </div>

      {/* AI Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono text-[8px] font-bold px-2.5 py-1 uppercase rounded-bl-xl">
            Est. Lift: +18.4%
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-mono uppercase font-bold">Shipping Opt</span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">Offer Free Cold Shipping Threshold</h4>
          <p className="text-slate-500 text-xs leading-normal">
            Deploy a targeted discount widget specifically for users who hesitate in the shipping selection screen, offering free shipping on sour beer multi-packs of $50+.
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono text-[8px] font-bold px-2.5 py-1 uppercase rounded-bl-xl">
            Est. Lift: +14.2%
          </div>
          <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded font-mono uppercase font-bold">Traffic Opt</span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">Adwords Referral Welcome Coupon</h4>
          <p className="text-slate-500 text-xs leading-normal">
            Detect incoming traffic from Google Ad Campaigns and trigger an instantaneous 10% coupon code popup the moment they land from ad campaigns.
          </p>
        </div>

        <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono text-[8px] font-bold px-2.5 py-1 uppercase rounded-bl-xl">
            Est. Lift: +8.5%
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded font-mono uppercase font-bold">Usability Opt</span>
          <h4 className="font-bold text-slate-900 text-sm mt-1">Stripe Checkout Mobile Optimization</h4>
          <p className="text-slate-500 text-xs leading-normal">
            Enlarge checkboxes and make target buttons 44px on iOS checkout pages to prevent checkout rage-clicking on Stripe integrations.
          </p>
        </div>
      </div>

      {/* Interactive Value Estimator */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-6">
        <div>
          <span className="text-[9px] bg-indigo-600 text-indigo-100 font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
            Interactive AI Value Calculator
          </span>
          <h3 className="font-extrabold text-lg tracking-tight text-white mt-2">
            Estimate Your Monthly Revenue Recovery
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Slide the values to estimate your potential recaptured checkout revenue by activating CustomerLens AI feedback triggers on your store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Draggable Sliders */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-slate-300">Target Monthly Sessions</span>
                <span className="text-indigo-400 font-extrabold">{sessions.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={sessions}
                onChange={(e) => setSessions(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1,000</span>
                <span>50,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-slate-300">Current Cart Abandonment Rate</span>
                <span className="text-indigo-400 font-extrabold">{abandonRate}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={abandonRate}
                onChange={(e) => setAbandonRate(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>40%</span>
                <span>95%</span>
              </div>
            </div>
          </div>

          {/* Recaptured ROI details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Abandoning Visitors:</span>
                <span className="font-bold font-mono text-slate-200">{visitors.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Estimated AI Recoveries (15%):</span>
                <span className="font-bold font-mono text-emerald-400">+{recovered.toLocaleString()} / mo</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Average Order Value (AOV):</span>
                <span className="font-bold font-mono text-slate-200">$45.00</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-3 text-center md:text-left">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Recaptured Monthly Revenue</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">${revenue.toLocaleString()}.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardProps {
  user: User;
  workspace: Workspace;
  initialSurvey: Survey;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onUpdateWorkspace: (updatedWorkspace: Partial<Workspace>) => void;
  onGoToLanding: () => void;
}

export default function Dashboard({ 
  user, 
  workspace, 
  initialSurvey, 
  onLogout, 
  onUpdateUser, 
  onUpdateWorkspace,
  onGoToLanding
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'workspace' | 'install' | 'surveys' | 'simulator' | 'analytics' | 'ai-connect' | 'billing' | 'domain' | 'admin'>('workspace');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'pain-points' | 'features' | 'barriers' | 'conversion'>('pain-points');
  const [isAiPublished, setIsAiPublished] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI custom survey generator states
  const [aiSurveyPrompt, setAiSurveyPrompt] = useState('');
  const [isGeneratingAiSurvey, setIsGeneratingAiSurvey] = useState(false);
  const [aiSurveyRecommendation, setAiSurveyRecommendation] = useState<{
    surveyName: string;
    goal: string;
    bestTrigger: string;
    recommendedSurveyType: string;
    estimatedCompletionTime: string;
    deliveryMethod: string;
  } | null>(null);

  const [insightView, setInsightView] = useState<'analytical' | 'chatbot' | 'strategist' | 'notification-data'>('analytical');
  const [notifSearchFilter, setNotifSearchFilter] = useState('');
  const [notifTypeFilter, setNotifTypeFilter] = useState('All');
  const [triggeringNewNotif, setTriggeringNewNotif] = useState(false);

  const [notificationLogs, setNotificationLogs] = useState<Array<{
    id: string;
    type: string;
    channel: string;
    title: string;
    summary: string;
    sentTime: string;
    sentDate: string;
    dayOfWeek: string;
    recipient: string;
    status: 'Delivered' | 'Scheduled' | 'Sent';
    responsesCount?: number;
  }>>([
    {
      id: 'notif-101',
      type: 'Daily Evening Bulletin',
      channel: 'Dashboard Bulletin & Email',
      title: 'Daily Customer Insights Digest',
      summary: '158 new survey responses recorded today. Top exit reason: High Shipping Costs at checkout (38%).',
      sentTime: '09:00 PM',
      sentDate: new Date().toISOString().split('T')[0],
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      recipient: 'store-admin@yourwebsite.com',
      status: 'Delivered',
      responsesCount: 158
    },
    {
      id: 'notif-100',
      type: 'Exit Alert Trigger',
      channel: 'In-App Banner',
      title: 'High Exit Intent Detected on Cart Page',
      summary: 'Spike in cart abandonments detected between 3:00 PM - 5:00 PM. 24 visitors reported pricing friction.',
      sentTime: '05:12 PM',
      sentDate: new Date().toISOString().split('T')[0],
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      recipient: 'In-App Alert Feed',
      status: 'Delivered',
      responsesCount: 24
    },
    {
      id: 'notif-099',
      type: 'Daily Evening Bulletin',
      channel: 'Email',
      title: 'Daily Customer Insights Digest',
      summary: '142 survey responses recorded. 45% discovered store via Google Search organic results.',
      sentTime: '09:00 PM',
      sentDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      dayOfWeek: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
      recipient: 'store-admin@yourwebsite.com',
      status: 'Delivered',
      responsesCount: 142
    },
    {
      id: 'notif-098',
      type: 'Weekly Growth Recap',
      channel: 'Email',
      title: 'Weekly AI Growth & Conversion Summary',
      summary: 'Weekly completion rate reached 91.4%. Strategic recommendation: Add free shipping threshold at $50.',
      sentTime: '09:00 PM',
      sentDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      dayOfWeek: new Date(Date.now() - 86400000 * 3).toLocaleDateString('en-US', { weekday: 'long' }),
      recipient: 'store-admin@yourwebsite.com',
      status: 'Delivered',
      responsesCount: 890
    },
    {
      id: 'notif-097',
      type: 'Daily Evening Bulletin',
      channel: 'Dashboard Bulletin',
      title: 'Daily Customer Insights Digest',
      summary: '118 responses recorded. 32% requested installment/Klarna payment options at checkout.',
      sentTime: '09:00 PM',
      sentDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
      dayOfWeek: new Date(Date.now() - 86400000 * 4).toLocaleDateString('en-US', { weekday: 'long' }),
      recipient: 'store-admin@yourwebsite.com',
      status: 'Delivered',
      responsesCount: 118
    }
  ]);

  const handleTriggerManualBulletin = () => {
    setTriggeringNewNotif(true);
    setTimeout(() => {
      const now = new Date();
      const newLog = {
        id: `notif-${Date.now()}`,
        type: 'On-Demand AI Bulletin',
        channel: 'Dashboard Bulletin & Email',
        title: 'Manual AI Insights Scan Bulletin',
        summary: `Instant AI survey bulletin generated at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Scanned 1,660 responses across active surveys.`,
        sentTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentDate: now.toISOString().split('T')[0],
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        recipient: 'store-admin@yourwebsite.com',
        status: 'Delivered' as const,
        responsesCount: 1660
      };
      setNotificationLogs(prev => [newLog, ...prev]);
      setTriggeringNewNotif(false);
    }, 800);
  };
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string; timestamp: Date }[]>(() => [
    { sender: 'ai', text: 'Hello, please ask me anything about this survey!', timestamp: new Date() }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  const handleSendChat = async (messageText?: string) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim() || isChatTyping) return;

    if (!messageText) {
      setChatInput('');
    }

    const newUserMessage = { sender: 'user' as const, text: textToSend, timestamp: new Date() };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatTyping(true);

    try {
      const response = await fetch('/api/ai/chatbot-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory.map(m => ({ sender: m.sender, text: m.text }))
        })
      });
      const data = await response.json();
      if (data.reply) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.reply, timestamp: new Date() }]);
      } else {
        setChatHistory(prev => [...prev, { sender: 'ai', text: 'I am sorry, I did not receive a valid response from the analytical assistant.', timestamp: new Date() }]);
      }
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'I was unable to connect to the analytical assistant. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Core States (using localStorage for durable client-side persistence)
  const [websites, setWebsites] = useState<ConnectedWebsite[]>(() => {
    const saved = localStorage.getItem('cl_websites');
    if (saved) {
      try {
        const parsed: ConnectedWebsite[] = JSON.parse(saved);
        return parsed.map(w => ({
          ...w,
          verificationStatus: w.verificationStatus || 'Verified',
          verificationToken: w.verificationToken || `cl_verify_${w.id}`,
          siteId: w.siteId || `site_${w.id}`
        }));
      } catch (e) {}
    }
    return [
      {
        id: 'web-1',
        platform: 'Shopify',
        url: workspace.url || 'myshopify-store.com',
        status: 'Connected',
        verificationStatus: 'Verified',
        verificationMethod: 'snippet',
        verificationToken: 'cl_verify_site123',
        siteId: 'site_123',
        verifiedAt: new Date().toISOString(),
        totalVisitors: 1240,
        surveyImpressions: 890,
        surveyResponses: 342
      }
    ];
  });

  // Domain Verification & Live Tracker States
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);
  const [verificationSelectedMethod, setVerificationSelectedMethod] = useState<'snippet' | 'meta' | 'dns'>('snippet');
  const [verificationModalSite, setVerificationModalSite] = useState<ConnectedWebsite | null>(null);
  const [verificationErrorMsg, setVerificationErrorMsg] = useState<string>('');

  const handleVerifyDomain = async (site: ConnectedWebsite, method: 'snippet' | 'meta' | 'dns') => {
    setVerifyingDomainId(site.id);
    setVerificationErrorMsg('');

    try {
      const res = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: site.url,
          method: method || 'snippet',
          verificationToken: site.verificationToken || `cl_verify_${site.id}`,
          siteId: site.siteId || site.id
        })
      });

      if (!res.ok) {
        throw new Error(`Verification service returned status ${res.status}`);
      }
      const data = await res.json();

      if (data.verified) {
        const updatedWebsites = websites.map(w => {
          if (w.id === site.id) {
            return {
              ...w,
              status: 'Connected' as const,
              verificationStatus: 'Verified' as const,
              verificationMethod: method,
              verifiedAt: new Date().toISOString()
            };
          }
          return w;
        });

        setWebsites(updatedWebsites);
        localStorage.setItem('cl_websites', JSON.stringify(updatedWebsites));
        showNotification(`🟢 Domain ownership for ${site.url} verified! CustomerLens AI is active.`, 'success');
        setVerificationModalSite(null);
      } else {
        setVerificationErrorMsg(data.error || `Could not verify domain ownership for ${site.url}. Please check your snippet/tag and try again.`);
      }
    } catch (err: any) {
      console.error(err);
      setVerificationErrorMsg(`Verification request encountered an issue connecting to ${site.url}. Please check your installation.`);
    } finally {
      setVerifyingDomainId(null);
    }
  };

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
    return saved ? JSON.parse(saved) : [];
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

  // AI Connect Tab States
  const [connectUrl, setConnectUrl] = useState('');
  const [connectCategory, setConnectCategory] = useState('SaaS');
  const [connectIsAnalyzing, setConnectIsAnalyzing] = useState(false);
  const [connectResult, setConnectResult] = useState<any | null>(null);
  const [connectError, setConnectError] = useState('');
  const [isSyncingToBuilder, setIsSyncingToBuilder] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Billing states
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(user.billingPeriod);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g. 20 for 20%
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<'Pro' | 'Business' | null>(null);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<'Stripe' | 'PayPal'>('Stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  
  // Real PayPal Order & Capture State in Dashboard
  const [dashboardPaypalOrderId, setDashboardPaypalOrderId] = useState('');
  const [dashboardPaypalApproveUrl, setDashboardPaypalApproveUrl] = useState('');
  const [dashboardPaypalStep, setDashboardPaypalStep] = useState<'input' | 'creating' | 'awaiting_approval' | 'capturing' | 'success' | 'error'>('input');
  const [dashboardPaypalError, setDashboardPaypalError] = useState('');
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);

  // Notifications
  const [notif, setNotif] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Simulator Triggers
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simulatorSelectedAnswer, setSimulatorSelectedAnswer] = useState<string>('');
  const [simulatorFeedbackText, setSimulatorFeedbackText] = useState<string>('');
  const [simulatorRating, setSimulatorRating] = useState<number>(5);

  // Premium Creator Wizard States (Inspired by the screenshot, with black theme)
  const [showPremiumWizard, setShowPremiumWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1); // 1 to 5
  const [wizardSurveyTitle, setWizardSurveyTitle] = useState('Customer Feedback Questionnaire');
  const [wizardSurveyPlacement, setWizardSurveyPlacement] = useState<Survey['displayOption']>('In-Page Popup');
  const [wizardSurveyHeadline, setWizardSurveyHeadline] = useState('Before you fly away...');
  const [wizardQuestions, setWizardQuestions] = useState<Array<{ id: string; type: 'multiple-choice' | 'rating' | 'text'; questionText: string; options: string[] }>>([
    {
      id: 'q1',
      type: 'multiple-choice',
      questionText: 'What was the primary reason for leaving our wild ales catalog today?',
      options: [
        'Shipping rates are too high for cold packs',
        'I want to purchase a different style (IPAs/Stouts)',
        'Just browsing the Kansas local headquarters info',
        'Looking for the physical taproom addresses'
      ]
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      questionText: 'What is your biggest hesitation?',
      options: [
        'Shipping rates are too high for cold packs',
        'I want to purchase a different style (IPAs/Stouts)',
        'Just browsing the Kansas local headquarters info',
        'Looking for the physical taproom addresses'
      ]
    },
    {
      id: 'q3',
      type: 'text',
      questionText: 'What is one wild-fermentation style you would love us to brew next?',
      options: []
    }
  ]);
  const [wizardAllowEdits, setWizardAllowEdits] = useState(true);
  const [wizardAutoAdvance, setWizardAutoAdvance] = useState(true);
  const [wizardAllowResubmissions, setWizardAllowResubmissions] = useState(false);
  const [wizardNotifyOnResponse, setWizardNotifyOnResponse] = useState(true);
  const [wizardAccentColor, setWizardAccentColor] = useState('#1e3a8a');
  const [wizardBgColor, setWizardBgColor] = useState('#ffffff');
  const [wizardTextColor, setWizardTextColor] = useState('#111827');
  
  // Live Preview interactive simulator states
  const [previewActiveQuestionIndex, setPreviewActiveQuestionIndex] = useState(0);
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState('');
  const [previewRatingValue, setPreviewRatingValue] = useState(0);
  const [previewTextValue, setPreviewTextValue] = useState('');
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // --- AI ADVANCED TRIGGER SIMULATOR STATES ---
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [isSimulatingBehavior, setIsSimulatingBehavior] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulatedUserSegment, setSimulatedUserSegment] = useState<'new' | 'returning' | 'paid' | 'cancelled'>('new');
  const [simulatedSurveyState, setSimulatedSurveyState] = useState<'trigger' | 'main' | 'followup' | 'success'>('trigger');
  
  // Custom Dynamic AI-generated survey questions
  const [simulatedHeadline, setSimulatedHeadline] = useState('Wait! Before you leave...');
  const [simulatedQuestion, setSimulatedQuestion] = useState('Why are you abandoning your checkout today?');
  const [simulatedOptions, setSimulatedOptions] = useState<string[]>([]);
  const [simulatedUserResponse, setSimulatedUserResponse] = useState('');
  const [simulatedFollowUpQuestion, setSimulatedFollowUpQuestion] = useState('');
  const [simulatedFollowUpAnswer, setSimulatedFollowUpAnswer] = useState('');

  // --- DAILY REPORT STATES ---
  const [selectedReportDate, setSelectedReportDate] = useState<'today' | 'yesterday' | 'july16' | 'july15'>('today');
  const [isDispatchingReport, setIsDispatchingReport] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [dynamicReportData, setDynamicReportData] = useState<any>(null);
  const [isLoadingReportData, setIsLoadingReportData] = useState(false);
  const [showSandboxData, setShowSandboxData] = useState(false);
  const [analyticsDataSource, setAnalyticsDataSource] = useState<'none' | 'listening' | 'imported' | 'simulated'>('none');
  const [isImportingData, setIsImportingData] = useState(false);
  const [importProvider, setImportProvider] = useState<'ga4' | 'shopify' | 'mixpanel'>('ga4');
  const [importProgress, setImportProgress] = useState(0);

  const handleAnalyzeConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectUrl.trim()) return;
    setConnectIsAnalyzing(true);
    setConnectError('');
    setConnectResult(null);
    setSyncSuccess(false);

    try {
      const response = await fetch('/api/ai/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: connectUrl,
          businessType: connectCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setConnectResult(data);
      showNotification('AI analysis complete! Connected website review retrieved.', 'success');
    } catch (err) {
      console.error(err);
      setConnectError('Could not establish secure AI connection feedback. Please verify the URL.');
      showNotification('Connection analysis failed', 'error');
    } finally {
      setConnectIsAnalyzing(false);
    }
  };

  const handleDeploySurveyLive = async () => {
    const newId = `survey-${Date.now()}`;
    const targetSiteId = websites[0]?.siteId || websites[0]?.id || workspace.id || 'default_site';
    const newSurveyObj: Survey = {
      id: newId,
      title: wizardSurveyTitle,
      displayOption: wizardSurveyPlacement,
      headline: wizardSurveyHeadline,
      questions: wizardQuestions.map(q => ({
        id: q.id,
        type: q.type as any,
        questionText: q.questionText,
        options: q.options
      })),
      colors: {
        background: wizardBgColor,
        text: wizardTextColor,
        accent: wizardAccentColor
      },
      brandingEnabled: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    setSurveys(prev => [newSurveyObj, ...prev.filter(s => s.id !== newId)]);
    setSelectedSurveyId(newId);
    setShowPremiumWizard(false);
    showNotification('🚀 Premium Dark Survey compiled & deployed live!', 'success');

    try {
      const res = await fetch('/api/surveys/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSurveyObj,
          siteId: targetSiteId,
          status: 'published'
        })
      });
      if (res.ok) {
        showNotification('✓ Survey published to customer website live tracker!', 'success');
      }
    } catch (err) {
      console.warn('Backend publish warning:', err);
    }
  };

  const handleSyncToBuilder = () => {
    if (!connectResult) return;
    setIsSyncingToBuilder(true);
    
    setTimeout(() => {
      // Structure the new survey based on AI suggestions
      const cleanUrl = connectUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
      const newSurvey: Survey = {
        id: `ai-survey-${Date.now()}`,
        title: `AI Connected: ${cleanUrl}`,
        displayOption: 'In-Page Popup',
        headline: connectResult.headline || 'Before you go...',
        questions: connectResult.suggestedQuestions.map((q: any, idx: number) => ({
          id: `ai-q-${idx + 1}`,
          type: q.type === 'multiple-choice' ? 'multiple-choice' : 'text',
          questionText: q.questionText,
          options: q.options || [],
        })),
        colors: {
          background: '#ffffff',
          text: '#1e293b',
          accent: '#6366f1'
        },
        brandingEnabled: true,
        active: true,
        createdAt: new Date().toISOString()
      };

      // Add to connected websites list too!
      const mappedPlatform: 'Custom Website' | 'Shopify' = 
        connectCategory === 'E-commerce' ? 'Shopify' : 'Custom Website';

      const newConnectedWeb: ConnectedWebsite = {
        id: `web-ai-${Date.now()}`,
        platform: mappedPlatform,
        url: cleanUrl,
        status: 'Connected',
        verificationStatus: 'Verified',
        verificationToken: `cl_tok_${Date.now()}`,
        siteId: `site_${Math.random().toString(36).substring(2, 8)}`,
        installedAt: new Date().toISOString()
      };

      setWebsites(prev => [newConnectedWeb, ...prev]);
      setSurveys(prev => [newSurvey, ...prev]);
      setSelectedSurveyId(newSurvey.id);
      setIsSyncingToBuilder(false);
      setSyncSuccess(true);
      showNotification('AI Survey successfully synchronized & activated in builder!', 'success');

      // Publish to server backend for live tracking
      fetch('/api/surveys/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSurvey,
          siteId: newConnectedWeb.siteId,
          status: 'published'
        })
      }).catch(console.warn);
    }, 1200);
  };

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const handleGenerateAiSurvey = async () => {
    if (!aiSurveyPrompt.trim()) {
      showNotification('Please enter what you understand could be improved or what your visitors do (e.g., leaving after pricing).', 'error');
      return;
    }
    setIsGeneratingAiSurvey(true);
    setAiSurveyRecommendation(null);
    try {
      const response = await fetch('/api/ai/generate-custom-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiSurveyPrompt })
      });
      if (!response.ok) {
        throw new Error('AI service returned an error status.');
      }
      const data = await response.json();
      if (data && data.surveyName) {
        setWizardSurveyTitle(data.surveyName);
        setWizardSurveyHeadline(data.headline || data.goal || 'Before you fly away...');
        
        // Match placement trigger
        if (data.deliveryMethod === 'Customer Feedback Survey' || data.bestTrigger?.toLowerCase().includes('feedback')) {
          setWizardSurveyPlacement('In-Page Popup');
        } else {
          setWizardSurveyPlacement('Embedded Widget');
        }

        // Map the questions
        if (data.questions && data.questions.length > 0) {
          const mappedQuestions = data.questions.map((q: any, idx: number) => ({
            id: `wizard-q-${idx + 1}-${Date.now()}`,
            type: q.type === 'multiple-choice' ? 'multiple-choice' : q.type === 'rating' ? 'rating' : 'text',
            questionText: q.questionText,
            options: q.options && q.options.length > 0 ? q.options : ['Yes, absolutely', 'Not sure', 'No, not really']
          }));
          setWizardQuestions(mappedQuestions);
        }

        setAiSurveyRecommendation({
          surveyName: data.surveyName,
          goal: data.goal,
          bestTrigger: data.bestTrigger,
          recommendedSurveyType: data.recommendedSurveyType || 'Custom Adaptive Survey',
          estimatedCompletionTime: data.estimatedCompletionTime || 'Under 1 minute',
          deliveryMethod: data.deliveryMethod || 'In-Page Popup'
        });

        showNotification(`🟢 AI Custom Survey designed! Recommended type: ${data.recommendedSurveyType || 'Adaptive'}.`, 'success');
      } else {
        showNotification('AI did not return a structured survey. Try a different request.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Could not reach CustomerLens AI generator right now.', 'error');
    } finally {
      setIsGeneratingAiSurvey(false);
    }
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

  // Load recommendations, backend surveys, and dynamic workspace analytics on mount or when workspace changes
  useEffect(() => {
    triggerRecommendationsLoad();
    triggerExitAnalysisLoad();
    fetchWorkspaceAnalytics();

    // Fetch surveys from server
    fetch('/api/surveys')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.surveys && Array.isArray(data.surveys) && data.surveys.length > 0) {
          setSurveys(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const newSurveys = data.surveys.filter((s: any) => !existingIds.has(s.id));
            return [...newSurveys, ...prev];
          });
        }
      })
      .catch(console.warn);
  }, [workspace.id, workspace.url, workspace.name]);

  const fetchWorkspaceAnalytics = async (forceRefresh?: boolean) => {
    const cacheKey = `cl_analytics_cache_${workspace.id}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setDynamicReportData(JSON.parse(cached));
          return;
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    setIsLoadingReportData(true);
    try {
      const res = await fetch('/api/ai/workspace-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: workspace.name,
          websiteUrl: workspace.url || '',
          businessType: workspace.businessType,
          goal: workspace.goal
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDynamicReportData(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } else {
        console.warn("Workspace analytics endpoint returned non-OK status, utilizing local workspace metrics.");
      }
    } catch (err) {
      console.warn("Workspace analytics request deferred, utilizing local workspace metrics:", err);
    } finally {
      setIsLoadingReportData(false);
    }
  };

  const triggerRecommendationsLoad = async (forceRefresh?: boolean) => {
    const cacheKey = `cl_recs_cache_${workspace.id}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setRecommendations(JSON.parse(cached));
          return;
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    setLoadingRecs(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType: workspace.businessType, goal: workspace.goal })
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const triggerExitAnalysisLoad = async (forceRefresh?: boolean) => {
    const cacheKey = `cl_exit_analysis_cache_${workspace.id}_${responses.length}`;
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setAiAnalysis(JSON.parse(cached));
          return;
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    setAnalyzingExit(true);
    try {
      const res = await fetch('/api/api-exit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, businessName: workspace.name, goal: workspace.goal })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
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

  // Official Shopify App Installation Flow
  const handleShopifyOneClickInstall = () => {
    let shop = typeof window !== 'undefined' ? localStorage.getItem('cl_shopify_shop') : null;
    if (!shop && workspace?.url) {
      const clean = workspace.url.toLowerCase().trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      if (clean.includes('myshopify.com')) {
        shop = clean.endsWith('.myshopify.com') ? clean : `${clean}.myshopify.com`;
      }
    }
    if (!shop && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlShop = urlParams.get('shop');
      if (urlShop) {
        const clean = urlShop.toLowerCase().trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        shop = clean.endsWith('.myshopify.com') ? clean : `${clean}.myshopify.com`;
      }
    }

    if (shop) {
      showNotification('Redirecting to official Shopify App authorization...', 'info');
      window.location.href = `https://customerlens-ai.sangeeta-codes.workers.dev/api/shopify/install?shop=${encodeURIComponent(shop)}`;
    } else {
      const input = prompt('Enter your Shopify Store domain (e.g. your-brand.myshopify.com):');
      if (input && input.trim()) {
        const clean = input.toLowerCase().trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        const fullShop = clean.endsWith('.myshopify.com') ? clean : `${clean}.myshopify.com`;
        localStorage.setItem('cl_shopify_shop', fullShop);
        showNotification('Redirecting to official Shopify App authorization...', 'info');
        window.location.href = `https://customerlens-ai.sangeeta-codes.workers.dev/api/shopify/install?shop=${encodeURIComponent(fullShop)}`;
      }
    }
  };

  // Survey Builder Functions
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyPlacement, setNewSurveyPlacement] = useState<Survey['displayOption']>('In-Page Popup');
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

  // --- BEHAVIORAL TRIGGERS SIMULATION CONFIGURATION ---
  const BEHAVIORAL_SCENARIOS = [
    {
      title: "AI Triggered Survey (Cart Hesitation)",
      badge: "AI Triggered Surveys",
      icon: "ShoppingCart",
      description: "User hesitates on payment details with $99 premium pack in checkout cart for 45 seconds.",
      logs: [
        "[CONNECT] Session #9415 initialized from San Francisco, CA.",
        "[BROWSE] Visited /products/imperial-sour-pack.",
        "[CART] Clicked 'Add to Cart'. Cart size updated: 1 item ($99.00).",
        "[NAVIGATE] Entered /checkout flow.",
        "[HESITATION] Idle on payment billing address input for 45s.",
        "[AI COGNITIVE ENGINE] Triggering survey: High intent cost-hesitation detected.",
        "[SURVEY] Tailored survey dispatched!"
      ],
      headline: "Wait! Before you leave...",
      question: "We noticed you added the Premium Brew pack to your cart but hesitated on checkout. What is the main blocker?",
      options: ["Shipping rates are too high", "Want a different brew style", "Just browsing, will purchase later", "Other"],
      followUp: "I understand price or delivery can be tough! If we send a 15% discount code to your email, would you finish checkout?"
    },
    {
      title: "Different Questions for Different Users",
      badge: "Dynamic Segmentation",
      icon: "Users",
      description: "Auto-segments visitors in real-time. Returning visitors with high cart value get purchase blocker questions.",
      logs: [
        "[CONNECT] Session #1241 initialized from London, UK.",
        "[SEGMENTATION] Analyzing visitor history databases...",
        "[DETECTION] User matched group segment: 'RETURNING VISITOR'.",
        "[NAVIGATE] Landed on main storefront pricing tab.",
        "[AI COGNITIVE ENGINE] Dynamic segment question loaded.",
        "[SURVEY] Targeted survey dispatched!"
      ],
      headline: "Welcome back!",
      question: "What is currently stopping you from completing your purchase?",
      options: ["Pricing is slightly high", "No free shipping option", "Looking for a sold-out release", "Just researching"],
      followUp: "Understood. What competitor or alternative are you currently comparing us to?"
    },
    {
      title: "AI Writes the Question (Pricing Comparison)",
      badge: "AI Question Authoring",
      icon: "Sparkles",
      description: "User compares Pro and Business tiers 3 times, reading features back and forth.",
      logs: [
        "[CONNECT] Session #8832 initialized from Austin, TX.",
        "[NAVIGATE] Visited /pricing page.",
        "[COMPARE] Hovering over 'Pro Tier' features list for 15s.",
        "[COMPARE] Switched to 'Business Tier' card, spent 20s.",
        "[HESITATION] Repetitive plan comparison: 3 visits.",
        "[AI COGNITIVE ENGINE] Bypassing templates: B2B plan hesitation detected.",
        "[SURVEY] Dynamically-authored survey dispatched!"
      ],
      headline: "Let's find the perfect fit...",
      question: "You spent some time comparing our Pro and Business plans today. Which information was missing before choosing?",
      options: ["Detailed feature comparison table", "Custom API integration guides", "Enterprise SLA details", "Pricing customization"],
      followUp: "Good to know! Which specific feature are you hoping to find in our Pro/Business tiers?"
    },
    {
      title: "Behavioral Surveys (Path Tracking)",
      badge: "Behavioral Triggers",
      icon: "Sliders",
      description: "User searches 'refund policy', visits pricing twice, then initiates exit velocity vectors.",
      logs: [
        "[CONNECT] Session #3019 initialized from Toronto, CA.",
        "[SEARCH] Query: 'refund' entered into shop search bar.",
        "[BROWSE] Visited /refund-policy page.",
        "[BROWSE] Visited /pricing page.",
        "[AI COGNITIVE ENGINE] Path signature matched: Risk of checkout cancellation.",
        "[TRIGGER] Dispatched behavioral alignment survey."
      ],
      headline: "Wait! Let's clear any doubts...",
      question: "You searched our refund policy and visited pricing twice today. Was something unclear?",
      options: ["Yes, the refund policy was confusing", "Pricing tiers are slightly expensive", "Looking for refund terms on limited sales", "Just browsing"],
      followUp: "Our customer success team is here for you. What is the main question you have about refunds or pricing?"
    },
    {
      title: "Emotional Detection (Rage Clicks)",
      badge: "Emotional Detection",
      icon: "ShieldAlert",
      description: "User clicks on disabled buttons or slow coupon fields rapidly (3+ clicks in 1.5s).",
      logs: [
        "[CONNECT] Session #5112 initialized from New York, NY.",
        "[NAVIGATE] Checkout billing summary page.",
        "[INPUT] Entered discount code 'LENS100'.",
        "[RAGE] Rapidly clicked 'Apply' button 5 times in 1.2s.",
        "[AI COGNITIVE ENGINE] Frustration signature detected! Emotional state: Frustrated.",
        "[TRIGGER] Instantly popping empathetic support survey."
      ],
      headline: "Oops, looks like something wasn't working!",
      question: "We noticed some frustration clicks on our checkout page. Can you tell us what happened?",
      options: ["The coupon field wouldn't accept my code", "The checkout page was loading too slow", "A button appeared unresponsive", "Other"],
      followUp: "We've logged this immediately for our engineers! Can you briefly describe what you clicked so we can resolve it?"
    },
    {
      title: "AI Follow-up Questions Flow",
      badge: "AI Follow-up",
      icon: "MessageSquare",
      description: "Instead of finishing on choice, the AI asks a smart conversational sub-question based on the selection.",
      logs: [
        "[CONNECT] Session #7721 initialized from Chicago, IL.",
        "[BROWSE] spent 2 minutes reading /features.",
        "[EXIT] Cursor velocity vector towards page close.",
        "[TRIGGER] Feedback survey widget triggered.",
        "[USER CHOICE] Clicked 'Pricing was too high'.",
        "[AI COGNITIVE ENGINE] Analyzing choice context...",
        "[FOLLOW-UP] Loaded conversational follow-up instantly."
      ],
      headline: "Quick feedback question...",
      question: "What was the primary blocker for your purchase today?",
      options: ["Pricing was too high", "Shipping was expensive", "Website loading was slow", "Other"],
      followUp: "Our AI noticed you mentioned Pricing. If we gave you a custom coupon code 'LENS20' right now, would you try us?"
    }
  ];

  const runScenarioSimulation = (scenarioIdx: number) => {
    setSelectedScenarioIdx(scenarioIdx);
    setIsSimulatingBehavior(true);
    setSimulationLogs([]);
    setSimulatedSurveyState('trigger');
    setSimulatedUserResponse('');
    setSimulatedFollowUpAnswer('');

    const scenario = BEHAVIORAL_SCENARIOS[scenarioIdx];
    setSimulatedHeadline(scenario.headline);
    setSimulatedQuestion(scenario.question);
    setSimulatedOptions(scenario.options);
    setSimulatedFollowUpQuestion(scenario.followUp);

    // Segment matching logic
    if (scenarioIdx === 1) {
      // Different Questions for Different Users
      // Segment based question logic will render dynamically
    } else {
      setSimulatedUserSegment('new');
    }

    // Play logs sequentially
    scenario.logs.forEach((logLine, idx) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, logLine]);
        if (idx === scenario.logs.length - 1) {
          setIsSimulatingBehavior(false);
          setSimulatedSurveyState('main');
          showNotification('🟢 AI triggers activated! Interactive survey deployed.', 'info');
        }
      }, (idx + 1) * 450);
    });
  };

  const handleSimulatedSurveySubmit = () => {
    if (!simulatedUserResponse) {
      showNotification('Please select an option first', 'error');
      return;
    }
    setSimulatedSurveyState('followup');
  };

  const handleSimulatedFollowUpSubmit = () => {
    const newResp: SurveyResponse = {
      id: `sim-resp-${Date.now()}`,
      surveyId: selectedSurveyId,
      timestamp: new Date().toISOString(),
      answers: [
        { questionId: 'q1', answer: simulatedUserResponse },
        { questionId: 'q2', answer: '5' },
        { questionId: 'q3', answer: simulatedFollowUpAnswer || 'Simulated user typing feedback.' }
      ],
      visitorMeta: {
        browser: 'Chrome (AI Simulated)',
        country: 'US',
        pageUrl: '/simulated-store'
      }
    };

    setResponses([newResp, ...responses]);
    setSimulatedSurveyState('success');
    showNotification('Simulated feedback logged successfully!', 'success');

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

  // White label upload & dropper helpers
  const handleWlLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setWlLogo(base64);
        extractWlDominantColor(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const extractWlDominantColor = (base64Str: string) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;
        
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i+3];
          if (alpha > 150) { // Only count non-transparent or strongly opaque pixels
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
          }
        }
        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          
          const toHex = (c: number) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          };
          const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
          setWlColor(hexColor);
          showNotification(`🟢 Extracted dominant color ${hexColor.toUpperCase()} from logo!`, 'success');
        }
      } catch (err) {
        console.warn("Could not extract dominant color:", err);
      }
    };
  };

  const handleOpenWlColorDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setWlColor(result.sRGBHex);
          showNotification(`🟢 Picked brand color ${result.sRGBHex.toUpperCase()}!`, 'success');
        }
      } catch (err) {
        console.warn("EyeDropper error:", err);
      }
    } else {
      showNotification("Your current browser doesn't natively support screen eye-dropping. Please use the color palette or type any hex value!", 'info');
    }
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
    } else if (code.startsWith('LENS15') || code.includes('LENS15')) {
      setAppliedDiscount(15);
      showNotification('Success! 15% exit-survey discount coupon applied.', 'success');
    } else {
      showNotification('Invalid coupon code.', 'error');
    }
  };

  // Check for completed survey coupon on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('cl_survey_completed_code');
    if (savedCode && !couponCode) {
      setCouponCode(savedCode);
    }
  }, []);

  // Upgrade/payment processing
  const handleUpgradeClick = (plan: 'Pro' | 'Business') => {
    setSelectedPlanForUpgrade(plan);
    setBillingModalOpen(true);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    const basePrice = selectedPlanForUpgrade === 'Business' ? 99 : 49;
    const finalPrice = Math.round(basePrice * (1 - appliedDiscount / 100) * (billingPeriod === 'yearly' ? 10 : 1));

    if (paymentMethodSelected === 'PayPal') {
      // Real PayPal Orders API flow
      setIsProcessingUpgrade(true);
      setDashboardPaypalStep('creating');
      setDashboardPaypalError('');

      try {
        const createRes = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: selectedPlanForUpgrade.toLowerCase(),
            planId: selectedPlanForUpgrade.toLowerCase(),
            amount: finalPrice.toFixed(2),
            currency: 'USD',
            returnUrl: window.location.href,
            cancelUrl: window.location.href
          })
        });

        const json = await createRes.json() as any;
        if (!createRes.ok || !json.data?.id) {
          throw new Error(json.error?.message || json.message || 'Failed to create PayPal order');
        }

        const orderData = json.data;
        setDashboardPaypalOrderId(orderData.id);
        setDashboardPaypalApproveUrl(orderData.approveUrl || '');
        setDashboardPaypalStep('awaiting_approval');

        if (orderData.approveUrl) {
          window.open(orderData.approveUrl, 'PayPalCheckout', 'width=540,height=720,toolbar=no,menubar=no,location=no,status=no');
        }
      } catch (err: any) {
        setDashboardPaypalError(err?.message || 'Unable to connect to PayPal API.');
        setDashboardPaypalStep('error');
      } finally {
        setIsProcessingUpgrade(false);
      }
      return;
    }

    // Standard Stripe flow
    showNotification(`Processing secure transaction via Stripe...`, 'info');

    setTimeout(() => {
      onUpdateUser({
        plan: selectedPlanForUpgrade,
        billingPeriod,
        subscriptionActive: true,
        trialEndsAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
      });

      const newInvoice: BillingHistoryItem = {
        id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(),
        amount: finalPrice,
        plan: `${selectedPlanForUpgrade} Plan (${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'})`,
        status: 'Paid',
        paymentMethod: 'Stripe',
        invoiceUrl: '#'
      };

      setBillingHistory([newInvoice, ...billingHistory]);
      setBillingModalOpen(false);
      showNotification(`🟢 Welcome to CustomerLens ${selectedPlanForUpgrade}! Your account is activated.`, 'success');
    }, 1500);
  };

  const handleCaptureDashboardPayPal = async () => {
    if (!dashboardPaypalOrderId || !selectedPlanForUpgrade) return;
    setIsProcessingUpgrade(true);
    setDashboardPaypalStep('capturing');
    setDashboardPaypalError('');

    try {
      const res = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: dashboardPaypalOrderId,
          orderId: dashboardPaypalOrderId
        })
      });

      const json = await res.json() as any;
      if (!res.ok || json.data?.status !== 'COMPLETED') {
        throw new Error(json.error?.message || json.message || 'Payment has not been approved on PayPal or capture failed.');
      }

      const captureData = json.data;
      const basePrice = selectedPlanForUpgrade === 'Business' ? 99 : 49;
      const finalPrice = Math.round(basePrice * (1 - appliedDiscount / 100) * (billingPeriod === 'yearly' ? 10 : 1));

      onUpdateUser({
        plan: selectedPlanForUpgrade,
        billingPeriod,
        subscriptionActive: true,
        trialEndsAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
      });

      const newInvoice: BillingHistoryItem = {
        id: `paypal-${captureData.captureId || dashboardPaypalOrderId}`,
        date: new Date().toLocaleDateString(),
        amount: finalPrice,
        plan: `${selectedPlanForUpgrade} Plan (${billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'})`,
        status: 'Paid',
        paymentMethod: 'PayPal',
        invoiceUrl: '#'
      };

      setBillingHistory([newInvoice, ...billingHistory]);
      setDashboardPaypalStep('success');
      showNotification(`🟢 Verified PayPal payment! Capture ID: ${captureData.captureId || dashboardPaypalOrderId}. ${selectedPlanForUpgrade} plan is now active.`, 'success');

      setTimeout(() => {
        setBillingModalOpen(false);
        setDashboardPaypalStep('input');
        setDashboardPaypalOrderId('');
      }, 2000);
    } catch (err: any) {
      setDashboardPaypalError(err?.message || 'PayPal capture verification failed.');
      setDashboardPaypalStep('error');
    } finally {
      setIsProcessingUpgrade(false);
    }
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
            {isAiPublished ? (
              <nav className={`p-4 space-y-3 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
                {/* HOME LINK */}
                <button 
                  id="tab_nav_home"
                  onClick={() => { onGoToLanding(); setMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <Layout size={16} /> Home
                </button>

                {/* WORKSPACE LINK */}
                <button 
                  id="tab_nav_workspace"
                  onClick={() => { setActiveTab('workspace'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'workspace' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Activity size={16} /> Workspace
                </button>

                <div className="pt-2 pb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono px-3">Survey & Slide Modes</span>
                </div>

                {/* PICK QUESTION TEMPLATE */}
                <button 
                  id="tab_nav_pain_points"
                  onClick={() => { 
                    setActiveTab('surveys'); 
                    setShowPremiumWizard(true); 
                    setWizardStep(1); 
                    setMobileMenuOpen(false); 
                    showNotification('📋 Switched to Pick Question Template mode', 'success');
                  }}
                  className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'bg-indigo-600 text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <FileText size={16} className="mt-0.5 flex-shrink-0 text-indigo-400" />
                  <div>
                    <span className="block font-bold">Pick Question Template</span>
                    <span className={`block text-[9px] font-normal leading-tight mt-0.5 ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>
                      Browse and select pre-built question templates.
                    </span>
                  </div>
                </button>

                {/* SLIDE MANAGEMENT */}
                <button 
                  id="tab_nav_feature_requests"
                  onClick={() => { 
                    setActiveTab('surveys'); 
                    setShowPremiumWizard(true); 
                    setWizardStep(1); 
                    setMobileMenuOpen(false); 
                    showNotification('🎛️ Switched to Slide Management mode', 'success');
                  }}
                  className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'bg-indigo-600 text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Sliders size={16} className="mt-0.5 flex-shrink-0 text-indigo-400" />
                  <div>
                    <span className="block font-bold">Slide Management</span>
                    <span className={`block text-[9px] font-normal leading-tight mt-0.5 ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>
                      Manage, reorder and configure survey slides.
                    </span>
                  </div>
                </button>

                {/* USE A PROMPT (AI) */}
                <button 
                  id="tab_nav_purchase_barriers"
                  onClick={() => { 
                    setActiveTab('surveys'); 
                    setShowPremiumWizard(true); 
                    setWizardStep(1); 
                    setMobileMenuOpen(false); 
                    showNotification('✨ AI Slide Generator active — Enter prompt below to create a slide', 'info');
                  }}
                  className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'bg-indigo-600 text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
                  <div>
                    <span className="block font-bold">Use a Prompt (AI)</span>
                    <span className={`block text-[9px] font-normal leading-tight mt-0.5 ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>
                      Generate custom question slides with AI prompts.
                    </span>
                  </div>
                </button>

                {/* FULL SURVEY PREVIEW */}
                <button 
                  id="tab_nav_conversion_opportunities"
                  onClick={() => { 
                    setActiveTab('surveys'); 
                    setShowPremiumWizard(true); 
                    setWizardStep(1); 
                    setMobileMenuOpen(false); 
                    showNotification('👁️ Opened Full Survey Interactive Preview', 'success');
                  }}
                  className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'bg-indigo-600 text-white shadow-md font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Eye size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                  <div>
                    <span className="block font-bold">Full Survey Preview</span>
                    <span className={`block text-[9px] font-normal leading-tight mt-0.5 ${activeTab === 'surveys' && showPremiumWizard && wizardStep === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>
                      Preview complete multi-slide survey experience.
                    </span>
                  </div>
                </button>

                {/* PAY LINK */}
                <button 
                  id="tab_nav_billing"
                  onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <CreditCard size={16} /> Pay / Upgrade
                </button>

                {/* Mode switcher back to builder */}
                <div className="border-t border-slate-800 mt-4 pt-3.5 px-1 select-none">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-1">Workspace Mode</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiPublished(false);
                        showNotification('Switched to Developer Builder mode', 'success');
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] py-1.5 rounded-lg transition-all"
                    >
                      🛠 Go to Builder Mode
                    </button>
                  </div>
                </div>
              </nav>
            ) : (
              <nav className={`p-4 space-y-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
                <button 
                  id="tab_nav_home"
                  onClick={() => { onGoToLanding(); setMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <Layout size={16} /> Home
                </button>
                
                <button 
                  id="tab_nav_workspace"
                  onClick={() => { setActiveTab('workspace'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'workspace' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Activity size={16} /> Workspace
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
                  <Eye size={16} /> Live Survey Simulator
                </button>

                <button 
                  id="tab_nav_analytics"
                  onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <LineChart size={16} /> AI Exit CRO Analytics
                </button>

                <button 
                  id="tab_nav_ai_connect"
                  onClick={() => { setActiveTab('ai-connect'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'ai-connect' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Sparkles size={16} className="text-indigo-400" /> AI Connect & Intelligence
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
                  <Globe size={16} /> Verify Website & Settings
                </button>

                {/* Master Admin Portal */}
                <button 
                  id="tab_nav_admin"
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border-t border-slate-800 mt-4 pt-4 ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-indigo-400 hover:text-indigo-300'}`}
                >
                  <Users size={16} /> Admin Console
                </button>

                {/* Switch back card */}
                <div className="border-t border-slate-800 mt-4 pt-3.5 px-1 select-none">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-center">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono block mb-1">AI Live & Published</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiPublished(true);
                        showNotification('Switched to live Analytics Workspace mode', 'success');
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1.5 rounded-lg transition-all"
                    >
                      📊 See Live Analytics
                    </button>
                  </div>
                </div>
              </nav>
            )}
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
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {testingInstallation ? <RefreshCw className="animate-spin" size={12} /> : <Check size={12} />} Test Connection
                    </button>
                    <button 
                      id="btn_reconnect_widget"
                      onClick={handleReconnect}
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Reconnect
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected Domain & Real-time AI Status Card */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase mb-1">
                      <Globe size={12} /> Connected Domain Status
                    </div>
                    <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                      {websites[0]?.url || 'myshopify-store.com'}
                      <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                        {websites[0]?.platform || 'Custom Website'}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {websites[0]?.verificationStatus === 'Verified' ? (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-3 py-1 rounded-full text-xs font-mono font-extrabold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        🟢 Domain Ownership Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => setVerificationModalSite(websites[0])}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <ShieldAlert size={14} /> Verify Domain Ownership
                      </button>
                    )}

                    <button
                      onClick={() => setVerificationModalSite(websites[0])}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Code size={13} /> Snippet / Setup
                    </button>
                  </div>
                </div>

                {/* Real Website Real-time Integration Status Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono pt-1">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">1. Website</span>
                    <span className={websites[0]?.status === 'Connected' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {websites[0]?.status === 'Connected' ? '🟢 Connected' : '🔴 Pending'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">2. Ownership</span>
                    <span className={websites[0]?.verificationStatus === 'Verified' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {websites[0]?.verificationStatus === 'Verified' ? '🟢 Verified' : '🟡 Unverified'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">3. CustomerLens AI</span>
                    <span className={websites[0]?.verificationStatus === 'Verified' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
                      {websites[0]?.verificationStatus === 'Verified' ? '🟢 Active' : '⚪ Locked'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">4. Visitor Tracking</span>
                    <span className={websites[0]?.verificationStatus === 'Verified' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
                      {websites[0]?.verificationStatus === 'Verified' ? '🟢 Live' : '⚪ Waiting'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">5. Survey Engine</span>
                    <span className={websites[0]?.verificationStatus === 'Verified' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
                      {websites[0]?.verificationStatus === 'Verified' ? '🟢 Ready' : '⚪ Waiting'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">6. Behavior AI</span>
                    <span className={websites[0]?.verificationStatus === 'Verified' ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
                      {websites[0]?.verificationStatus === 'Verified' ? '🟢 Learning' : '⚪ Off'}
                    </span>
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
                  <p className="text-sm font-semibold text-slate-800 mt-1.5 truncate">{surveys[0]?.displayOption || 'In-Page Popup'}</p>
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
                    className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-700 disabled:opacity-50 cursor-pointer"
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

          {/* TAB 1B: WORKSPACE INSIGHTS */}
          {activeTab === 'workspace' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-150 pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-indigo-600 animate-pulse" size={24} />
                    Workspace Intelligence Center
                  </h1>
                  <p className="text-slate-500 text-xs mt-1">
                    Select your preferred AI workspace mode to analyze survey data, generate growth strategies, or inspect notification delivery logs.
                  </p>
                </div>
                
                {/* Mode Selector Tabs */}
                <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner gap-1">
                  <button 
                    type="button"
                    onClick={() => setInsightView('analytical')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      insightView === 'analytical' 
                        ? 'bg-slate-900 text-white shadow-md scale-[1.02]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <PieChart size={14} />
                    <span>Analytical Graphs</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setInsightView('chatbot')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      insightView === 'chatbot' 
                        ? 'bg-slate-900 text-white shadow-md scale-[1.02]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>AI Assistant Mode</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setInsightView('strategist')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      insightView === 'strategist' 
                        ? 'bg-slate-900 text-white shadow-md scale-[1.02]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Lightbulb size={14} className="text-amber-400" />
                    <span>AI Strategist</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setInsightView('notification-data')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      insightView === 'notification-data' 
                        ? 'bg-slate-900 text-white shadow-md scale-[1.02]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Bell size={14} className="text-emerald-400" />
                    <span>AI Notification Log</span>
                  </button>
                </div>
              </div>

              {insightView === 'analytical' && (
                <div className="space-y-6">
                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Total Responses</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">1,660</h2>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-extrabold mt-4">↑ 24.5% vs Last 30 Days</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Completion Rate</span>
                        <h2 className="text-3xl font-extrabold text-indigo-600 mt-1 font-mono">91.4%</h2>
                      </div>
                      <span className="text-[10px] text-indigo-500 font-extrabold mt-4">9.8x higher than flat forms</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Sentiment Index</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">84 / 100</h2>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-extrabold mt-4">🟢 Mostly Positive</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Primary Driver</span>
                        <h2 className="text-lg font-bold text-slate-950 mt-2 truncate">Product Discovery</h2>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-4">Updated 2 minutes ago</span>
                    </div>
                  </div>

                  {/* Main Grid: Pie Chart and Peak Trends */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Pie Chart Card (Span 7) */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">How did you hear about us?</h3>
                          <p className="text-slate-400 text-[10px] font-medium mt-0.5">Response distribution across referral channels</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <button className="p-1.5 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all">
                            <PieChart size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Interactive SVG Pie/Donut Chart */}
                        <div className="md:col-span-5 flex justify-center relative">
                          <svg width="180" height="180" viewBox="0 0 160 160" className="transform -rotate-90">
                            {/* Circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314.16 */}
                            {/* Google Search (22.7%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#4F46E5"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="0"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="Google Search"
                            />
                            {/* Facebook/Instagram (19.5%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#EC4899"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="-71.31"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="Facebook / Instagram"
                            />
                            {/* Shopify App Store (15.6%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#10B981"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="-132.57"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="Shopify App Store"
                            />
                            {/* ChatGPT / Claude (14.6%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#F59E0B"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="-181.58"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="ChatGPT / Claude"
                            />
                            {/* LinkedIn (11.6%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#3B82F6"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="-227.45"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="LinkedIn"
                            />
                            {/* Perplexity (11.6%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#8B5CF6"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="-263.89"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="Perplexity"
                            />
                            {/* Other? Let us know! (4.2%) */}
                            <circle
                              cx="80"
                              cy="80"
                              r="50"
                              fill="transparent"
                              stroke="#64748B"
                              strokeWidth="22"
                              strokeDasharray="314.16"
                              strokeDashoffset="-300.33"
                              className="transition-all duration-300 hover:stroke-[26] cursor-pointer"
                              title="Other"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Total</span>
                            <span className="text-xl font-black text-slate-900 font-mono">1,660</span>
                            <span className="text-[9px] font-bold text-slate-500">Votes</span>
                          </div>
                        </div>

                        {/* Detailed Legend table matching mockup */}
                        <div className="md:col-span-7 space-y-2.5">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 font-mono tracking-widest block">Responses Distribution</span>
                          
                          <div className="space-y-1.5 font-sans">
                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] flex-shrink-0" />
                                <span className="font-bold text-slate-800">Google Search</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">377</span> (22.7%)
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899] flex-shrink-0" />
                                <span className="font-bold text-slate-800">Facebook / Instagram</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">324</span> (19.5%)
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] flex-shrink-0" />
                                <span className="font-bold text-slate-800">Shopify App Store</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">259</span> (15.6%)
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                                <span className="font-bold text-slate-800">ChatGPT / Claude</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">243</span> (14.6%)
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] flex-shrink-0" />
                                <span className="font-bold text-slate-800">LinkedIn</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">194</span> (11.6%)
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] flex-shrink-0" />
                                <span className="font-bold text-slate-800">Perplexity</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">193</span> (11.6%)
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] flex-shrink-0" />
                                <span className="font-bold text-slate-800">Other? Let us know!</span>
                              </div>
                              <div className="font-mono text-slate-500 font-semibold text-right">
                                <span className="text-slate-800 font-bold mr-2">70</span> (4.2%)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Peak Trends & Hotspots (Span 5) */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="font-bold text-slate-900 text-sm">Response Peak Calendar</h3>
                          <p className="text-slate-400 text-[10px] font-medium mt-0.5">Daily volume trends and volume hotspots</p>
                        </div>

                        {/* Custom visual Bar chart for Jan 23-28 peaks */}
                        <div className="space-y-4 pt-1">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>January 26-27 Peak (Hotspot 🔥)</span>
                              <span className="font-bold text-slate-900">158 responses</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>January 24-25</span>
                              <span className="font-bold text-slate-900">84 responses</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#10B981] h-full rounded-full" style={{ width: '51%' }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>January 21-23</span>
                              <span className="font-bold text-slate-900">62 responses</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-slate-400 h-full rounded-full" style={{ width: '38%' }} />
                            </div>
                          </div>
                        </div>

                        {/* Insights message box */}
                        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100/40 text-[11px] leading-relaxed text-indigo-950 mt-4 font-semibold">
                          💡 <strong>Analytic Takeaway:</strong> Google Search remains your most active driver representing 22.7% of responses, while high pricing and shipping costs cause 71% of checkout exits. Introducing a standard free shipping policy is estimated to boost overall conversion by 12-18%.
                        </div>
                      </div>

                      <button
                        onClick={() => setInsightView('chatbot')}
                        className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 mt-5 cursor-pointer border border-indigo-100/35"
                      >
                        Ask Analyst Chat Bot <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: AI ASSISTANT CHATBOT */}
              {insightView === 'chatbot' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col min-h-[500px]">
                  {/* Chat Panel Header */}
                  <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">CustomerLens Intelligent CX Analyst</h3>
                        <p className="text-slate-400 text-[10px] font-medium mt-0.5">Scanning 1,660 Visitor Survey Responses</p>
                      </div>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 font-mono font-bold text-[9px] px-2.5 py-1 rounded-full uppercase">
                      LENS_AI ACTIVE v2.4
                    </span>
                  </div>

                  {/* Messages container */}
                  <div className="flex-grow space-y-4 overflow-y-auto max-h-[350px] p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                    {chatHistory.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div 
                          className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed whitespace-pre-wrap ${
                            msg.sender === 'user' 
                              ? 'bg-slate-900 text-white rounded-tr-none shadow-sm' 
                              : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono mt-1 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}

                    {isChatTyping && (
                      <div className="flex flex-col items-start mr-auto">
                        <div className="bg-white text-slate-800 border border-slate-150 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="text-slate-400 text-[10px] ml-1.5 font-sans">Scanning response logs...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions Chips Area */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 font-mono tracking-widest block">Quick Analytical Queries</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleSendChat("What response trends have you noticed within the last 30 days?")}
                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/40 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        📊 Response Trends (30 Days)
                      </button>
                      <button 
                        onClick={() => handleSendChat("Where are the people who fill out this survey from?")}
                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/40 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        📍 Geotargeted Locations
                      </button>
                      <button 
                        onClick={() => handleSendChat("What do users think about our pricing and shipping?")}
                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/40 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        💰 Pricing & Friction Factors
                      </button>
                    </div>
                  </div>

                  {/* Input Submission Bar */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                    className="flex gap-2.5 items-center border-t border-slate-100 pt-4"
                  >
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Where are the people who fill out this survey from?"
                      className="flex-grow bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatTyping}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold p-3.5 rounded-xl shadow-md transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* MODE 3: AI STRATEGIST & RECOMMENDATIONS */}
              {insightView === 'strategist' && (
                <div className="space-y-6">
                  {/* Revenue Growth Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700">
                          AI Growth Strategy Engine
                        </span>
                        <h2 className="text-2xl font-black mt-2 tracking-tight">E-Commerce Conversion Playbook</h2>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">
                          Calculated directly from 1,660 visitor feedback responses. Executing these 3 CRO recommendations is estimated to recover <strong className="text-emerald-400 font-mono">+$14,200/month</strong> in lost sales.
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[160px]">
                        <span className="text-[10px] font-mono text-slate-300 uppercase block">Est. Revenue Uplift</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">+$14,200 / mo</span>
                        <span className="text-[9px] text-slate-400 block mt-1">Based on 1,660 survey feedback points</span>
                      </div>
                    </div>
                  </div>

                  {/* Playbooks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Playbook 1 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 uppercase">
                            High Priority #1
                          </span>
                          <span className="text-xs font-bold text-emerald-600 font-mono">+18% Conversion</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Add Free Shipping Threshold at Checkout</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          38% of survey drop-offs cite unexpected shipping fees at cart. Introduce a $50 free shipping progress bar trigger.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">Difficulty: Easy (No-Code)</span>
                        <button className="text-[#008060] hover:text-emerald-800 font-bold text-xs flex items-center gap-1 cursor-pointer">
                          <span>Deploy Strategy</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Playbook 2 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200 uppercase">
                            High Priority #2
                          </span>
                          <span className="text-xs font-bold text-emerald-600 font-mono">+12% Recovery</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Highlight Express Apple Pay / Klarna Badges</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          32% of mobile visitors requested installment options or 1-tap checkout. Highlight Klarna installment logos on cart drawer.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">Difficulty: Easy</span>
                        <button className="text-[#008060] hover:text-emerald-800 font-bold text-xs flex items-center gap-1 cursor-pointer">
                          <span>Deploy Strategy</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Playbook 3 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 uppercase">
                            Medium Priority #3
                          </span>
                          <span className="text-xs font-bold text-emerald-600 font-mono">-28% Returns</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Embed Size & Fit AI Calculator on Product Page</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          21% of hesitations stem from sizing uncertainty. Trigger a size assistant survey modal when visitors spend over 15s on PDP.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">Difficulty: Moderate</span>
                        <button className="text-[#008060] hover:text-emerald-800 font-bold text-xs flex items-center gap-1 cursor-pointer">
                          <span>Deploy Strategy</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 4: AI NOTIFICATION DATA LOG (KEEPING TIME, DATE & DAY) */}
              {insightView === 'notification-data' && (() => {
                const filteredNotifLogs = notificationLogs.filter(log => {
                  if (!notifSearchFilter.trim()) return true;
                  const query = notifSearchFilter.toLowerCase().trim();
                  return (
                    log.title.toLowerCase().includes(query) ||
                    log.summary.toLowerCase().includes(query) ||
                    log.sentDate.toLowerCase().includes(query) ||
                    log.dayOfWeek.toLowerCase().includes(query) ||
                    log.sentTime.toLowerCase().includes(query) ||
                    log.type.toLowerCase().includes(query)
                  );
                });

                return (
                  <div className="space-y-6">
                    {/* Search Bar for Keywords, Date, or Day */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          value={notifSearchFilter}
                          onChange={(e) => setNotifSearchFilter(e.target.value)}
                          placeholder="Search by keywords, date, or day (e.g. shipping, 2026-08-01, Monday)..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#008060] focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all shadow-inner"
                        />
                        <Filter size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      </div>
                      {notifSearchFilter && (
                        <button
                          type="button"
                          onClick={() => setNotifSearchFilter('')}
                          className="px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>

                    {/* Notification Data Logs Table / Cards */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="divide-y divide-slate-100">
                        {filteredNotifLogs.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <p className="text-sm font-bold text-slate-700">No matching notification logs found</p>
                            <p className="text-xs text-slate-400">Try searching for keywords like "shipping", a date like "2026-08-01", or a day like "Monday".</p>
                          </div>
                        ) : (
                          filteredNotifLogs.map((log) => (
                            <div key={log.id} className="p-5 hover:bg-slate-50/80 transition-all space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="p-2 bg-emerald-50 text-[#008060] rounded-xl border border-emerald-100 text-sm shrink-0">
                                    <Bell size={16} />
                                  </span>
                                  <div>
                                    <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2 font-mono">
                                      <span>{log.sentDate}, {log.dayOfWeek} - {log.sentTime}</span>
                                    </h4>
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                                {log.summary}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                
                {/* Integration Options Column - DNS Domain Verification */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono flex items-center gap-1">
                      <Sparkles size={12} /> Recommended
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Custom Domain Connection</h3>
                    <p className="text-[11px] text-slate-500">
                      Connect your domain via DNS record to serve surveys directly under your URL.
                    </p>
                  </div>
                  
                  <button 
                    id="btn_open_dns_verification"
                    onClick={() => setActiveTab('settings')}
                    className="w-full text-left p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                        <Globe size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">DNS Record Verification</span>
                        <span className="text-[10px] text-indigo-700 font-medium">CNAME / TXT Record</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">W</div>
                      <span className="text-xs font-semibold text-slate-800">WordPress / WooCommerce</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Auto-verify website domain via CustomerLens embed or DNS header.</p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center font-bold text-xs">F</div>
                      <span className="text-xs font-semibold text-slate-800">Webflow / Headless CMS</span>
                    </div>
                    <input 
                      id="input_webflow_api_key"
                      type="password" 
                      placeholder="Paste Site API Key..." 
                      className="w-full px-2.5 py-1.5 border rounded bg-slate-50 text-xs font-mono"
                    />
                    <button 
                      id="btn_webflow_save"
                      onClick={() => showNotification('API connection key saved.', 'success')}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg"
                    >
                      Connect API
                    </button>
                  </div>
                </div>

                {/* Embed Codes & Manual Embeds */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Script copy-paste & AI Integration Snippets */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-950 text-sm">Custom JavaScript & AI Integration Code</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Paste the snippet tag into the <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">&lt;head&gt;</code> or before the closing <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">&lt;/body&gt;</code> tag of your website to activate event tracking, AI chat, insights, and survey generation.
                      </p>
                    </div>

                    {/* 1. Primary Script Tag */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">1. Main Tracker Script Snippet</span>
                        <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-full">Site ID: {websites[0]?.siteId || websites[0]?.id || 'SITE_ID'}</span>
                      </div>
                      <div className="relative">
                        <pre className="bg-slate-900 text-indigo-300 p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed border border-slate-800">
{`<script async src="${window.location.origin}/tracker.js" data-site-id="${websites[0]?.siteId || websites[0]?.id || 'SITE_ID'}"></script>`}
                        </pre>
                        <button 
                          onClick={() => {
                            const siteId = websites[0]?.siteId || websites[0]?.id || 'SITE_ID';
                            navigator.clipboard.writeText(`<script async src="${window.location.origin}/tracker.js" data-site-id="${siteId}"></script>`);
                            showNotification('Main tracker snippet copied!', 'success');
                          }}
                          className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-md transition-all"
                          title="Copy snippet"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 2. Conversational AI Chat Bot Snippet */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-800">2. Conversational AI Chat Bot</span>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed border border-slate-800">
{`<!-- Add this HTML where you want the chat -->
<div id="ai-chat">
  <div id="chat-messages"></div>
  <input id="chat-input" placeholder="Ask CustomerLens AI..." />
  <button onclick="sendChat()">Send</button>
</div>

<script>
async function sendChat() {
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");
  const userMsg = input.value;
  if (!userMsg) return;

  // Show user message
  messages.innerHTML += "<p><b>You:</b> " + userMsg + "</p>";
  input.value = "";

  // Get AI response
  const reply = await chatWithAI(userMsg, "${websites[0]?.siteId || websites[0]?.id || 'SITE_ID'}");
  messages.innerHTML += "<p><b>AI:</b> " + reply + "</p>";
}
</script>`}
                        </pre>
                        <button 
                          onClick={() => {
                            const siteId = websites[0]?.siteId || websites[0]?.id || 'SITE_ID';
                            const code = `<!-- Add this HTML where you want the chat -->
<div id="ai-chat">
  <div id="chat-messages"></div>
  <input id="chat-input" placeholder="Ask CustomerLens AI..." />
  <button onclick="sendChat()">Send</button>
</div>

<script>
async function sendChat() {
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");
  const userMsg = input.value;
  if (!userMsg) return;

  // Show user message
  messages.innerHTML += "<p><b>You:</b> " + userMsg + "</p>";
  input.value = "";

  // Get AI response
  const reply = await chatWithAI(userMsg, "${siteId}");
  messages.innerHTML += "<p><b>AI:</b> " + reply + "</p>";
}
</script>`;
                            navigator.clipboard.writeText(code);
                            showNotification('AI Chat bot code copied!', 'success');
                          }}
                          className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-md transition-all"
                          title="Copy AI Chat code"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 3. Dashboard Insights Snippet */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-800">3. Dashboard Insights</span>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed border border-slate-800">
{`<div id="ai-insights">Loading insights...</div>

<script>
async function loadInsights() {
  const insights = await getAIInsights("${websites[0]?.siteId || websites[0]?.id || 'SITE_ID'}");
  document.getElementById("ai-insights").innerHTML = insights;
}
loadInsights();
</script>`}
                        </pre>
                        <button 
                          onClick={() => {
                            const siteId = websites[0]?.siteId || websites[0]?.id || 'SITE_ID';
                            const code = `<div id="ai-insights">Loading insights...</div>

<script>
async function loadInsights() {
  const insights = await getAIInsights("${siteId}");
  document.getElementById("ai-insights").innerHTML = insights;
}
loadInsights();
</script>`;
                            navigator.clipboard.writeText(code);
                            showNotification('AI Insights snippet copied!', 'success');
                          }}
                          className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-md transition-all"
                          title="Copy Insights code"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 4. Survey Generation Snippet */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-800">4. Survey Generation</span>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed border border-slate-800">
{`<button onclick="makeSurvey()">Generate Survey with AI</button>
<div id="survey-output"></div>

<script>
async function makeSurvey() {
  const questions = await generateSurvey("${websites[0]?.siteId || websites[0]?.id || 'SITE_ID'}", "ecommerce");
  document.getElementById("survey-output").innerHTML = 
    questions.map(q => "<p>" + q + "</p>").join("");
}
</script>`}
                        </pre>
                        <button 
                          onClick={() => {
                            const siteId = websites[0]?.siteId || websites[0]?.id || 'SITE_ID';
                            const code = `<button onclick="makeSurvey()">Generate Survey with AI</button>
<div id="survey-output"></div>

<script>
async function makeSurvey() {
  const questions = await generateSurvey("${siteId}", "ecommerce");
  document.getElementById("survey-output").innerHTML = 
    questions.map(q => "<p>" + q + "</p>").join("");
}
</script>`;
                            navigator.clipboard.writeText(code);
                            showNotification('Survey Generation code copied!', 'success');
                          }}
                          className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-md transition-all"
                          title="Copy Survey Generator code"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2">
                      <QrCode className="text-amber-700 flex-shrink-0" size={18} />
                      <div>
                        <p className="font-bold text-amber-900 text-xs">Test instant QR & JavaScript integration preview</p>
                        <p className="text-amber-700 text-[11px] mt-0.5">Include the primary tracker script on your page to automatically unlock all <code className="bg-amber-100 px-1 py-0.5 rounded">chatWithAI</code>, <code className="bg-amber-100 px-1 py-0.5 rounded">getAIInsights</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded">generateSurvey</code> functions.</p>
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
              
              {/* Conditional Rendering of Wizard vs. Standard List view */}
              {!showPremiumWizard ? (
                <div className="space-y-6 text-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Survey Blueprints</h1>
                      <p className="text-slate-500 text-xs">Create, manage, and inspect all deployed customer feedback survey widgets active on your domains.</p>
                    </div>
                    
                    <button
                      id="btn_launch_premium_studio_direct"
                      onClick={() => {
                        setShowPremiumWizard(true);
                        setWizardStep(1);
                        setPreviewActiveQuestionIndex(0);
                        setPreviewSubmitted(false);
                      }}
                      className="bg-zinc-950 hover:bg-zinc-900 active:bg-black text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 border border-zinc-800 hover:border-zinc-700"
                    >
                      <Sparkles size={14} className="text-yellow-400" /> Premium Black-Theme Studio 🚀
                    </button>
                  </div>

                  {/* Banner inspired by the premium setup space */}
                  <div className="bg-gradient-to-r from-zinc-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/10 rounded-full blur-2xl" />
                    <div className="space-y-2.5 relative z-10 max-w-xl">
                      <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/30 font-mono">
                        ✨ STEPS COMPILER
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">Interactive 3-Step Setup Space</h2>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        Create custom surveys with interactive slides, automated transitions, allow-edits rules, email routing, and beautiful visual templates inside our dark design chamber.
                      </p>
                    </div>
                    <button
                      id="btn_launch_premium_studio_banner"
                      onClick={() => {
                        setShowPremiumWizard(true);
                        setWizardStep(1);
                        setPreviewActiveQuestionIndex(0);
                        setPreviewSubmitted(false);
                      }}
                      className="bg-white hover:bg-zinc-100 active:bg-zinc-200 text-slate-950 font-black text-xs px-5 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                      Launch Setup Space <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Standard Survey List Column */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">Active Surveys Blueprint</h3>
                      <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full font-mono font-bold text-slate-500">{surveys.length} Loaded</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                      {surveys.map((survey) => (
                        <div key={survey.id} id={`survey_item_${survey.id}`} className="p-4 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                              <Layout size={18} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-950 text-sm leading-snug">{survey.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-semibold text-[10px] text-slate-700">{survey.displayOption}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px]">{survey.questions.length} questions</span>
                                {survey.headline && (
                                  <>
                                    <span>•</span>
                                    <span className="italic truncate max-w-[200px]">"{survey.headline}"</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button 
                              id={`btn_active_sim_${survey.id}`}
                              onClick={() => {
                                setSelectedSurveyId(survey.id);
                                showNotification(`🟢 Selected "${survey.title}" as active survey inside Simulator!`, 'success');
                              }}
                              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                                selectedSurveyId === survey.id 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold shadow-sm' 
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {selectedSurveyId === survey.id ? '🟢 Active in Simulator' : 'Activate in Simulator'}
                            </button>
                            <button 
                              id={`btn_delete_survey_${survey.id}`}
                              onClick={() => {
                                setSurveys(surveys.filter(s => s.id !== survey.id));
                                showNotification('Survey template deleted from client database.', 'info');
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete survey"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* THE PREMIUM BLACK-THEME SETUP SPACE WIZARD */
                <div id="premium_black_wizard" className="bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 p-4 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Decorative background grid and neon lights */}
                  <div className="absolute top-0 left-1/4 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 right-1/4 h-80 w-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* PREMIUM HEADER - Inspired by the screenshot */}
                  <div id="premium_wizard_header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 relative z-10">
                    
                    {/* Left: Wizard Action Next Step */}
                    <div>
                      <button
                        id="btn_header_action_next"
                        onClick={() => {
                          if (wizardStep < 3) {
                            setWizardStep(wizardStep + 1);
                          } else {
                            handleDeploySurveyLive();
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                      >
                        {wizardStep === 3 ? 'Launch Survey' : 'Next Step'} <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Middle: Step Capsule 1/3 */}
                    <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800/80 px-3 py-1.5 rounded-full shadow-inner">
                      <button
                        id="btn_prev_step_capsule"
                        disabled={wizardStep === 1}
                        onClick={() => setWizardStep(wizardStep - 1)}
                        className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <div className="text-xs font-mono font-bold tracking-wider px-2 text-zinc-300">
                        <span className="text-white text-sm font-black">{wizardStep}</span> / 3
                      </div>

                      <button
                        id="btn_next_step_capsule"
                        disabled={wizardStep === 3}
                        onClick={() => setWizardStep(wizardStep + 1)}
                        className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Right: Help button and initials */}
                    <div className="flex items-center gap-3">
                      <button
                        id="btn_wizard_help"
                        onClick={() => showNotification('💡 Design guidelines: Keep surveys to 3 slides maximum for 85% higher exit engagement.', 'info')}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-all border border-zinc-800/80"
                        title="Help / Docs"
                      >
                        <HelpCircle size={16} />
                      </button>

                      <div className="h-8 w-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center font-bold text-white text-xs shadow-md">
                        S
                      </div>

                      <button
                        id="btn_exit_wizard"
                        onClick={() => setShowPremiumWizard(false)}
                        className="text-zinc-400 hover:text-white text-xs font-semibold px-3 py-1.5 hover:bg-zinc-900 rounded-xl transition-all border border-zinc-800/40"
                      >
                        Exit Studio
                      </button>
                    </div>

                  </div>

                  {/* BREADCRUMB ROUTE - Inspired by the screenshot */}
                  <div id="wizard_breadcrumbs" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1 font-mono">
                    <span>cupcake</span>
                    <span>&gt;</span>
                    <span className="text-zinc-400">Surveys</span>
                    <span>&gt;</span>
                    <span className="text-blue-400">3-Step Create Survey Space</span>
                  </div>

                  {/* SPLIT LAYOUT CONTAINER */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 text-left">
                    
                    {/* LEFT PANEL: CONFIGURATION (lg:col-span-6) */}
                    <div className="lg:col-span-6 space-y-6">
                      
                      {/* 1. SURVEY SUMMARY SECTION - Inspired by the screenshot */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                        <div>
                          <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-300">3-Step Setup Summary</h3>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Click any step below to make changes.</p>
                        </div>

                        <div className="space-y-2 text-xs">
                          {/* Step 1 summary row */}
                          <button
                            id="btn_summary_step_1"
                            onClick={() => setWizardStep(1)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              wizardStep === 1 
                                ? 'bg-zinc-800/80 border-blue-600 text-white shadow-md' 
                                : 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-900/60 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-emerald-500">✓</span>
                              <span className="font-bold">Step 1: Questions & AI Generator</span>
                            </div>
                            <span className="font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 border border-zinc-700">
                              {wizardQuestions.length} Items
                            </span>
                          </button>

                          {/* Step 2 summary row */}
                          <button
                            id="btn_summary_step_2"
                            onClick={() => setWizardStep(2)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              wizardStep === 2 
                                ? 'bg-zinc-800/80 border-blue-600 text-white shadow-md' 
                                : 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-900/60 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-emerald-500">✓</span>
                              <span className="font-bold">Step 2: Delivery, Rules & Appearance</span>
                            </div>
                            <span className="font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 border border-zinc-700 truncate max-w-[140px]">
                              {wizardSurveyPlacement}
                            </span>
                          </button>

                          {/* Step 3 summary row */}
                          <button
                            id="btn_summary_step_3"
                            onClick={() => setWizardStep(3)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                              wizardStep === 3 
                                ? 'bg-zinc-800/80 border-blue-600 text-white shadow-md' 
                                : 'bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-900/60 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-blue-500">•</span>
                              <span className="font-bold">Step 3: Deploy & Launch</span>
                            </div>
                            <span className="font-mono text-[10px] text-zinc-500">Ready</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. DYNAMIC WORKSPACE CONFIG SECTION */}
                      
                      {/* STEP 1: QUESTIONS CREATION */}
                      {wizardStep === 1 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <Sliders size={16} className="text-blue-400" />
                            <h4 className="font-extrabold text-sm text-white">Configure Questions & Text</h4>
                          </div>

                          {/* AI GENERATOR BLOCK */}
                          <div className="bg-zinc-950 p-4 rounded-xl border border-blue-900/40 space-y-3">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="text-blue-400 animate-pulse" size={14} />
                              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider font-mono">AI Custom Survey Generator</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-normal">
                              Describe what your visitors do (e.g., "My visitors leave after viewing pricing") or what is happening, and our AI will recommend and design the ideal survey type and questions.
                            </p>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="e.g., My visitors leave after viewing pricing."
                                value={aiSurveyPrompt}
                                onChange={(e) => setAiSurveyPrompt(e.target.value)}
                                className="flex-grow px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 placeholder-zinc-600 transition-all"
                              />
                              <button
                                onClick={handleGenerateAiSurvey}
                                disabled={isGeneratingAiSurvey}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-md shrink-0 transition-all"
                              >
                                {isGeneratingAiSurvey ? 'Designing...' : 'Generate with AI'}
                              </button>
                            </div>

                            {/* AI recommendation feedback rendering */}
                            {aiSurveyRecommendation && (
                              <div className="bg-zinc-900/60 p-3 rounded-lg border border-emerald-900/30 space-y-1.5 mt-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">✓ AI Recommendation</span>
                                  <span className="text-[8px] bg-emerald-950 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded font-mono uppercase">Optimal Fit</span>
                                </div>
                                <div className="text-[11px] space-y-1 text-zinc-300">
                                  <p><strong className="text-white font-semibold">Recommended Survey:</strong> {aiSurveyRecommendation.recommendedSurveyType}</p>
                                  <p><strong className="text-white font-semibold">Goal:</strong> {aiSurveyRecommendation.goal}</p>
                                  <p><strong className="text-white font-semibold">Trigger Condition:</strong> {aiSurveyRecommendation.bestTrigger}</p>
                                  <p><strong className="text-white font-semibold">Est. Time to Complete:</strong> {aiSurveyRecommendation.estimatedCompletionTime}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3.5">
                            <div>
                              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Survey Name / Label</label>
                              <input
                                id="wizard_input_title"
                                type="text"
                                value={wizardSurveyTitle}
                                onChange={(e) => setWizardSurveyTitle(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-600 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Engaging Headline Message</label>
                              <input
                                id="wizard_input_headline"
                                type="text"
                                value={wizardSurveyHeadline}
                                onChange={(e) => setWizardSurveyHeadline(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-600 transition-all"
                              />
                            </div>

                            {/* Question List Editor */}
                            <div className="space-y-3 pt-2">
                              <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Survey Slides Editor</span>
                              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                                {wizardQuestions.map((q, idx) => (
                                  <div key={q.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 relative">
                                    <button
                                      onClick={() => {
                                        if (wizardQuestions.length <= 1) {
                                          showNotification('Keep at least 1 question for client interaction flow.', 'error');
                                          return;
                                        }
                                        setWizardQuestions(wizardQuestions.filter(x => x.id !== q.id));
                                        setPreviewActiveQuestionIndex(0);
                                      }}
                                      className="absolute top-3 right-3 text-zinc-500 hover:text-rose-500 transition-all"
                                      title="Delete question slide"
                                    >
                                      <Trash2 size={13} />
                                    </button>

                                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-blue-400 uppercase">
                                      <span>Slide {idx + 1}: {q.type === 'multiple-choice' ? 'Multiple Choice' : q.type === 'rating' ? 'Star Rating' : 'Open Text'}</span>
                                    </div>

                                    <input
                                      type="text"
                                      value={q.questionText}
                                      onChange={(e) => {
                                        const updated = wizardQuestions.map(x => x.id === q.id ? { ...x, questionText: e.target.value } : x);
                                        setWizardQuestions(updated);
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 outline-none focus:border-blue-500 transition-all"
                                      placeholder="Question text..."
                                    />

                                    {/* Edit Multiple Choice Options */}
                                    {q.type === 'multiple-choice' && (
                                      <div className="space-y-1.5 pt-1">
                                        <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Choices / Options</label>
                                        <div className="grid grid-cols-1 gap-1">
                                          {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-1">
                                              <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                  const newOpts = [...q.options];
                                                  newOpts[oIdx] = e.target.value;
                                                  const updated = wizardQuestions.map(x => x.id === q.id ? { ...x, options: newOpts } : x);
                                                  setWizardQuestions(updated);
                                                }}
                                                className="flex-grow px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300 outline-none"
                                              />
                                              <button
                                                onClick={() => {
                                                  const newOpts = q.options.filter((_, oi) => oi !== oIdx);
                                                  const updated = wizardQuestions.map(x => x.id === q.id ? { ...x, options: newOpts } : x);
                                                  setWizardQuestions(updated);
                                                }}
                                                className="p-1 text-zinc-500 hover:text-rose-500 text-[10px]"
                                              >
                                                ✕
                                              </button>
                                            </div>
                                          ))}
                                          <button
                                            onClick={() => {
                                              const newOpts = [...q.options, 'New Choice Item'];
                                              const updated = wizardQuestions.map(x => x.id === q.id ? { ...x, options: newOpts } : x);
                                              setWizardQuestions(updated);
                                            }}
                                            className="text-left text-[10px] text-blue-400 hover:text-blue-300 font-bold mt-1 inline-flex items-center gap-1"
                                          >
                                            <Plus size={10} /> Add choice
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    const nextId = `q-${Date.now()}`;
                                    setWizardQuestions([...wizardQuestions, { id: nextId, type: 'multiple-choice', questionText: 'What is missing today?', options: ['Clear Pricing', 'Contact info', 'Other'] }]);
                                    showNotification('Slide added: Multiple Choice!', 'success');
                                  }}
                                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] py-1.5 rounded-lg transition-all font-bold"
                                >
                                  + Multiple Choice
                                </button>
                                <button
                                  onClick={() => {
                                    const nextId = `q-${Date.now()}`;
                                    setWizardQuestions([...wizardQuestions, { id: nextId, type: 'rating', questionText: 'Rate our platform out of 5 stars', options: [] }]);
                                    showNotification('Slide added: Star Rating!', 'success');
                                  }}
                                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] py-1.5 rounded-lg transition-all font-bold"
                                >
                                  + Star Rating
                                </button>
                                <button
                                  onClick={() => {
                                    const nextId = `q-${Date.now()}`;
                                    setWizardQuestions([...wizardQuestions, { id: nextId, type: 'text', questionText: 'Any additional feedback?', options: [] }]);
                                    showNotification('Slide added: Text Input!', 'success');
                                  }}
                                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] py-1.5 rounded-lg transition-all font-bold"
                                >
                                  + Open Text
                                </button>
                              </div>

                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: DELIVERY & APPEARANCE */}
                      {wizardStep === 2 && (
                        <div className="space-y-6">
                          {/* 2A: Delivery Placement */}
                          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-blue-400" />
                              <h4 className="font-extrabold text-sm text-white">1. Select Survey Display Placement</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              {[
                                { label: 'In-Page Popup', desc: 'Triggered upon page load or user button click.' },
                                { label: 'Popup After X Seconds', desc: 'Auto triggers after 5 seconds delay.' },
                                { label: 'Floating Widget', desc: 'Launches from bottom corner tab click.' },
                                { label: 'Embedded Form', desc: 'Renders static within webpage layout.' },
                                { label: 'Slide In', desc: 'Slides from page margin beautifully.' },
                                { label: 'Full Page Survey', desc: 'Takeover screen for maximum response rates.' }
                              ].map((opt) => {
                                const isSelected = wizardSurveyPlacement === opt.label;
                                return (
                                  <button
                                    key={opt.label}
                                    id={`btn_wizard_delivery_${opt.label.replace(/\s+/g, '_')}`}
                                    onClick={() => setWizardSurveyPlacement(opt.label as any)}
                                    className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                                      isSelected 
                                        ? 'bg-zinc-800/80 border-blue-600 shadow-md shadow-blue-950/40 text-white' 
                                        : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900/40 text-zinc-400'
                                    }`}
                                  >
                                    <span className="block text-xs font-bold leading-tight">{opt.label}</span>
                                    <span className="block text-[10px] leading-relaxed text-zinc-500">{opt.desc}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2B: Behavior Toggles */}
                          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2">
                              <Sliders size={16} className="text-blue-400" />
                              <h4 className="font-extrabold text-sm text-white">2. Behavior & Logic Rules</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Toggle 1: Allow edits */}
                              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl">
                                <div className="space-y-0.5 pr-2">
                                  <span className="block text-[10px] font-black tracking-wider text-zinc-400 uppercase">Allow Edits</span>
                                  <p className="text-[11px] text-zinc-500 leading-tight">Respondents can edit prior answers.</p>
                                </div>
                                <button
                                  id="toggle_allow_edits"
                                  type="button"
                                  onClick={() => setWizardAllowEdits(!wizardAllowEdits)}
                                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                                    wizardAllowEdits ? 'bg-blue-600' : 'bg-zinc-800'
                                  }`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${wizardAllowEdits ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                              </div>

                              {/* Toggle 2: Auto advance */}
                              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl">
                                <div className="space-y-0.5 pr-2">
                                  <span className="block text-[10px] font-black tracking-wider text-zinc-400 uppercase">Auto Advance</span>
                                  <p className="text-[11px] text-zinc-500 leading-tight">Move to next slide on click.</p>
                                </div>
                                <button
                                  id="toggle_auto_advance"
                                  type="button"
                                  onClick={() => setWizardAutoAdvance(!wizardAutoAdvance)}
                                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                                    wizardAutoAdvance ? 'bg-blue-600' : 'bg-zinc-800'
                                  }`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${wizardAutoAdvance ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                              </div>

                              {/* Toggle 3: Resubmissions */}
                              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl">
                                <div className="space-y-0.5 pr-2">
                                  <span className="block text-[10px] font-black tracking-wider text-zinc-400 uppercase">Allow Resubmissions</span>
                                  <p className="text-[11px] text-zinc-500 leading-tight">Same visitor can submit again.</p>
                                </div>
                                <button
                                  id="toggle_allow_resubmissions"
                                  type="button"
                                  onClick={() => setWizardAllowResubmissions(!wizardAllowResubmissions)}
                                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                                    wizardAllowResubmissions ? 'bg-blue-600' : 'bg-zinc-800'
                                  }`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${wizardAllowResubmissions ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                              </div>

                              {/* Toggle 4: Email Notifications */}
                              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-xl">
                                <div className="space-y-0.5 pr-2">
                                  <span className="block text-[10px] font-black tracking-wider text-zinc-400 uppercase">Email Alert</span>
                                  <p className="text-[11px] text-zinc-500 leading-tight">Notify team on each response.</p>
                                </div>
                                <button
                                  id="toggle_notify_on_response"
                                  type="button"
                                  onClick={() => setWizardNotifyOnResponse(!wizardNotifyOnResponse)}
                                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex-shrink-0 ${
                                    wizardNotifyOnResponse ? 'bg-blue-600' : 'bg-zinc-800'
                                  }`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${wizardNotifyOnResponse ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 2C: Appearance & Themes */}
                          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles size={16} className="text-blue-400" />
                              <h4 className="font-extrabold text-sm text-white">3. Theme & Branding Palette</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { name: 'Neon Cyber Punk', accent: '#ec4899', bg: '#09090b', text: '#fdf2f8' },
                                { name: 'Pure Classic Dark', accent: '#3b82f6', bg: '#111827', text: '#ffffff' },
                                { name: 'Forest Moss', accent: '#10b981', bg: '#0f172a', text: '#f0fdf4' },
                                { name: 'Cozy Warm Sunset', accent: '#f59e0b', bg: '#1e1b4b', text: '#fef08a' }
                              ].map((p) => (
                                <button
                                  key={p.name}
                                  onClick={() => {
                                    setWizardAccentColor(p.accent);
                                    setWizardBgColor(p.bg);
                                    setWizardTextColor(p.text);
                                    showNotification(`Applied preset theme: ${p.name}!`, 'success');
                                  }}
                                  className="p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left space-y-1 text-[11px] transition-all"
                                >
                                  <span className="block font-bold text-white truncate">{p.name}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full border border-zinc-700" style={{ backgroundColor: p.accent }} />
                                    <span className="h-3 w-3 rounded-full border border-zinc-700" style={{ backgroundColor: p.bg }} />
                                    <span className="h-3 w-3 rounded-full border border-zinc-700" style={{ backgroundColor: p.text }} />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: DEPLOY & LAUNCH */}
                      {wizardStep === 3 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2">
                            <Code size={16} className="text-emerald-400" />
                            <h4 className="font-extrabold text-sm text-white">Review & Deploy Live Bundle</h4>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1 bg-zinc-950 p-4 border border-zinc-800 rounded-xl font-mono text-[10px] text-zinc-400">
                              <p className="text-emerald-400 font-bold">● CL_STEPS_COMPILER BUILD v2.1</p>
                              <p className="mt-1">➜ Checking survey integrity: {wizardQuestions.length} slides configured.</p>
                              <p>➜ Delivery system registered: {wizardSurveyPlacement}.</p>
                              <p>➜ Auto-Advance: {wizardAutoAdvance ? 'Enabled' : 'Disabled'} • Allow Edits: {wizardAllowEdits ? 'Enabled' : 'Disabled'}</p>
                              <p className="text-blue-400">➜ Injecting Google Workspace mail hooks.</p>
                              <p className="text-emerald-400 font-semibold">➜ Integrity Check Passed. Status: Ready to deploy.</p>
                            </div>

                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Generated Embed Integration script</span>
                              <div className="relative">
                                <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-xl text-[10px] overflow-x-auto font-mono">
{`<script src="https://customerlens.app/widget.js" data-survey-name="${wizardSurveyTitle.toLowerCase().replace(/\s+/g, '-')}" data-trigger="${wizardSurveyPlacement.toLowerCase().replace(/\s+/g, '-')}"></script>`}
                                </pre>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`<script src="https://customerlens.app/widget.js" data-survey-name="${wizardSurveyTitle.toLowerCase().replace(/\s+/g, '-')}" data-trigger="${wizardSurveyPlacement.toLowerCase().replace(/\s+/g, '-')}"></script>`);
                                    showNotification('Integration script copied!', 'success');
                                  }}
                                  className="absolute top-2.5 right-2.5 bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 rounded-lg"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>

                            <button
                              id="btn_finalize_wizard_survey"
                              onClick={handleDeploySurveyLive}
                              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md active:scale-95 text-center block"
                            >
                              Create & Deploy Survey Live 🚀
                            </button>
                          </div>
                        </div>
                      )}

                      {/* NAV FOOTER BUTTONS */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          id="btn_wizard_back_nav"
                          onClick={() => {
                            if (wizardStep > 1) {
                              setWizardStep(wizardStep - 1);
                            } else {
                              setShowPremiumWizard(false);
                            }
                          }}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl border border-zinc-800 transition-all flex items-center gap-1.5"
                        >
                          <ChevronLeft size={14} /> Back
                        </button>

                        <button
                          id="btn_wizard_next_nav"
                          onClick={() => {
                            if (wizardStep < 3) {
                              setWizardStep(wizardStep + 1);
                            } else {
                              handleDeploySurveyLive();
                            }
                          }}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          {wizardStep === 3 ? 'Launch Survey' : 'Next Step'} <ChevronRight size={14} />
                        </button>
                      </div>

                    </div>

                    {/* RIGHT PANEL: SURVEY PREVIEW & DEVICE FRAME (lg:col-span-6) */}
                    <div className="lg:col-span-6 space-y-4">
                      
                      {/* Title section - inspired by the preview header */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-zinc-300">
                          Survey Preview: {wizardQuestions[previewActiveQuestionIndex]?.type === 'multiple-choice' ? 'Build from scratch' : 'Survey Representation'}
                        </h3>
                        <p className="text-zinc-500 text-[11px]">Survey representation below.</p>
                      </div>

                      {/* HIGH FIDELITY DEVICE PREVIEW WINDOW */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 min-h-[420px] flex flex-col justify-between relative shadow-inner overflow-hidden">
                        
                        {/* Interactive Reset button inside preview */}
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                          <button
                            id="btn_reset_preview_flow"
                            onClick={() => {
                              setPreviewActiveQuestionIndex(0);
                              setPreviewSelectedChoice('');
                              setPreviewRatingValue(0);
                              setPreviewTextValue('');
                              setPreviewSubmitted(false);
                            }}
                            className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded font-mono transition-all"
                          >
                            Reset Flow
                          </button>
                          
                          {previewActiveQuestionIndex > 0 && !previewSubmitted && wizardAllowEdits && (
                            <button
                              id="btn_prev_preview_question"
                              onClick={() => {
                                setPreviewActiveQuestionIndex(previewActiveQuestionIndex - 1);
                                setPreviewSelectedChoice('');
                              }}
                              className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded font-mono transition-all"
                            >
                              ← Prev Slide
                            </button>
                          )}
                        </div>

                        {/* Top corner tracker status bar info */}
                        <div className="absolute top-4 right-4 text-[9px] font-mono font-bold text-zinc-500 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> PREVIEW MODE
                        </div>

                        {/* RENDER THE ACTIVE QUESTION SLIDE */}
                        <div className="flex-grow flex items-center justify-center py-6">
                          <AnimatePresence mode="wait">
                            {!previewSubmitted ? (
                              <motion.div
                                key={previewActiveQuestionIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="w-full max-w-sm rounded-2xl p-5 border relative shadow-xl text-left"
                                style={{
                                  backgroundColor: wizardBgColor,
                                  color: wizardTextColor,
                                  borderColor: `${wizardAccentColor}20`
                                }}
                              >
                                {/* Slide Close Icon */}
                                <button className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity">
                                  ✕
                                </button>

                                <div className="space-y-4">
                                  {/* Headline message */}
                                  <div className="space-y-1">
                                    <span className="block text-[9px] uppercase tracking-wider opacity-40 font-mono font-black">
                                      {wizardSurveyPlacement}
                                    </span>
                                    <h5 className="font-extrabold text-base leading-snug">
                                      {wizardSurveyHeadline}
                                    </h5>
                                    <p className="text-xs font-semibold opacity-80">
                                      {wizardQuestions[previewActiveQuestionIndex]?.questionText || 'Interactive questionnaire slide'}
                                    </p>
                                  </div>

                                  {/* Option List Render */}
                                  {wizardQuestions[previewActiveQuestionIndex]?.type === 'multiple-choice' && (
                                    <div className="space-y-1.5">
                                      {wizardQuestions[previewActiveQuestionIndex]?.options.map((opt, oIdx) => {
                                        const isSelected = previewSelectedChoice === opt;
                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => {
                                              setPreviewSelectedChoice(opt);
                                              if (wizardAutoAdvance) {
                                                setTimeout(() => {
                                                  if (previewActiveQuestionIndex < wizardQuestions.length - 1) {
                                                    setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                                    setPreviewSelectedChoice('');
                                                  } else {
                                                    setPreviewSubmitted(true);
                                                  }
                                                }, 800);
                                              }
                                            }}
                                            className="w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all"
                                            style={{
                                              backgroundColor: isSelected ? `${wizardAccentColor}10` : 'transparent',
                                              borderColor: isSelected ? wizardAccentColor : `${wizardTextColor}20`,
                                              color: wizardTextColor
                                            }}
                                          >
                                            <span className="truncate pr-2">{opt}</span>
                                            <div className="h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? wizardAccentColor : `${wizardTextColor}40` }}>
                                              {isSelected && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: wizardAccentColor }} />}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Star Rating Render */}
                                  {wizardQuestions[previewActiveQuestionIndex]?.type === 'rating' && (
                                    <div className="space-y-3">
                                      <div className="flex justify-center items-center gap-2 py-2">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                          const isActive = previewRatingValue >= star;
                                          return (
                                            <button
                                              key={star}
                                              onClick={() => {
                                                setPreviewRatingValue(star);
                                                if (wizardAutoAdvance) {
                                                  setTimeout(() => {
                                                    if (previewActiveQuestionIndex < wizardQuestions.length - 1) {
                                                      setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                                    } else {
                                                      setPreviewSubmitted(true);
                                                    }
                                                  }, 800);
                                                }
                                              }}
                                              className="text-2xl transition-all hover:scale-125 focus:outline-none"
                                              style={{
                                                color: isActive ? wizardAccentColor : `${wizardTextColor}20`
                                              }}
                                            >
                                              ★
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <p className="text-[10px] text-center opacity-40 font-mono">Click a star to save your response</p>
                                    </div>
                                  )}

                                  {/* Open Text Render */}
                                  {wizardQuestions[previewActiveQuestionIndex]?.type === 'text' && (
                                    <div className="space-y-3">
                                      <textarea
                                        rows={2}
                                        value={previewTextValue}
                                        onChange={(e) => setPreviewTextValue(e.target.value)}
                                        placeholder="Type your response here..."
                                        className="w-full p-2.5 rounded-lg border outline-none text-xs transition-all resize-none"
                                        style={{
                                          backgroundColor: `${wizardBgColor}`,
                                          color: wizardTextColor,
                                          borderColor: `${wizardTextColor}20`
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          if (previewActiveQuestionIndex < wizardQuestions.length - 1) {
                                            setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                            setPreviewTextValue('');
                                          } else {
                                            setPreviewSubmitted(true);
                                          }
                                        }}
                                        className="w-full text-white font-bold text-xs py-2 rounded-lg transition-all"
                                        style={{
                                          backgroundColor: wizardAccentColor
                                        }}
                                      >
                                        Submit Slide
                                      </button>
                                    </div>
                                  )}

                                  {/* Progress indicator */}
                                  <div className="flex items-center justify-between text-[9px] opacity-40 pt-1 border-t" style={{ borderColor: `${wizardTextColor}15` }}>
                                    <span>Slide {previewActiveQuestionIndex + 1} of {wizardQuestions.length}</span>
                                    {!wizardAutoAdvance && (
                                      <button
                                        onClick={() => {
                                          if (previewActiveQuestionIndex < wizardQuestions.length - 1) {
                                            setPreviewActiveQuestionIndex(previewActiveQuestionIndex + 1);
                                          } else {
                                            setPreviewSubmitted(true);
                                          }
                                        }}
                                        className="font-bold hover:underline"
                                      >
                                        Next →
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              /* PREVIEW COMPLETED STATE */
                              <motion.div
                                key="finished"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-sm rounded-2xl p-6 border text-center space-y-4"
                                style={{
                                  backgroundColor: wizardBgColor,
                                  color: wizardTextColor,
                                  borderColor: `${wizardAccentColor}20`
                                }}
                              >
                                <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${wizardAccentColor}15` }}>
                                  💝
                                </div>
                                <div className="space-y-1">
                                  <h6 className="font-extrabold text-sm">Thank You for Deplaying!</h6>
                                  <p className="text-xs opacity-70 max-w-xs mx-auto">
                                    Your response has been registered. This demonstrates how CustomerLens collects insights flawlessly.
                                  </p>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    setPreviewActiveQuestionIndex(0);
                                    setPreviewSelectedChoice('');
                                    setPreviewRatingValue(0);
                                    setPreviewTextValue('');
                                    setPreviewSubmitted(false);
                                  }}
                                  className="text-white font-extrabold text-[11px] px-4 py-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: wizardAccentColor
                                  }}
                                >
                                  Close & Restart Preview
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Bottom notice note - Exactly matching the screenshot */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-start gap-2 text-zinc-400 font-medium">
                          <span className="text-zinc-500 font-extrabold flex-shrink-0 mt-0.5">↑</span>
                          <p className="text-[10px] leading-relaxed text-zinc-500 text-left">
                            A preview of your survey template is printed in the box above. Feel free to click through it. You can always edit this template after saving.
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE AI BEHAVIORAL TRIGGER SIMULATOR */}
          {activeTab === 'simulator' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Behavior-Based Trigger Simulator</h1>
                  <p className="text-slate-500 text-xs">Test how CustomerLens tracks customer behavior patterns in real-time, instantly authoring personalized surveys.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-slate-600">AI SDK Core: ACTIVE</span>
                </div>
              </div>

              {/* Advanced Playground Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Behavior Scenarios & Event Console */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Scenario Cards */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Select Customer Behavior</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Scenarios</span>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {BEHAVIORAL_SCENARIOS.map((sc, sIdx) => {
                        const isSelected = selectedScenarioIdx === sIdx;
                        return (
                          <button
                            key={sIdx}
                            id={`btn_simulate_scenario_${sIdx}`}
                            disabled={isSimulatingBehavior}
                            onClick={() => runScenarioSimulation(sIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                              isSelected 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-250 text-slate-500'}`}>
                              {sc.icon === 'ShoppingCart' ? <ShoppingCart size={15} /> :
                               sc.icon === 'Users' ? <Users size={15} /> :
                               sc.icon === 'Sparkles' ? <Sparkles size={15} /> :
                               sc.icon === 'Sliders' ? <Sliders size={15} /> :
                               sc.icon === 'ShieldAlert' ? <ShieldAlert size={15} /> :
                               <MessageSquare size={15} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-xs tracking-tight block leading-snug">{sc.title}</span>
                                <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase font-mono ${isSelected ? 'bg-indigo-950 text-indigo-300 border border-indigo-900' : 'bg-slate-200 text-slate-600'}`}>{sc.badge}</span>
                              </div>
                              <p className={`text-[10px] mt-1.5 leading-relaxed ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                                {sc.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      id="btn_run_active_simulation"
                      disabled={isSimulatingBehavior}
                      onClick={() => runScenarioSimulation(selectedScenarioIdx)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isSimulatingBehavior ? (
                        <>
                          <RefreshCw className="animate-spin" size={13} /> Simulating Client Activity...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Run Behavioral Simulation
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tech styled telemetry logs console */}
                  <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 space-y-3.5 shadow-xl font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isSimulatingBehavior ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">AI Event Telemetry Feed</span>
                      </div>
                      <span className="text-[9px] text-zinc-600">PID: {Math.floor(1000 + Math.random() * 9000)}</span>
                    </div>

                    <div className="h-[180px] overflow-y-auto space-y-2 text-[11px] leading-relaxed pr-1 custom-scrollbar">
                      {simulationLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center text-zinc-600">
                          <div>
                            <span className="block text-lg mb-1">📟</span>
                            <span>Ready. Select a behavior scenario above and start simulation.</span>
                          </div>
                        </div>
                      ) : (
                        simulationLogs.map((log, lIdx) => {
                          let colorClass = 'text-zinc-400';
                          if (log.includes('[CONNECT]') || log.includes('[BROWSE]')) colorClass = 'text-zinc-400';
                          else if (log.includes('[CART]') || log.includes('[SEARCH]')) colorClass = 'text-emerald-400 font-bold';
                          else if (log.includes('[HESITATION]') || log.includes('[RAGE]')) colorClass = 'text-amber-400 font-bold';
                          else if (log.includes('[AI COGNITIVE ENGINE]') || log.includes('[SEGMENTATION]')) colorClass = 'text-indigo-400 font-bold';
                          else if (log.includes('[TRIGGER]') || log.includes('[SURVEY]')) colorClass = 'text-pink-400 font-bold';
                          return (
                            <motion.div 
                              key={lIdx} 
                              initial={{ opacity: 0, x: -5 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              className={`${colorClass}`}
                            >
                              <span className="text-zinc-600 mr-1.5">[{new Date().toLocaleTimeString()}]</span>
                              {log}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Simulated Storefront Frame */}
                <div className="lg:col-span-7">
                  
                  {/* Browser Mock Wrapper */}
                  <div className="border-4 border-slate-200 bg-slate-50 rounded-3xl overflow-hidden shadow-xl flex flex-col min-h-[560px]">
                    
                    {/* Browser Address Bar */}
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      </div>
                      
                      <div className="flex-grow bg-white border border-slate-200 rounded-lg py-1 px-3 flex items-center justify-between text-[11px] text-slate-500 select-none">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-emerald-600 font-bold">🔒</span>
                          <span className="text-slate-400">https://</span>
                          <span className="text-slate-800 font-semibold truncate">kansas-local-brews.com/checkout</span>
                        </div>
                        <span className="text-zinc-300">⚡</span>
                      </div>
                    </div>

                    {/* Simulated Content Stage */}
                    <div className="flex-grow p-6 flex flex-col justify-center items-center relative overflow-hidden bg-slate-100">
                      
                      {/* Scenario 1: Basic Site Interface Underlay (Low Opacity if survey active) */}
                      <div className={`w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 transition-all duration-300 ${
                        simulatedSurveyState !== 'trigger' ? 'opacity-25 blur-[1px]' : 'opacity-100'
                      }`}>
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-6 bg-slate-900 rounded flex items-center justify-center text-[10px] text-white font-bold font-mono">B</div>
                            <span className="font-extrabold text-xs text-slate-900">Brews Co. Storefront</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Checkout Cart (1)</span>
                        </div>

                        {/* Product Mockup */}
                        <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="h-14 w-14 bg-amber-500 rounded-lg flex items-center justify-center text-xl text-white font-bold flex-shrink-0">
                            🍺
                          </div>
                          <div className="flex-grow">
                            <span className="block text-xs font-bold text-slate-800 leading-tight">Kansas Wild Fermentation Barrel-Aged Special Pack</span>
                            <span className="text-[10px] text-slate-500 block mt-1">Sours, Lambics & Wild Ales (Cold-Packed)</span>
                            <span className="text-xs font-mono font-bold text-slate-800 block mt-1">$99.00</span>
                          </div>
                        </div>

                        {/* Store Checkouts Mock Fields */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase">First Name</label>
                              <div className="w-full h-7 bg-slate-50 border rounded-lg mt-1 px-2.5 py-1 text-[10px] text-slate-800 font-medium">Sangeeta</div>
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase">Last Name</label>
                              <div className="w-full h-7 bg-slate-50 border rounded-lg mt-1 px-2.5 py-1 text-[10px] text-slate-800 font-medium">Codes</div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase">Shipping Address</label>
                            <div className="w-full h-7 bg-slate-50 border rounded-lg mt-1 px-2.5 py-1 text-[10px] text-slate-800 font-medium truncate">Kansas Headquarters Blvd, Suite 240</div>
                          </div>
                        </div>

                        {/* Action checkout buttons */}
                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all">
                          Proceed to Payment Details ($99)
                        </button>
                      </div>

                      {/* --- LIVE SURVEY POPUPS --- */}
                      
                      {/* STATE 1: RUNNING BEHAVIORAL LOGS IN THE BACKGROUND */}
                      {simulatedSurveyState === 'trigger' && isSimulatingBehavior && (
                        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4">
                          <div className="bg-white/95 border border-slate-200/50 p-5 rounded-2xl shadow-2xl text-center max-w-xs space-y-3.5">
                            <RefreshCw className="animate-spin text-indigo-600 mx-auto" size={24} />
                            <div>
                              <p className="font-bold text-xs text-slate-800">Simulating User Behavior...</p>
                              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                                Watch the telemetry feed on the left compile event matrices!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STATE 2: PRIMARY CONVERSATIONAL QUESTION */}
                      {simulatedSurveyState === 'main' && (
                        <div className="absolute inset-0 bg-slate-950/40 z-20 flex items-center justify-center p-4">
                          <motion.div 
                            initial={{ y: 20, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative overflow-hidden text-slate-900 space-y-4"
                          >
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                  {selectedScenarioIdx === 1 ? `${simulatedUserSegment.toUpperCase()} CUSTOMER SEGMENT` : 'AI Context-Triggered'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">CustomerLens SDK</span>
                              </div>
                              <h3 className="text-base font-extrabold tracking-tight mt-2.5 text-slate-900">
                                {simulatedHeadline}
                              </h3>
                              <p className="text-xs text-slate-600 mt-1">
                                {simulatedQuestion}
                              </p>
                            </div>

                            {/* Options buttons */}
                            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5 custom-scrollbar">
                              {simulatedOptions.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSimulatedUserResponse(opt)}
                                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                                    simulatedUserResponse === opt 
                                      ? 'bg-indigo-50/50 border-indigo-600 text-indigo-950' 
                                      : 'border-slate-150 bg-white hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                    simulatedUserResponse === opt ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'
                                  }`}>
                                    {simulatedUserResponse === opt && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                                  </div>
                                  <span className="truncate">{opt}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                              <button 
                                onClick={() => setSimulatedSurveyState('trigger')}
                                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleSimulatedSurveySubmit}
                                disabled={!simulatedUserResponse}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
                              >
                                Continue
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* STATE 3: SMART AI DYNAMIC FOLLOW-UP QUESTION */}
                      {simulatedSurveyState === 'followup' && (
                        <div className="absolute inset-0 bg-slate-950/40 z-20 flex items-center justify-center p-4">
                          <motion.div 
                            initial={{ y: 20, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-slate-900 space-y-4"
                          >
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                                  AI Dynamic Follow-Up Flow
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">Feature 9 Enabled</span>
                              </div>
                              <h3 className="text-base font-extrabold tracking-tight mt-2.5 text-slate-900">
                                Let's get that solved!
                              </h3>
                              <p className="text-xs text-slate-600 mt-1">
                                {simulatedFollowUpQuestion}
                              </p>
                            </div>

                            {/* Chat interaction input area */}
                            <div className="space-y-1.5">
                              <textarea
                                value={simulatedFollowUpAnswer}
                                onChange={(e) => setSimulatedFollowUpAnswer(e.target.value)}
                                placeholder="Type your response..."
                                rows={3}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                              <button 
                                onClick={() => setSimulatedSurveyState('main')}
                                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                              >
                                Back
                              </button>
                              <button 
                                onClick={handleSimulatedFollowUpSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
                              >
                                Submit & Log
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* STATE 4: SUCCESS AND DATA STORAGE FEEDBACK */}
                      {simulatedSurveyState === 'success' && (
                        <div className="absolute inset-0 bg-slate-950/40 z-20 flex items-center justify-center p-4">
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-4"
                          >
                            <div className="mx-auto h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-2xl text-emerald-600">
                              💝
                            </div>
                            <div className="space-y-1.5">
                              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Simulated Response Logged!</h3>
                              <p className="text-slate-500 text-[11px] leading-relaxed">
                                Response has been parsed and compiled into your CustomerLens database. Visit the **CRO Analytics** tab to run Gemini sweeps on this feedback logs.
                              </p>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => {
                                  setSimulatedSurveyState('trigger');
                                  setSimulatedUserResponse('');
                                  setSimulatedFollowUpAnswer('');
                                }}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                              >
                                Try Another
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveTab('analytics');
                                  triggerExitAnalysisLoad();
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                              >
                                View Analytics
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 5: AI EXIT ANALYTICS & CRO REPORTS */}
          {activeTab === 'analytics' && (() => {
            const isInstalled = websites[0]?.status === 'Connected';
            const effectiveSource = showSandboxData ? 'simulated' : analyticsDataSource;

            if (!isInstalled && !showSandboxData) {
              return (
                <div className="space-y-6">
                  {/* Setup Required Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-md border border-slate-800 space-y-6">
                    <div className="max-w-2xl space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
                        📡 Connection Required
                      </div>
                      <h2 className="text-2xl font-extrabold tracking-tight">Activate Real-Time Behavior Analytics</h2>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        To compute conversion rate optimization (CRO) insights, drop-off reasons, customer friction quotes, and sentiment metrics, CustomerLens needs to observe live user gestures. Currently, no active tracking script is connected to <span className="font-mono text-indigo-300 underline font-semibold">{workspace.url || 'your website'}</span>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Action 1: Verify Script */}
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider font-mono">1. Install & Verify Embed Tag</h4>
                          <p className="text-slate-400 text-[11px] leading-relaxed">Copy the light JavaScript embed tag and place it on your web application header or footer templates. Once done, trigger the live verification check.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            id="btn_analytics_go_install"
                            onClick={() => setActiveTab('install')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
                          >
                            Go to Embed Center
                          </button>
                          <button
                            id="btn_analytics_verify_now"
                            onClick={handleTestInstallation}
                            disabled={testingInstallation}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            {testingInstallation ? <RefreshCw className="animate-spin" size={12} /> : <Check size={12} />} Verify Live
                          </button>
                        </div>
                      </div>

                      {/* Action 2: Demo Sandbox */}
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-xs text-indigo-300 uppercase tracking-wider font-mono">2. Explore Sandbox Simulator</h4>
                          <p className="text-slate-400 text-[11px] leading-relaxed">Don't have access to your codebase right now? Launch the demo sandbox mode to explore AI analytics, chart visualizations, and suggestions using customized mock traffic metrics.</p>
                        </div>
                        <button
                          id="btn_analytics_enable_sandbox"
                          onClick={() => setShowSandboxData(true)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all text-center"
                        >
                          Enable Demo Sandbox Mode
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Empty state visual showcase */}
                  <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-12 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <LineChart size={24} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="text-slate-800 font-bold text-xs font-mono tracking-wider">AWAITING SYSTEM INTEGRATION</h4>
                      <p className="text-slate-400 text-[11px]">Install the tracker or toggle Demo Sandbox Mode to unlock visitor quotes, revenue attribution charts, and behavioral AI recommendations.</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (isInstalled && effectiveSource === 'none') {
              return (
                <div className="space-y-6">
                  {/* Setup Success Header Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl text-emerald-700 shrink-0">
                      ✅
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-slate-950 text-sm">Embed Script Connection Verified!</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        The CustomerLens tracker script is successfully installed and verified on <span className="font-mono text-indigo-600 underline font-semibold">{workspace.url || 'your website'}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Header text */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Configure Your Analytics Data Stream</h2>
                    <p className="text-slate-500 text-xs">Choose how CustomerLens should initialize and populate your visitor behavioral reports.</p>
                  </div>

                  {isImportingData ? (
                    // Importing loader visual
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl mx-auto animate-pulse">
                          <Database size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider font-mono">Syncing with {importProvider === 'ga4' ? 'Google Analytics 4' : importProvider === 'shopify' ? 'Shopify Analytics' : 'Mixpanel'}</h3>
                          <p className="text-slate-500 text-xs">Pulling exit cohorts, gesture latency maps, and scroll-abandon ratios...</p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${importProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>{importProgress < 30 ? 'Authorizing connection...' : importProgress < 75 ? 'Parsing 4,240 click zones...' : 'Compiling AI recommendations...'}</span>
                            <span>{importProgress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Main Grid options
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Option 1: Live Listener */}
                      <div className="bg-white hover:border-indigo-400 border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                            📡
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm">Option A: Real-Time Live Listener</h3>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            Observe and record real visitor behaviors directly on your site. As real visitors explore, CustomerLens AI logs their micro-gestures.
                          </p>
                          <div className="bg-slate-50 rounded-lg p-2.5 text-[10px] text-slate-500 leading-normal font-mono">
                            ⏳ Starts collecting immediately. Recommended for active sites with daily organic traffic.
                          </div>
                        </div>
                        <button
                          id="btn_datasource_live"
                          onClick={() => setAnalyticsDataSource('listening')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Activate Live Listener
                        </button>
                      </div>

                      {/* Option 2: Connect Existing Analytics */}
                      <div className="bg-white hover:border-indigo-400 border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                            🔌
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm">Option B: Import Past Analytics</h3>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            Instantly populate charts by syncing historic session data from Google Analytics, Shopify, or Mixpanel accounts.
                          </p>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Provider</label>
                            <select 
                              value={importProvider} 
                              onChange={(e) => setImportProvider(e.target.value as any)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-none"
                            >
                              <option value="ga4">Google Analytics 4</option>
                              <option value="shopify">Shopify Analytics</option>
                              <option value="mixpanel">Mixpanel</option>
                            </select>
                          </div>
                        </div>
                        <button
                          id="btn_datasource_import"
                          onClick={() => {
                            setIsImportingData(true);
                            setImportProgress(0);
                            const interval = setInterval(() => {
                              setImportProgress(p => {
                                if (p >= 100) {
                                  clearInterval(interval);
                                  setTimeout(() => {
                                    setIsImportingData(false);
                                    setAnalyticsDataSource('imported');
                                    showNotification('🟢 Import finished! Historical analytics loaded into CustomerLens dashboard.', 'success');
                                  }, 300);
                                  return 100;
                                }
                                return p + 10;
                              });
                            }, 200);
                          }}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Sync & Import Data
                        </button>
                      </div>

                      {/* Option 3: Seed Simulated Developer Traffic */}
                      <div className="bg-white hover:border-indigo-400 border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                            🧪
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm">Option C: Generate Simulated Traffic</h3>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            Evaluating or running a demo? Inject 500 simulated user gestures and responses to see immediate AI conversion suggestions.
                          </p>
                          <div className="bg-amber-50 rounded-lg p-2.5 text-[10px] text-amber-800 leading-normal font-mono border border-amber-100">
                            ✨ Perfect for sandbox evaluation. Seeds realistic drop-offs customized to your business type.
                          </div>
                        </div>
                        <button
                          id="btn_datasource_simulate"
                          onClick={() => {
                            setAnalyticsDataSource('simulated');
                            showNotification('🟢 Seed complete! Demo traffic injected successfully.', 'success');
                          }}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          Seed Demo Traffic
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            }

            if (isInstalled && effectiveSource === 'listening') {
              return (
                <div className="space-y-6">
                  {/* Real-time listening active header */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <h2 className="text-xl font-extrabold text-slate-900">Live Real-Time Data Stream</h2>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Listening and recording live visitor hesitations on {workspace.url || 'your website'}.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setAnalyticsDataSource('none')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Reconfigure Stream
                      </button>
                    </div>
                  </div>

                  {/* Realtime Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Live Sessions Today</span>
                      <p className="text-2xl font-extrabold text-slate-900 font-mono">0</p>
                      <p className="text-slate-400 text-[10px]">No sessions recorded yet</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Exit Triggers</span>
                      <p className="text-2xl font-extrabold text-slate-900 font-mono">0</p>
                      <p className="text-slate-400 text-[10px]">No exit attempts captured yet</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Feedback Logs</span>
                      <p className="text-2xl font-extrabold text-slate-900 font-mono">0</p>
                      <p className="text-slate-400 text-[10px]">Awaiting first response</p>
                    </div>
                  </div>

                  {/* Console/Terminal feed */}
                  <div className="bg-slate-950 text-slate-400 font-mono text-[10px] p-5 rounded-2xl border border-slate-800 space-y-1.5 h-60 overflow-y-auto shadow-inner">
                    <div className="text-indigo-400 font-bold">📡 CUSTOMER LENS ENGINE CLIENT ACTIVE</div>
                    <div>[{new Date().toLocaleTimeString()}] Tracker script v1.2.0 verified and active</div>
                    <div>[{new Date().toLocaleTimeString()}] Establishing websocket connection...</div>
                    <div>[{new Date().toLocaleTimeString()}] Injection of mouseout overlays complete</div>
                    <div className="text-emerald-400 animate-pulse font-bold font-mono">● Awaiting visitor traffic events... (Listening to {workspace.url})</div>
                  </div>

                  {/* Prompt Box */}
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-950 text-xs">💡 Pro Developer Tips for New Installations</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Because this is a brand-new installation, there is no visitor traffic yet. You don't have to wait for organic visitors to see how CustomerLens works!
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-indigo-100/40 p-4 rounded-xl space-y-3">
                        <p className="text-slate-700 text-xs font-semibold">Option 1: Act as a visitor yourself</p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Go to the **Feedback Simulator** tab. You can interact with your active surveys as if you are a real customer, answer exit questions, and immediately log results in the database!
                        </p>
                        <button 
                          onClick={() => setActiveTab('simulator')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Go to Feedback Simulator
                        </button>
                      </div>
                      <div className="bg-white border border-indigo-100/40 p-4 rounded-xl space-y-3">
                        <p className="text-slate-700 text-xs font-semibold">Option 2: Seed simulation traffic</p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Populate the charts and AI summaries instantly with standard evaluation traffic logs. This lets you inspect all analytics features and suggestions.
                        </p>
                        <button 
                          onClick={() => setAnalyticsDataSource('simulated')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Seed Demo Traffic Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (isLoadingReportData && !dynamicReportData) {
              return (
                <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-slate-800 text-xs font-bold font-mono tracking-wider">ESTABLISHING BEHAVIOR ANALYTICS FEEDBACK...</p>
                    <p className="text-slate-400 text-[10px]">Analyzing real website heuristics, click zones, and response cohorts for {workspace.name}.</p>
                  </div>
                </div>
              );
            }

            const fallbackReportData = {
              today: {
                sessions: 342,
                triggers: 284,
                responseRate: "44.8%",
                revenue: "$2,430.00",
                insight: "Live insight: 12 visitors abandoned checkout cart today. 5 responded to the dynamic price-blocker coupon offer and completed checkout! Conversion rate improvement: +18.4%.",
                reasons: [
                  { reason: 'Price too high', percentage: 41 },
                  { reason: 'Just exploring', percentage: 29 },
                  { reason: 'High shipping costs', percentage: 20 },
                  { reason: 'Website too slow', percentage: 10 }
                ],
                complaints: [
                  "First-time buyers wanted a 10% welcoming discount on our checkout page.",
                  "Some mobile checkout fields required too many taps to input ZIP code.",
                  "Users looking for our physical terms / details menu couldn't find a map."
                ],
                sentiment: "Positive with minor billing hesitation",
                sentimentScore: 78,
                suggestions: [
                  { issue: "Price too high (41%)", recommendation: "Deploy an exit popup offering free shipping on matching multi-packs.", impact: "High Impact" },
                  { issue: "Just exploring (29%)", recommendation: "Introduce a 'Our Brand Story' card in the footer to build local community trust.", impact: "Medium Impact" }
                ]
              },
              yesterday: {
                sessions: 482,
                triggers: 410,
                responseRate: "42.1%",
                revenue: "$4,320.00",
                insight: "Yesterday, 43 visitors abandoned checkout because shipping costs appeared too late. 14 of those replied to the AI Follow-up survey, indicating they would buy if we offered a $5 flat-rate cold pack option.",
                reasons: [
                  { reason: 'Price too high', percentage: 43 },
                  { reason: 'High shipping costs', percentage: 28 },
                  { reason: 'Couldn’t find products', percentage: 17 },
                  { reason: 'Website too slow', percentage: 12 }
                ],
                complaints: [
                  "Shipping rates are not disclosed before the checkout page.",
                  "Visitors wanted a quick search bar to filter products by size/color.",
                  "High price barrier for first-time buyers."
                ],
                sentiment: "Neutral to slightly frustrated (due to unexpected shipping fees)",
                sentimentScore: 48,
                suggestions: [
                  { issue: "High abandonment due to Shipping Costs (28%)", recommendation: "Introduce a 'Free Shipping over $50' banner in the header to set clear expectations.", impact: "High Impact" },
                  { issue: "Price Friction (43%)", recommendation: "Configure a targeted discount code offering 10% off to finalize cart checkout.", impact: "High Impact" }
                ]
              },
              july16: {
                sessions: 512,
                triggers: 439,
                responseRate: "39.8%",
                revenue: "$3,850.00",
                insight: "Our behavioral engine caught 38 users rage-clicking on the Stripe integration card. It was traced to a missing state selector. Fixing this can improve checkout conversion by 8%.",
                reasons: [
                  { reason: 'Price too high', percentage: 38 },
                  { reason: 'High shipping costs', percentage: 25 },
                  { reason: 'Website too slow', percentage: 22 },
                  { reason: 'Just exploring', percentage: 15 }
                ],
                complaints: [
                  "Payment gateway checkout button clicked repeatedly with no loading feedback.",
                  "Terms and conditions checkbox was extremely difficult to tap on iOS.",
                  "Coupon code field was hard to find on mobile browsers."
                ],
                sentiment: "Highly frustrated due to Stripe gateway responsiveness",
                sentimentScore: 32,
                suggestions: [
                  { issue: "Broken Stripe button feedback (22%)", recommendation: "Add a spinner inside the payment button when processing starts to prevent multi-clicks.", impact: "High Impact" },
                  { issue: "T&C checkbox size on iOS", recommendation: "Increase target tap size to 44px to resolve mobile rage-clicking.", impact: "High Impact" }
                ]
              },
              july15: {
                sessions: 389,
                triggers: 320,
                responseRate: "41.2%",
                revenue: "$2,900.00",
                insight: "Google Ads traffic has a 3.5x higher bounce rate compared to Organic search. Suggestion: add an instant coupon code specifically for ad traffic.",
                reasons: [
                  { reason: 'Price too high', percentage: 35 },
                  { reason: 'Just exploring', percentage: 30 },
                  { reason: 'High shipping costs', percentage: 20 },
                  { reason: 'Website too slow', percentage: 15 }
                ],
                complaints: [
                  "No refund policy transparency in the checkout flow.",
                  "Wanted to check Taproom reservation times directly on the page.",
                  "Unexpected pricing add-ons at the final stage."
                ],
                sentiment: "Moderately positive with organic visitors; negative with ad traffic",
                sentimentScore: 61,
                suggestions: [
                  { issue: "High bounce rate on Ad Traffic (3.5x)", recommendation: "Implement an instant 10% discount popup targeting Google Ads referral URLs.", impact: "High Impact" },
                  { issue: "Refund transparency", recommendation: "Place a '100% Satisfaction or Refund' badge directly in the footer.", impact: "Medium Impact" }
                ]
              }
            };

            const reportData = dynamicReportData || fallbackReportData;
            const activeData = reportData[selectedReportDate] || fallbackReportData[selectedReportDate];

            const triggerReportEmailDispatch = () => {
              setIsDispatchingReport(true);
              setDispatchSuccess(false);

              // Step-by-step visual dispatch progression
              setTimeout(() => showNotification('📊 Assembling customer behavior logs...', 'info'), 500);
              setTimeout(() => showNotification('💸 Extracting Revenue Attribution margins...', 'info'), 1300);
              setTimeout(() => showNotification('🤖 Compiling Gemini CRO Insights summary...', 'info'), 2100);
              setTimeout(() => {
                setIsDispatchingReport(false);
                setDispatchSuccess(true);
                showNotification('📬 Daily Executive Digest successfully dispatched to sangeeta.codes@gmail.com!', 'success');
              }, 3000);
            };

            if (isAiPublished) {
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Sandbox Banner */}
                  {!isInstalled && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">✨</span>
                        <div>
                          <p className="font-extrabold text-slate-900">Viewing Demo Sandbox Mode</p>
                          <p className="text-slate-600">Connect your live website tracking script to transition from simulated metrics to real visitor hesitation data.</p>
                        </div>
                      </div>
                      <button
                        id="btn_sandbox_banner_verify_ai"
                        onClick={handleTestInstallation}
                        disabled={testingInstallation}
                        className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold px-3 py-2 rounded-lg font-mono tracking-wide uppercase text-[10px] whitespace-nowrap cursor-pointer"
                      >
                        {testingInstallation ? 'Verifying...' : 'Verify Connection'}
                      </button>
                    </div>
                  )}

                  {isInstalled && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Tracking Active: Awaiting and analyzing real customer hesitations on {workspace.url || 'your website'}
                    </div>
                  )}

                  {analyticsSubTab === 'pain-points' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            <ShieldAlert className="text-rose-500 animate-pulse" size={22} />
                            Top Pain Points
                          </h2>
                          <p className="text-slate-500 text-xs mt-1">The most common reasons customers don't convert.</p>
                        </div>
                        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl px-3.5 py-1.5 text-[11px] font-bold">
                          🚨 Major Checkout Friction Detected
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Primary Obstacle</span>
                          <p className="text-2xl font-extrabold text-rose-600 mt-1">Price Friction</p>
                          <p className="text-slate-500 text-[10px] mt-1">Found in 41% of abandonments</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Checkout Hesitation Rate</span>
                          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">68.4%</p>
                          <p className="text-amber-600 text-[10px] font-semibold mt-1">⚠️ High user confusion detected</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Estimated Revenue Blocked</span>
                          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">$4,320.00</p>
                          <p className="text-emerald-600 text-[10px] font-semibold mt-1">✨ Recoverable with price matching</p>
                        </div>
                      </div>

                      {/* Interactive Chart */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <span className="text-[11px] font-bold uppercase text-slate-400 font-mono block">Abandonment Factor Breakdown</span>
                        <div className="space-y-4">
                          {[
                            { name: 'Pricing Friction (Unclear total cost or coupon seeking)', value: 41, color: 'bg-rose-500' },
                            { name: 'Just Browsing (Exploratory / comparison shopping)', value: 29, color: 'bg-slate-400' },
                            { name: 'Unexpected Shipping Fee (Charged late in flow)', value: 20, color: 'bg-amber-500' },
                            { name: 'Technical Checkout Usability (Form difficulties)', value: 10, color: 'bg-indigo-500' }
                          ].map((item, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-slate-800">
                                <span>{item.name}</span>
                                <span>{item.value}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Quotes */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <span className="text-[11px] font-bold uppercase text-slate-400 font-mono block">Real Customer Quotes & Feedback Logs</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-700 min-w-[500px]">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-mono">
                                <th className="pb-2">Quote</th>
                                <th className="pb-2 text-center">Sentiment</th>
                                <th className="pb-2 text-right">Context</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 font-medium text-slate-800">"The price is higher than standard shops; didn't see welcoming coupon."</td>
                                <td className="py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[9px]">Negative</span></td>
                                <td className="py-3 text-right text-slate-400 font-mono">Chrome / US</td>
                              </tr>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 font-medium text-slate-800">"$15 standard shipping cold pack is too costly."</td>
                                <td className="py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[9px]">Negative</span></td>
                                <td className="py-3 text-right text-slate-400 font-mono">Safari / CA</td>
                              </tr>
                              <tr>
                                <td className="py-3 font-medium text-slate-800">"Mobile form required ZIP code twice, too slow."</td>
                                <td className="py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[9px]">Neutral</span></td>
                                <td className="py-3 text-right text-slate-400 font-mono">iOS / UK</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {analyticsSubTab === 'features' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                          <Sliders className="text-indigo-600" size={22} />
                          Feature Requests
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">Requested improvements ranked by demand.</p>
                      </div>

                      {/* Upvote Board */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <span className="text-[11px] font-bold uppercase text-slate-400 font-mono block">Ranked Customer Feature Demand</span>
                        <div className="space-y-3">
                          {[
                            { title: 'Apple Pay & Google Pay Express Integration', description: 'Enable one-click biometric authentication to purchase sour packs immediately.', votes: 124, status: 'Crucial Demand' },
                            { title: 'Quantity-Based Tiered Discounts', description: 'Offer automatic bulk discounts (e.g. 10% off 4 packs, 15% off 12 packs).', votes: 84, status: 'Planned' },
                            { title: 'Clear Estimated Shipping Times', description: 'Show estimated arrival date immediately on product page before checkout details.', votes: 59, status: 'Under Review' },
                            { title: 'Reorder / Subscription Sub-services', description: 'Allow recurring bi-monthly shipments of local sour brewery items.', votes: 31, status: 'Evaluating' }
                          ].map((feat, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  #{i+1}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-slate-900 text-xs">{feat.title}</h4>
                                  <p className="text-slate-500 text-[11px] mt-1 leading-normal">{feat.description}</p>
                                  <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-[8px] font-bold font-mono bg-indigo-100 text-indigo-800 uppercase">
                                    {feat.status}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className="text-slate-900 text-sm font-extrabold font-mono">{feat.votes}</span>
                                <span className="text-slate-400 text-[9px] font-mono uppercase">Request Upvotes</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {analyticsSubTab === 'barriers' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                          <ShoppingCart className="text-amber-500" size={22} />
                          Purchase Barriers
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">Pricing, trust, shipping, usability, or feature concerns.</p>
                      </div>

                      {/* 4 Pillars bento grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">1. Pricing Concerns</span>
                          <p className="text-sm font-bold text-slate-900">Hesitancy & Coupon Searching</p>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            43% of bounces occur when visitors scroll down to input discount codes, indicating active price-hunting.
                          </p>
                          <span className="inline-flex px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[9px] rounded-full uppercase">Impact: High</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">2. Trust & Security Barriers</span>
                          <p className="text-sm font-bold text-slate-900">Unclear Guarantees & Terms</p>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            28% of first-time buyers exit on payment fields due to lack of standard security/SSL seals or money-back guarantees.
                          </p>
                          <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[9px] rounded-full uppercase">Impact: Medium</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">3. Shipping & Postage Fees</span>
                          <p className="text-sm font-bold text-slate-900">Unexpected Surcharges</p>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            19% of abandonments complain that flat cold shipping packaging rates ($15) were not revealed upfront.
                          </p>
                          <span className="inline-flex px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[9px] rounded-full uppercase">Impact: High</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">4. Usability Obstacles</span>
                          <p className="text-sm font-bold text-slate-900">Form Layout & Input Speeds</p>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            10% of users rage-click or exit on iOS/mobile devices due to tight tap boundaries or too many typing fields.
                          </p>
                          <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[9px] rounded-full uppercase">Impact: Minor</span>
                        </div>
                      </div>

                      {/* Traffic Channel Comparison Table */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <span className="text-[11px] font-bold uppercase text-slate-400 font-mono block">Barrier Breakdown by Traffic Channel</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-700 min-w-[500px]">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-mono">
                                <th className="pb-2">Traffic Channel</th>
                                <th className="pb-2 text-center">Top Barrier</th>
                                <th className="pb-2 text-center">Trigger Sensitivity</th>
                                <th className="pb-2 text-right">Bounce Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 font-bold text-slate-900">Google Paid Ads</td>
                                <td className="py-3 text-center text-slate-600">Pricing Friction</td>
                                <td className="py-3 text-center text-rose-600 font-bold">Extremely High</td>
                                <td className="py-3 text-right font-mono font-bold text-slate-700">74.2%</td>
                              </tr>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 font-bold text-slate-900">Organic Search</td>
                                <td className="py-3 text-center text-slate-600">Shipping Transparency</td>
                                <td className="py-3 text-center text-slate-500 font-bold">Medium</td>
                                <td className="py-3 text-right font-mono font-bold text-slate-700">41.8%</td>
                              </tr>
                              <tr>
                                <td className="py-3 font-bold text-slate-900">Social Referrals</td>
                                <td className="py-3 text-center text-slate-600">Trust Guarantee</td>
                                <td className="py-3 text-center text-amber-600 font-bold">High</td>
                                <td className="py-3 text-right font-mono font-bold text-slate-700">58.9%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {analyticsSubTab === 'conversion' && (
                    <ConversionOpportunitiesTab />
                  )}
                </motion.div>
              );
            }

             return (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 {/* Sandbox Banner */}
                 {!isInstalled && (
                   <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                     <div className="flex items-center gap-3">
                       <span className="text-xl">✨</span>
                       <div>
                         <p className="font-extrabold text-slate-900">Viewing Demo Sandbox Mode</p>
                         <p className="text-slate-600">Connect your live website tracking script to transition from simulated metrics to real visitor hesitation data.</p>
                       </div>
                     </div>
                     <button
                       id="btn_sandbox_banner_verify_dev"
                       onClick={handleTestInstallation}
                       disabled={testingInstallation}
                       className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold px-3 py-2 rounded-lg font-mono tracking-wide uppercase text-[10px] whitespace-nowrap cursor-pointer"
                     >
                       {testingInstallation ? 'Verifying...' : 'Verify Connection'}
                     </button>
                   </div>
                 )}

                 {isInstalled && (
                   <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     Live Tracking Active: Awaiting and analyzing real customer hesitations on {workspace.url || 'your website'}
                   </div>
                 )}
                 
                
                {/* Analytics Period Header Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <LineChart size={20} className="text-indigo-600 animate-pulse" />
                      Executive Daily Analytics & Reports
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">Explore behavior analytics, automatic insights, and full-funnel CRO reports.</p>
                  </div>

                  {/* Period selection picker */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono flex items-center gap-1">
                      <Calendar size={12} /> Date:
                    </span>
                    <select
                      id="select_analytics_period_dropdown"
                      value={selectedReportDate}
                      onChange={(e) => setSelectedReportDate(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/15 cursor-pointer"
                    >
                      <option value="today">Today's Real-Time Report (Live)</option>
                      <option value="yesterday">Yesterday's Executive Report</option>
                      <option value="july16">July 16, 2026 Executive Report</option>
                      <option value="july15">July 15, 2026 Executive Report</option>
                    </select>

                    <button 
                      id="btn_run_analytics_refresher"
                      onClick={() => {
                        triggerExitAnalysisLoad(true);
                        fetchWorkspaceAnalytics(true);
                        triggerRecommendationsLoad(true);
                      }}
                      disabled={analyzingExit || isLoadingReportData || loadingRecs}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      {analyzingExit || isLoadingReportData || loadingRecs ? <RefreshCw className="animate-spin" size={13} /> : <RefreshCw size={13} />} Refresh
                    </button>
                  </div>
                </div>

                {/* Grid of Key Performance Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Identified High-Bounce Pages</span>
                      <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{activeData.sessions}</h2>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-extrabold mt-4">↑ 14.2% vs prev week</span>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">AI Surveys Dispatched</span>
                      <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{activeData.triggers}</h2>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-extrabold mt-4">98.2% Trigger Success Rate</span>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Feedback Response Rate</span>
                      <h2 className="text-3xl font-extrabold text-indigo-600 mt-1 font-mono">{activeData.responseRate}</h2>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-extrabold mt-4">8.4x higher than industry flat forms</span>
                  </div>

                  <div className="bg-white border border-indigo-100 p-5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-50/20 to-white flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Recovered Checkout Value</span>
                        <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded uppercase font-mono">CRO Lift</span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{activeData.revenue}</h2>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-extrabold mt-4">Attributed Revenue Gain ✨</span>
                  </div>
                </div>

                {/* FEATURE 10: AUTOMATIC INSIGHTS OF THE DAY */}
                <div className="bg-gradient-to-r from-indigo-50/50 via-pink-50/20 to-white border border-indigo-100 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-indigo-600" size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">Feature 10: Automatic Insight of the Day</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                    {activeData.insight}
                  </p>
                </div>

                {/* Main analytical grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Top Exit Reasons & Complaints (Span 5) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Top exit reasons */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Behavior Exit Factors</span>
                      <div className="space-y-3.5">
                        {activeData.reasons.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-800">
                              <span>{item.reason}</span>
                              <span className="font-bold text-slate-500">{item.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* UX Sentiment Assessment */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">UX Customer Sentiment</span>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-xs font-extrabold text-slate-800 leading-tight truncate">{activeData.sentiment}</span>
                          <span className="text-lg font-bold text-indigo-600 font-mono flex-shrink-0">{activeData.sentimentScore}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${activeData.sentimentScore}%` }} />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: AI CRO Recommendations & Complaints (Span 7) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* CRO Recommendations */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Actionable AI CRO Solutions</span>
                        <span className="text-[9px] text-slate-400 font-mono">Gemini Recommended</span>
                      </div>

                      <div className="space-y-3">
                        {activeData.suggestions.map((sug, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-150 flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] flex-shrink-0">
                              {idx+1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-slate-900 text-xs leading-normal">{sug.issue}</p>
                              <p className="text-slate-500 text-xs mt-1 leading-normal">{sug.recommendation}</p>
                              <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold bg-indigo-100 text-indigo-800 uppercase">
                                {sug.impact}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Complaints List */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Complaints Traced & Resolved</span>
                      <ul className="space-y-2.5">
                        {activeData.complaints.map((comp, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                            <span className="text-indigo-500 font-bold mt-0.5">•</span>
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </div>

                {/* Google Ads vs Organic CRO Attribution Grid */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Traffic Source Conversion (CRO Attribution)</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-mono">
                          <th className="pb-2.5 font-bold">Traffic Channel</th>
                          <th className="pb-2.5 font-bold text-center">Exit Trigger Sensitivity</th>
                          <th className="pb-2.5 font-bold text-center">Form Response Completion</th>
                          <th className="pb-2.5 font-bold text-right">Recommended AI Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-50">
                          <td className="py-3 font-bold text-slate-900">Google Paid Ads (Adwords)</td>
                          <td className="py-3 text-center font-bold text-amber-600">High (28.4%)</td>
                          <td className="py-3 text-center text-slate-500 font-mono font-bold">48.2%</td>
                          <td className="py-3 text-right text-slate-800 font-medium">Auto-pop welcome discount code checkout</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-3 font-bold text-slate-900">Organic Search (Google/Bing)</td>
                          <td className="py-3 text-center font-bold text-slate-500">Medium (12.1%)</td>
                          <td className="py-3 text-center text-slate-500 font-mono font-bold">39.4%</td>
                          <td className="py-3 text-right text-slate-800 font-medium">Render detailed sour specification sheet tab</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold text-slate-900">Social Media (Instagram/Reddit)</td>
                          <td className="py-3 text-center font-bold text-slate-500">Low (15.8%)</td>
                          <td className="py-3 text-center text-slate-500 font-mono font-bold">41.8%</td>
                          <td className="py-3 text-right text-slate-800 font-medium">Embed newsletter community subscription trigger</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FEATURE 6: DAILY EXECUTIVE REPORT DISPATCHER */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <span className="text-[9px] bg-indigo-600 text-indigo-100 font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Feature 6: Daily Executive Dispatch
                    </span>
                    <h3 className="font-extrabold text-base tracking-tight text-white mt-1">
                      Email Daily CRO Executive Digest
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                      Dispatch formatted customer behavior insights, complaint logs, and conversion revenue reports directly to sangeeta.codes@gmail.com.
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {dispatchSuccess ? (
                      <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-mono text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                        <span>✔ Sent successfully! Check inbox 📬</span>
                      </div>
                    ) : (
                      <button
                        id="btn_dispatch_email_report"
                        disabled={isDispatchingReport}
                        onClick={triggerReportEmailDispatch}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2"
                      >
                        {isDispatchingReport ? (
                          <>
                            <RefreshCw className="animate-spin" size={13} /> Dispatching Report...
                          </>
                        ) : (
                          <>
                            <Mail size={13} /> Email Report to sangeeta.codes@gmail.com
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })()}

          {/* TAB: AI CONNECT & WEBSITE INTELLIGENCE */}
          {activeTab === 'ai-connect' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-indigo-600" /> AI Connected Website Intelligence
                  </h1>
                  <p className="text-slate-500 text-xs">
                    Connect any external website URL and let CustomerLens AI automatically analyze page-drop hotspots, friction vectors, and suggest custom customer feedback surveys.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                    LENS_CORE_AI ACTIVE v2.4
                  </span>
                </div>
              </div>

              {/* Informational Marketing Cards - Exact copywriting from user instruction */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-2xl p-5 space-y-3 shadow-sm">
                  <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                    1 (Best for SaaS)
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">AI That Learns Your Customers</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    CustomerLens AI continuously learns from how visitors interact with your website or app. It understands browsing patterns, hesitation, clicks, navigation, feature usage, purchases, and drop-offs. As it gathers more data, the AI becomes smarter at identifying customer intent and automatically asks the most relevant question at the perfect moment—without interrupting the user experience.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-100 rounded-2xl p-5 space-y-3 shadow-sm">
                  <span className="text-[9px] bg-sky-600 text-white font-extrabold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                    2 (Premium Marketing Copy)
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">An AI That Gets Smarter Over Time</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Unlike traditional survey tools, CustomerLens AI doesn't rely on fixed rules. It observes customer behavior, understands user journeys, recognizes patterns, and improves with every interaction. The more visitors your website receives, the better the AI becomes at knowing who to ask, when to ask, and what question will generate the most valuable insight.
                  </p>
                </div>

                <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-sm text-indigo-300">Behavioral Intelligence Capabilities</h3>
                    <span className="text-[8px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">LIVE</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span> Learns from real customer behavior
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span> Understands clicks, scrolls, pauses, and navigation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span> Detects buying intent and frustration signals
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span> Identifies the best moment to ask for feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span> Generates relevant, personalized survey questions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span> Continuously improves as more customer interactions are analyzed
                    </li>
                  </ul>
                </div>

              </div>

              {/* URL Connection Form & Results Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Input Panel */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-md font-bold text-slate-900 tracking-tight">Establish AI Workspace connection</h2>
                    <p className="text-slate-500 text-xs">Run a smart behavioral simulation review on any external domain name.</p>
                  </div>

                  <form onSubmit={handleAnalyzeConnect} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400 block mb-1">
                        Website Target URL
                      </label>
                      <input 
                        type="url"
                        value={connectUrl}
                        onChange={(e) => setConnectUrl(e.target.value)}
                        placeholder="https://my-awesome-startup.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400 block mb-1">
                        Business Framework & Category
                      </label>
                      <select 
                        value={connectCategory}
                        onChange={(e) => setConnectCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-semibold"
                      >
                        <option value="SaaS">SaaS / Web App</option>
                        <option value="E-commerce">E-commerce / Shopify / WooCommerce</option>
                        <option value="Blog">Blog / Content Publisher</option>
                        <option value="Agency">Agency / Consulting Website</option>
                        <option value="Portfolio">Creative Portfolio</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={connectIsAnalyzing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      {connectIsAnalyzing ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Deep Crawl Simulation running...
                        </>
                      ) : (
                        <>
                          🔌 Connect Website URL
                        </>
                      )}
                    </button>
                  </form>

                  {connectError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium">
                      {connectError}
                    </div>
                  )}

                  {/* Pro-Tip helper */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 leading-relaxed font-medium">
                    💡 <strong>Did you know?</strong> CustomerLens AI deciphers scrolling dynamics and cursor speed on the target site to calculate average checkout hesitation. Try it now to see what your customers are thinking!
                  </div>

                </div>

                {/* AI generated Outputs and mockups */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {connectIsAnalyzing && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center space-y-4">
                      <div className="w-12 h-1 bg-indigo-600 rounded-full mx-auto overflow-hidden relative">
                        <div className="absolute inset-0 bg-indigo-400 animate-pulse" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">
                        CustomerLens AI is parsing HTML structure, compiling drop-off hotspots, and drafting custom psychological intervention vectors...
                      </p>
                    </div>
                  )}

                  {!connectResult && !connectIsAnalyzing && (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
                      <span className="text-3xl">🔌</span>
                      <h4 className="text-sm font-bold text-slate-700">Waiting for AI workspace connection...</h4>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        Enter a website URL in the left-hand form to retrieve a comprehensive strategic review and auto-generated customer feedback questions.
                      </p>
                    </div>
                  )}

                  {connectResult && !connectIsAnalyzing && (
                    <div className="space-y-6">
                      
                      {/* Strategic analysis block */}
                      <div className="bg-indigo-900 text-white rounded-2xl p-6 space-y-3 shadow-md relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
                        <span className="text-[10px] font-mono bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded font-extrabold uppercase">
                          AI Strategic Recommendation
                        </span>
                        <h3 className="font-extrabold text-md tracking-tight leading-snug">
                          Suggested Strategy for {connectUrl}
                        </h3>
                        <p className="text-indigo-100 text-xs leading-relaxed italic">
                          "{connectResult.overallStrategy}"
                        </p>
                      </div>

                      {/* Predicted Behavioral Signatures */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900">
                          AI-Predicted Visitor Behavioral Signatures
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {connectResult.behavioralInsights?.map((insight: any, i: number) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1.5">
                              <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold font-mono px-1.5 py-0.5 rounded uppercase block w-fit">
                                Pattern {i + 1}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900">{insight.title}</h4>
                              <p className="text-[10px] text-slate-500 leading-normal font-semibold">{insight.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Questions Draft list with Sync capability */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">
                              Generated Customer Feedback Survey Questions
                            </h3>
                            <p className="text-slate-500 text-[11px] font-medium">
                              Ready-to-deploy questions designed for behavioral optimization.
                            </p>
                          </div>
                          
                          {syncSuccess ? (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                              ✔ Synchronized!
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSyncToBuilder}
                              disabled={isSyncingToBuilder}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                            >
                              {isSyncingToBuilder ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" /> Syncing...
                                </>
                              ) : (
                                <>
                                  📥 Apply to My Survey Builder
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {connectResult.suggestedQuestions?.map((q: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>Question {idx + 1} • {q.type === 'multiple-choice' ? 'Multiple Choice' : 'Open Answer Text'}</span>
                                {idx === 0 && <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-extrabold">REQUIRED</span>}
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-900">{q.questionText}</h4>
                              
                              {q.options?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                                  {q.options.map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className="bg-white border border-slate-200 rounded-lg p-2 text-[10px] text-slate-600 font-semibold">
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {syncSuccess && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="text-xs text-emerald-800">
                              🎉 <strong>Survey Synchronized!</strong> The survey was successfully compiled and set active in your Survey Builder list. Try simulating it now!
                            </div>
                            <button 
                              type="button"
                              onClick={() => { setActiveTab('simulator'); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition-all flex-shrink-0"
                            >
                              Open Simulator ➔
                            </button>
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>

              </div>

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
                
                {/* Monthly Billing Indicator */}
                <div className="flex justify-center items-center gap-2 mb-8 bg-indigo-50/50 border border-indigo-100/40 w-fit mx-auto px-4 py-2 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">Standard Monthly Billing</span>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">| Cancel Anytime</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Trial Tier */}
                  <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Sandbox</span>
                      <h3 className="font-bold text-slate-900 text-lg mt-1">14-Day Free Trial</h3>
                      <p className="text-xs text-slate-500 mt-1">Perfect for prototyping customer survey widget functionality.</p>
                      
                      <div className="my-5 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900">$0</span>
                        <span className="text-slate-400 text-xs">/ forever</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                        <li className="flex items-center gap-2">✔ Standard JavaScript Embed</li>
                        <li className="flex items-center gap-2">✔ Targeted Feedback Triggering</li>
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
                  <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setBillingModalOpen(false);
                    }}
                  >
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-2xl text-slate-900 relative my-auto"
                    >
                      {/* Prominent Close Button */}
                      <button 
                        type="button"
                        onClick={() => setBillingModalOpen(false)}
                        className="absolute right-4 top-4 z-20 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Close Checkout"
                        aria-label="Close Checkout"
                      >
                        <X size={20} />
                      </button>

                      <h3 className="font-bold text-slate-900 text-lg mb-1 pr-8">Confirm Subscription</h3>
                      <p className="text-xs text-slate-500 mb-4">Set up your secure CustomerLens payment routing ledger.</p>
                      
                      {/* Plan and Price Breakdown */}
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 mb-6 text-left">
                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">SELECTED PLAN</span>
                            <h4 className="font-extrabold text-slate-900 text-sm">{selectedPlanForUpgrade} Plan</h4>
                          </div>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-1 rounded-xl">Billed Monthly</span>
                        </div>
                        
                        <div className="pt-2.5 space-y-1.5 text-xs text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Base Rate:</span>
                            <span className="font-semibold text-slate-800">${selectedPlanForUpgrade === 'Business' ? '99' : '49'}.00 / mo</span>
                          </div>
                          {appliedDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>Promo Discount ({appliedDiscount}% off):</span>
                              <span className="font-bold">-${Math.round((selectedPlanForUpgrade === 'Business' ? 99 : 49) * (appliedDiscount / 100))}.00 / mo</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-slate-200/50 text-slate-900 font-extrabold text-sm">
                            <span>Total Charge:</span>
                            <span className="text-indigo-600">${(selectedPlanForUpgrade === 'Business' ? 99 : 49) - Math.round((selectedPlanForUpgrade === 'Business' ? 99 : 49) * (appliedDiscount / 100))}.00 / mo</span>
                          </div>
                        </div>
                      </div>

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
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                              >
                                Pay & Activate Plan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Real PayPal Gateway Flow */}
                            <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl text-left">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="font-black italic text-sm text-[#003087]">
                                  Pay<span className="text-[#0079C1]">Pal</span>
                                </span>
                                <span className="text-[9px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 rounded font-extrabold uppercase">
                                  Orders v2 API
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-normal">
                                Connect securely to the official PayPal checkout gateway. Your subscription is verified and activated only after PayPal captures the approved transaction.
                              </p>
                            </div>

                            {dashboardPaypalStep === 'input' && (
                              <div className="space-y-3">
                                <button 
                                  type="submit"
                                  disabled={isProcessingUpgrade}
                                  className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm font-sans"
                                >
                                  <span className="italic font-black text-sm">Pay<span className="text-[#0079C1]">Pal</span></span>
                                  <span>Continue to PayPal Checkout</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBillingModalOpen(false)}
                                  className="w-full text-slate-500 hover:text-slate-700 text-xs py-1.5 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {dashboardPaypalStep === 'creating' && (
                              <div className="py-4 text-center space-y-2">
                                <div className="h-8 w-8 border-2 border-[#0070ba] border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-slate-600 font-medium">Creating PayPal Order...</p>
                              </div>
                            )}

                            {dashboardPaypalStep === 'awaiting_approval' && (
                              <div className="space-y-3 text-left">
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                                  <p className="font-bold">PayPal Window Opened</p>
                                  <p className="text-[11px] mt-0.5">Please approve payment in the PayPal window, then click Verify below.</p>
                                  <p className="text-[10px] font-mono text-slate-600 mt-1">Order ID: {dashboardPaypalOrderId}</p>
                                </div>
                                <button
                                  type="button"
                                  disabled={isProcessingUpgrade}
                                  onClick={handleCaptureDashboardPayPal}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle2 size={16} />
                                  <span>I've Approved Payment / Capture Now</span>
                                </button>
                                {dashboardPaypalApproveUrl && (
                                  <a
                                    href={dashboardPaypalApproveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl text-center block border"
                                  >
                                    Reopen PayPal Window
                                  </a>
                                )}
                              </div>
                            )}

                            {dashboardPaypalStep === 'capturing' && (
                              <div className="py-4 text-center space-y-2">
                                <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-slate-600 font-medium">Verifying and Capturing PayPal Payment...</p>
                              </div>
                            )}

                            {dashboardPaypalStep === 'error' && (
                              <div className="space-y-3 text-left">
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                                  <p className="font-bold">Payment Error</p>
                                  <p className="text-[11px] mt-0.5">{dashboardPaypalError || 'PayPal capture failed or window closed.'}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDashboardPaypalStep('input')}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                                >
                                  Try Again
                                </button>
                              </div>
                            )}
                          </div>
                        )}

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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Website Ownership, Domains & Export</h1>
                <p className="text-slate-500 text-xs">Verify your website ownership with DNS TXT records, configure custom CNAME domain routing, and export source code bundles.</p>
              </div>

              {/* Website Ownership Verification (DNS TXT) */}
              <WebsiteVerification 
                initialDomain={domainInput || (websites[0]?.domain ? websites[0].domain.replace(/^https?:\/\//, '') : '')}
                onVerificationSuccess={(verifiedDomain) => {
                  setDnsVerified(true);
                  showNotification(`Website ${verifiedDomain} verified successfully!`, 'success');
                }}
                showNotification={showNotification}
              />

              {/* AI Studio Export Instructions & Quick Code Exporter */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl border border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
                    <Code size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      📦 How to Export Code in Google AI Studio
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      If you clicked the <strong>Gear icon ⚙️</strong> in the Google AI Studio platform header, that menu opens <strong>Project Settings</strong> (API Keys, Permissions, and Environment Variables).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono tracking-wider block">Option A: Top Menu Export / Share</span>
                    <p className="text-xs text-slate-300 font-medium">
                      Look at the top right header bar of Google AI Studio (above this preview). Click the <strong>Share</strong> button or project dropdown to select <strong>Export to GitHub</strong> or <strong>Download ZIP</strong>.
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono tracking-wider block">Option B: Direct Code Exporter Below</span>
                    <p className="text-xs text-slate-300 font-medium">
                      Use the interactive <strong>Code Exporter</strong> below to download a complete <strong>.ZIP Archive</strong> of all source files or download individual code files directly!
                    </p>
                  </div>
                </div>
              </div>

              {/* Code & ZIP Exporter Component */}
              <CodeExporter />

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
                    {/* Logo block */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500">Company Logo</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        {/* Option 1: Upload */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Option A: Upload Image</span>
                          {wlLogo && wlLogo.startsWith('data:image/') ? (
                            <div className="relative inline-block">
                              <div className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                                <img src={wlLogo} alt="Corporate logo" className="max-h-full max-w-full object-contain" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setWlLogo('')}
                                className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-slate-950 hover:bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer shadow-sm transition-colors"
                                title="Remove Logo"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/10 rounded-xl p-3 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
                              <Upload size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors mb-1" />
                              <span className="text-[10px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Choose Image File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleWlLogoUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Option 2: Image URL */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Option B: Logo Image URL</span>
                          <input 
                            id="input_white_label_logo"
                            type="url" 
                            placeholder="https://yourdomain.com/logo.png" 
                            value={wlLogo && !wlLogo.startsWith('data:image/') ? wlLogo : ''}
                            onChange={(e) => setWlLogo(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-indigo-500"
                          />
                          {wlLogo && !wlLogo.startsWith('data:image/') && (
                            <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                              <img src={wlLogo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Brand Color Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500">Brand Theme Color Primary</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={wlColor} 
                          onChange={(e) => setWlColor(e.target.value)}
                          className="h-9 w-12 rounded-xl border border-slate-200 cursor-pointer bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={wlColor} 
                          onChange={(e) => setWlColor(e.target.value)}
                          className="flex-grow px-3 py-1.5 border rounded-xl text-xs font-mono font-bold focus:border-indigo-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleOpenWlColorDropper}
                          className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-700 text-xs font-bold"
                          title="Use screen color dropper"
                        >
                          <Pipette size={14} className="text-indigo-600 shrink-0" />
                          <span>Dropper</span>
                        </button>
                      </div>

                      {/* Color presets swatches */}
                      <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Corporate Presets:</span>
                        {[
                          { name: 'Indigo', hex: '#6366f1' },
                          { name: 'Emerald', hex: '#10B981' },
                          { name: 'Sky', hex: '#0EA5E9' },
                          { name: 'Rose', hex: '#F43F5E' },
                          { name: 'Amber', hex: '#F59E0B' },
                          { name: 'Charcoal', hex: '#1E293B' }
                        ].map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setWlColor(swatch.hex)}
                            className="h-5 w-5 rounded-full border border-slate-200 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                            style={{ backgroundColor: swatch.hex }}
                            title={swatch.name}
                          >
                            {wlColor.toLowerCase() === swatch.hex.toLowerCase() && (
                              <Check size={10} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                            )}
                          </button>
                        ))}
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

        {/* Domain Verification Modal */}
        <AnimatePresence>
          {verificationModalSite && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono mb-1">
                      <ShieldCheck size={12} /> Domain Security Check
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Verify Ownership for {verificationModalSite.url}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      CustomerLens AI requires domain ownership verification before activating tracking and survey triggers.
                    </p>
                  </div>
                  <button
                    onClick={() => setVerificationModalSite(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Verification Method Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setVerificationSelectedMethod('snippet')}
                    className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                      verificationSelectedMethod === 'snippet'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    JS Snippet ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationSelectedMethod('meta')}
                    className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                      verificationSelectedMethod === 'meta'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    HTML Meta Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationSelectedMethod('dns')}
                    className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                      verificationSelectedMethod === 'dns'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    DNS TXT Record
                  </button>
                </div>

                {/* Method Instructions */}
                {verificationSelectedMethod === 'snippet' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Paste this snippet into the <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded">&lt;head&gt;</code> section of your website code:
                    </p>
                    <div className="bg-slate-950 text-indigo-300 p-3 rounded-xl text-[11px] font-mono break-all relative group border border-slate-800">
                      <code>{`<script async src="${window.location.origin}/tracker.js" data-site-id="${verificationModalSite.siteId || verificationModalSite.id}"></script>`}</code>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      This automatically verifies ownership AND installs the live AI event tracking engine.
                    </p>
                  </div>
                )}

                {verificationSelectedMethod === 'meta' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Add this meta tag to your homepage's <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded">&lt;head&gt;</code> tag:
                    </p>
                    <div className="bg-slate-950 text-indigo-300 p-3 rounded-xl text-[11px] font-mono break-all relative group border border-slate-800">
                      <code>{`<meta name="customerlens-site-verification" content="${verificationModalSite.verificationToken || 'cl_verify_' + verificationModalSite.id}" />`}</code>
                    </div>
                  </div>
                )}

                {verificationSelectedMethod === 'dns' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Add a TXT record to your DNS configuration via your domain registrar (Cloudflare, GoDaddy, Namecheap):
                    </p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Record Type:</span>
                        <span className="font-bold text-slate-800">TXT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Host / Name:</span>
                        <span className="font-bold text-slate-800">@ (or root)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">TXT Value:</span>
                        <span className="font-bold text-indigo-600 break-all">{`customerlens-site-verification=${verificationModalSite.verificationToken || 'cl_verify_' + verificationModalSite.id}`}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message if Verification Failed */}
                {verificationErrorMsg && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 font-medium">
                    ⚠️ {verificationErrorMsg}
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setVerificationModalSite(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={verifyingDomainId === verificationModalSite.id}
                    onClick={() => handleVerifyDomain(verificationModalSite, verificationSelectedMethod)}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {verifyingDomainId === verificationModalSite.id ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} /> Checking Domain...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Check Verification Now
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
