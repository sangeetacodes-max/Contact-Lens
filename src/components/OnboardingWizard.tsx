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
  HelpCircle 
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

export default function OnboardingWizard({ onComplete, userEmail, onBack }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [businessType, setBusinessType] = useState<BusinessType>('Shopify');
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [goal, setGoal] = useState('Increase Sales');
  
  // AI Generation state
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [generatedSurvey, setGeneratedSurvey] = useState<any | null>(null);

  const handleStep1 = () => {
    if (step === 1) setStep(2);
  };

  const handleStep2 = async () => {
    if (!businessName) {
      alert('Please enter a business name');
      return;
    }
    setStep(3);
    await triggerAIGeneration();
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
    if (!generatedSurvey) return;

    const workspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: businessName,
      businessType,
      url: websiteUrl,
      goal,
      customDomainStatus: 'Pending',
      whiteLabel: {
        removeBranding: false,
      },
    };

    const initialSurvey: Survey = {
      id: `survey-${Date.now()}`,
      title: 'First Onboarding Survey',
      displayOption: generatedSurvey.recommendedPlacement || 'Exit Intent Popup',
      headline: generatedSurvey.headline,
      questions: generatedSurvey.questions,
      colors: generatedSurvey.colors,
      brandingEnabled: true,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onComplete(workspace, initialSurvey);
  };

  return (
    <div id="onboarding_container" className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
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
      <div className="max-w-4xl mx-auto w-full flex-grow flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-8 sm:p-10 w-full relative overflow-hidden">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
              <span className="text-xs font-semibold text-slate-700">Business Model</span>
            </div>
            <div className="h-px bg-slate-200 flex-grow" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
              <span className="text-xs font-semibold text-slate-700">Goal & Identity</span>
            </div>
            <div className="h-px bg-slate-200 flex-grow" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
              <span className="text-xs font-semibold text-slate-700">AI Blueprint</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Business Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Let's personalize your CustomerLens experience
                  </h1>
                  <p className="text-slate-500 text-sm mb-8">
                    Every industry requires unique survey timings, tones, and triggers. Select your primary platform to start your <strong className="text-indigo-600 font-semibold">14-Day Free Trial</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar mb-8">
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

            {/* STEP 2: Website & Goals */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-2xl mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Tell us about your website
                  </h1>
                  <p className="text-slate-500 text-sm">
                    We will automatically prepare custom tracking codes and widgets optimized for your business goal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Fields */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                        <input
                          id="input_business_name"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Acme Retail"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                        <input
                          id="input_website_url"
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goals Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Primary Conversion Goal</label>
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {GOALS.map((g) => (
                        <button
                          key={g.id}
                          id={`btn_goal_${g.id.replace(/\s+/g, '_')}`}
                          onClick={() => setGoal(g.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3 hover:bg-slate-50 ${
                            goal === g.id 
                              ? 'border-indigo-600 bg-indigo-50/30' 
                              : 'border-slate-100 bg-white'
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${goal === g.id ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}>
                            {goal === g.id && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{g.text}</p>
                            <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{g.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
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
                    Generate with AI <Sparkles size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Generated AI Survey Preview & Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[350px] flex flex-col justify-center"
              >
                {loading ? (
                  <div className="text-center py-12 space-y-4">
                    <Loader2 size={44} className="animate-spin text-indigo-600 mx-auto" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 tracking-tight">Generating CustomerLens Blueprint</h3>
                      <p className="text-slate-400 text-xs font-mono mt-1 animate-pulse">{loadingPhrase}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="max-w-2xl mb-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
                        <Sparkles size={12} /> Generated by CustomerLens AI
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Your custom exit-intent survey is ready!
                      </h1>
                      <p className="text-slate-500 text-sm">
                        Based on your goal to <strong className="text-indigo-600">{goal}</strong>, the AI generated a customized layout. Review or tweak it before launching.
                      </p>
                    </div>

                    {generatedSurvey && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Survey specs summary */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Recommended Display Placement</span>
                            <div className="flex items-center gap-2 text-slate-800">
                              <Layers size={16} className="text-indigo-500" />
                              <span className="text-sm font-semibold">{generatedSurvey.recommendedPlacement}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Interactive Theme Accent</span>
                            <div className="flex items-center gap-2.5">
                              <Palette size={16} className="text-indigo-500" />
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: generatedSurvey.colors.accent }} />
                                <span className="font-mono text-xs font-semibold uppercase">{generatedSurvey.colors.accent}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">AI Suggested Questions</span>
                            <div className="space-y-2">
                              {generatedSurvey.questions.map((q: any, i: number) => (
                                <div key={q.id} className="text-xs bg-white border border-slate-100 p-2.5 rounded-lg flex items-start gap-2">
                                  <span className="font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded text-[10px]">{i+1}</span>
                                  <div>
                                    <p className="font-medium text-slate-800">{q.questionText}</p>
                                    <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wide font-mono">{q.type}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Visual Mock-up */}
                        <div className="border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-inner relative overflow-hidden" style={{ backgroundColor: generatedSurvey.colors.background, color: generatedSurvey.colors.text }}>
                          <div className="absolute right-3 top-3 text-[10px] font-bold font-mono tracking-wider opacity-30 uppercase">Interactive Widget Blueprint</div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Before you go...</p>
                            <h3 className="text-lg font-bold tracking-tight mt-1 mb-4 leading-snug">{generatedSurvey.headline}</h3>
                            
                            {/* Dummy Options for First Question */}
                            <div className="space-y-1.5">
                              {generatedSurvey.questions[0]?.options?.slice(0, 4).map((opt: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:opacity-85" style={{ borderColor: generatedSurvey.colors.accent + '20', backgroundColor: generatedSurvey.colors.background }}>
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

                          <div className="mt-6 flex justify-end gap-2 text-xs">
                            <button className="px-3 py-1.5 font-semibold opacity-60 rounded-lg">Skip</button>
                            <button className="px-3 py-1.5 text-white font-semibold rounded-lg shadow-sm" style={{ backgroundColor: generatedSurvey.colors.accent }}>Submit</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        id="btn_onboarding_back_3"
                        onClick={() => setStep(2)}
                        className="text-slate-600 hover:text-slate-800 text-sm font-semibold px-4 py-2"
                      >
                        Back
                      </button>
                      <button
                        id="btn_onboarding_launch"
                        onClick={handleLaunch}
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        Launch CustomerLens Dashboard <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 font-mono mt-8">
        CustomerLens Onboarding System • No Manual Support Approval Required • 🟢 Self-Service Activated
      </div>
    </div>
  );
}
