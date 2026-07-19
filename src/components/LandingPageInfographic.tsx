import React from 'react';
import { 
  Sparkles, 
  Clock, 
  Eye, 
  ShoppingCart, 
  FileText, 
  Play, 
  ThumbsDown, 
  Smile, 
  Frown, 
  TrendingUp, 
  Bot, 
  Search, 
  Star, 
  ChevronRight,
  ArrowRight,
  X,
  Plus
} from 'lucide-react';

export default function LandingPageInfographic() {
  return (
    <div className="bg-white text-slate-800 rounded-3xl p-4 sm:p-8 md:p-12 border border-slate-200 shadow-2xl space-y-16 max-w-5xl mx-auto text-left relative overflow-hidden font-sans">
      
      {/* Decorative Top Accent */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500" />

      {/* Main Comparative Header */}
      <div className="text-center space-y-6 pt-4">
        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          The biggest difference is <span className="text-indigo-600 font-black">when and how intelligently</span> the survey is shown.
        </h3>
        
        {/* VS Visual Split */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center pt-8 max-w-4xl mx-auto">
          
          {/* Normal Surveys (Left) */}
          <div className="md:col-span-3 bg-red-50/50 rounded-2xl p-6 border border-red-100 flex flex-col items-center text-center space-y-4">
            {/* SVG Frustrated Man */}
            <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-sm border border-red-100">
              <svg viewBox="0 0 120 120" className="w-28 h-28">
                {/* Background aura */}
                <circle cx="60" cy="60" r="45" fill="#fef2f2" />
                
                {/* Cloud of thoughts */}
                <path d="M50,20 Q48,15 55,14 Q60,10 68,13 Q73,12 72,18" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                
                {/* Distressed Head / Body */}
                <path d="M35,95 C35,80 45,75 60,75 C75,75 85,80 85,95" fill="#f87171" opacity="0.8" />
                <circle cx="60" cy="52" r="18" fill="#fca5a5" />
                
                {/* Frustrated Hair */}
                <path d="M42,42 C44,32 55,30 60,34 C65,30 76,32 78,42 C82,45 74,48 74,48" fill="#475569" />
                
                {/* Distress Face Features */}
                {/* Eyes looking down stressed */}
                <path d="M50,48 Q54,52 52,54" stroke="#1e293b" strokeWidth="2" fill="none" />
                <path d="M70,48 Q66,52 68,54" stroke="#1e293b" strokeWidth="2" fill="none" />
                
                {/* Stressed mouth */}
                <path d="M54,62 Q60,58 66,62" stroke="#1e293b" strokeWidth="2" fill="none" />
                
                {/* Sweat/stress drop */}
                <path d="M76,50 Q78,54 77,58 C75,56 74,52 76,50" fill="#3b82f6" />
                
                {/* Red laptop in front */}
                <rect x="42" y="76" width="36" height="20" rx="3" fill="#dc2626" />
                <polygon points="36,96 84,96 80,102 40,102" fill="#991b1b" />
                {/* Angry X on screen */}
                <path d="M56,82 L64,90 M64,82 L56,90" stroke="#fecaca" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="absolute top-2 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                Too Late!
              </div>
            </div>

            <span className="inline-block bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-xl tracking-wider uppercase shadow-md shadow-red-200">
              ✕ Normal Surveys
            </span>
            <p className="text-xs text-red-500 font-bold tracking-tight">
              Annoying. Random. Irrelevant.
            </p>
          </div>

          {/* VS Divider (Middle) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-black text-slate-500 shadow-md">
              VS
            </div>
            <div className="hidden md:block w-0.5 h-16 bg-gradient-to-b from-transparent via-slate-200 to-transparent mt-2" />
          </div>

          {/* CustomerLens (Right) */}
          <div className="md:col-span-3 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex flex-col items-center text-center space-y-4 shadow-xl shadow-indigo-50/20">
            {/* SVG Smiling Man */}
            <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-md border border-indigo-100">
              <svg viewBox="0 0 120 120" className="w-28 h-28">
                {/* Background aura */}
                <circle cx="60" cy="60" r="45" fill="#e0e7ff" />
                
                {/* Happy stars */}
                <path d="M22,34 L24,38 L28,34 L24,30 Z" fill="#fbbf24" />
                <path d="M96,38 L98,42 L102,38 L98,34 Z" fill="#fbbf24" />
                
                {/* Confident Head / Body */}
                <path d="M35,95 C35,80 45,75 60,75 C75,75 85,80 85,95" fill="#4f46e5" />
                <circle cx="60" cy="52" r="18" fill="#fecaca" />
                
                {/* Trendy Hair */}
                <path d="M42,42 C40,30 55,26 62,28 C68,26 78,30 78,42" fill="#1e293b" />
                
                {/* Happy Face Features */}
                <circle cx="52" cy="48" r="2.5" fill="#1e293b" />
                <circle cx="68" cy="48" r="2.5" fill="#1e293b" />
                <path d="M52,58 Q60,66 68,58" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                
                {/* Thumbs Up Hand */}
                <path d="M85,68 C83,68 81,70 81,72 C81,74 83,76 85,76 L88,76 Q92,76 92,72 Q92,68 88,68 Z" fill="#fecaca" />
                <rect x="83" y="71" width="4" height="10" rx="1" fill="#fecaca" transform="rotate(-15 83 71)" />
                
                {/* Purple laptop in front */}
                <rect x="42" y="76" width="36" height="20" rx="3" fill="#6366f1" />
                <polygon points="36,96 84,96 80,102 40,102" fill="#4338ca" />
                {/* Sparkle on screen */}
                <polygon points="60,80 62,84 66,84 63,86 64,90 60,88 56,90 57,86 54,84 58,84" fill="#fef08a" />
              </svg>
              <div className="absolute top-2 right-4 bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                Perfect timing!
              </div>
            </div>

            <span className="inline-block bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-xl tracking-wider uppercase shadow-md shadow-indigo-200 flex items-center gap-1.5">
              <Sparkles size={12} className="text-yellow-300 animate-spin" /> CustomerLens
            </span>
            <p className="text-xs text-indigo-600 font-bold tracking-tight">
              Smart. Timely. Relevant.
            </p>
          </div>

        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Normal Surveys Detail Section */}
      <div className="space-y-8 bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100">
        <div className="flex items-center gap-2 text-red-500">
          <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold">✕</span>
          <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Normal Surveys are usually just:
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Bullet Points */}
          <div className="space-y-4">
            {[
              "A popup after X seconds.",
              "A feedback button.",
              "A survey after checkout.",
              "An exit-intent popup."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-500 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
                  ✕
                </span>
                <span className="text-sm text-slate-600 font-semibold">{text}</span>
              </div>
            ))}
          </div>

          {/* Browser / Person Mockup */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md">
            {/* Minimal Website Mockup */}
            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 relative space-y-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200/60 shadow-sm text-center space-y-2 relative">
                <span className="absolute top-1 right-1 text-[8px] text-slate-400">✕</span>
                <div className="text-[10px] font-bold text-slate-700">How was your experience?</div>
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={10} fill="#cbcbcb" stroke="#bcbcbc" />
                  ))}
                </div>
              </div>
            </div>

            {/* Pointing Angry Person */}
            <div className="text-center shrink-0 space-y-1.5">
              <div className="w-16 h-16 bg-red-100 rounded-full border border-red-200 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 60 60" className="w-12 h-12">
                  <circle cx="30" cy="30" r="25" fill="#fee2e2" />
                  <circle cx="30" cy="24" r="10" fill="#fca5a5" />
                  {/* Angled eyebrows */}
                  <path d="M24,20 L28,22" stroke="#1e293b" strokeWidth="1.5" />
                  <path d="M36,20 L32,22" stroke="#1e293b" strokeWidth="1.5" />
                  {/* Eyes */}
                  <circle cx="26" cy="24" r="1.5" fill="#1e293b" />
                  <circle cx="34" cy="24" r="1.5" fill="#1e293b" />
                  {/* Angry curved mouth */}
                  <path d="M26,30 Q30,27 34,30" stroke="#1e293b" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div className="text-[9px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Angry User
              </div>
              <p className="text-[10px] text-slate-500 leading-tight font-bold max-w-[80px]">
                "Too late.<br />Too generic.<br />Not helpful."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <h4 className="text-2xl font-black text-indigo-950 flex items-center justify-center gap-2">
          <Sparkles className="text-indigo-500 animate-pulse" /> CustomerLens does it smarter.
        </h4>
        <p className="text-slate-500 text-sm font-semibold">
          10 reasons why behavior-based prompts yield 50%+ response rates.
        </p>
      </div>

      {/* Grid of 10 Smart Capabilities */}
      <div className="space-y-10">

        {/* 1. AI Triggered Surveys */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                1
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
                AI Triggered Surveys <span className="flex text-amber-400">⭐⭐⭐⭐⭐</span>
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              Instead of <strong className="text-slate-700">fixed timing</strong>, AI detects real signals and asks at the perfect moment.
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-600 font-bold">
              <span className="flex items-center gap-1 text-indigo-600">✓ Hesitancy triggers</span>
              <span className="flex items-center gap-1 text-indigo-600">✓ Adds to cart left</span>
              <span className="flex items-center gap-1 text-indigo-600">✓ Pricing page X3</span>
              <span className="flex items-center gap-1 text-indigo-600">✓ Intent to cancel</span>
              <span className="flex items-center gap-1 text-indigo-600">✓ Refund scrolls</span>
              <span className="flex items-center gap-1 text-indigo-600">✓ High idle times</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pb-1.5 border-b border-slate-100">
                <span>Active Signal Monitors</span>
                <span className="text-indigo-500 animate-pulse">● Scanning</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                <div className="bg-amber-50 text-amber-700 border border-amber-100 p-2 rounded-xl flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Pricing 45s</span>
                </div>
                <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 p-2 rounded-xl flex items-center gap-1.5">
                  <Eye size={12} />
                  <span>Visited pricing 3x</span>
                </div>
                <div className="bg-red-50 text-red-700 border border-red-100 p-2 rounded-xl flex items-center gap-1.5">
                  <ShoppingCart size={12} />
                  <span>Cart left alone</span>
                </div>
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-2 rounded-xl flex items-center gap-1.5">
                  <FileText size={12} />
                  <span>Refund policy scrolled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-indigo-600 text-white rounded-2xl p-5 space-y-4 shadow-lg shadow-indigo-600/10 relative">
            <span className="absolute top-2 right-2 text-indigo-300">✕</span>
            <div className="text-xs font-black uppercase tracking-wider text-indigo-200">Interactive Prompt</div>
            <p className="text-xs font-bold leading-relaxed">
              We noticed you were checking our pricing. Is there anything holding you back from choosing a plan today?
            </p>
            <div className="space-y-1.5">
              <button className="w-full bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-[11px] py-2 rounded-xl shadow transition-all">
                Yes, ask me
              </button>
              <button className="w-full bg-indigo-700/50 hover:bg-indigo-700/80 text-indigo-100 font-bold text-[10px] py-1.5 rounded-lg transition-all">
                No, I'm good
              </button>
            </div>
          </div>
        </div>

        {/* 2. Different Questions for Different Users */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                2
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Different Questions for Different Users
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              AI shows entirely different questionnaires based on exact visitor status.
            </p>
          </div>

          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-3 text-[10px] font-bold text-slate-600">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span>Segments Routing</span>
                <span className="text-indigo-500 font-extrabold">Active</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[8px] font-bold">1</span>
                  <span>New: <span className="text-slate-400">"What are you looking for?"</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[8px] font-bold">2</span>
                  <span>Return: <span className="text-slate-400">"What stops your purchase?"</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[8px] font-bold">3</span>
                  <span>Paid: <span className="text-slate-400">"What is your favorite feature?"</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Returning Visitor Prompt</div>
            <p className="text-xs font-extrabold text-slate-900">
              What's stopping you from purchasing today?
            </p>
            <div className="space-y-1.5">
              {['Too expensive', 'Missing features', 'Still comparing alternatives', 'Other'].map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-2 rounded-xl text-xs font-semibold hover:border-indigo-400 transition-colors cursor-pointer">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[8px]" />
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. AI Writes the Question */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                3
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                AI Writes the Question
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              Instead of always asking the exact same static question, AI writes fresh ones based on behavior and active context.
            </p>
            <span className="inline-block text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Better questions. Better answers.
            </span>
          </div>

          {/* Plan Comparison Mock */}
          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">Visitor compared pricing cards:</div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 border border-slate-150 rounded-xl bg-slate-50">
                <div className="text-[8px] font-bold text-slate-400">Basic</div>
                <div className="text-xs font-extrabold text-slate-800">$19</div>
              </div>
              <div className="p-2 border-2 border-indigo-500 rounded-xl bg-indigo-50/20">
                <div className="text-[8px] font-extrabold text-indigo-600">Pro</div>
                <div className="text-xs font-black text-indigo-900">$49</div>
              </div>
              <div className="p-2 border border-slate-150 rounded-xl bg-slate-50">
                <div className="text-[8px] font-bold text-slate-400">Business</div>
                <div className="text-xs font-extrabold text-slate-800">$99</div>
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contextual AI Generated Question</div>
            <p className="text-xs font-extrabold text-slate-900">
              You compared our three plans. Which specific information was missing before choosing?
            </p>
            <div className="space-y-2">
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 h-14 resize-none" 
                placeholder="Type your answer..."
                disabled
              />
              <button className="w-full bg-indigo-600 text-white font-extrabold text-xs py-2 rounded-xl">
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* 4. Behavioral Surveys */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                4
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Behavioral Surveys
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              Instead of simple page-based triggers, AI looks closely at exactly what actions visitors perform.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-800">
              Example: Searched "refund" ➔ Visited pricing twice ➔ Left website.
            </div>
          </div>

          {/* Workflow Graphic */}
          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-150 text-center w-24">
                <Search size={14} className="text-slate-500 mb-1" />
                <span>Searched "refund"</span>
              </div>
              <ArrowRight size={12} className="text-slate-300" />
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-150 text-center w-24">
                <Eye size={14} className="text-slate-500 mb-1" />
                <span>Visited pricing 2x</span>
              </div>
              <ArrowRight size={12} className="text-slate-300" />
              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-150 text-center w-24">
                <X size={14} className="text-red-500 mb-1" />
                <span>Left website</span>
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dynamic Emotional Survey</div>
            <p className="text-xs font-extrabold text-slate-900">
              Was our pricing or refund policy unclear?
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold">
              <div className="bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 p-2 rounded-xl cursor-pointer">
                <span className="text-base block mb-0.5">😫</span>
                <span className="text-red-600 font-bold">Yes, unclear</span>
              </div>
              <div className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-2 rounded-xl cursor-pointer">
                <span className="text-base block mb-0.5">🙂</span>
                <span className="text-slate-500 font-bold">No, clear</span>
              </div>
              <div className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-2 rounded-xl cursor-pointer">
                <span className="text-base block mb-0.5">😆</span>
                <span className="text-slate-500 font-bold">No, clear</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Emotional Detection (Behavior-based) */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                5
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Emotional Detection (Behavior-based)
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              AI detects frustration through cursor behavior and patterns, without ever needing a camera.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 font-bold">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Rage clicking buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Clicking disabled buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Scrolling up & down repeatedly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Form abandonment & long pauses</span>
              </div>
            </div>
          </div>

          {/* SVG Angry User with Laptop */}
          <div className="lg:col-span-4 flex items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative">
            <svg viewBox="0 0 120 120" className="w-24 h-24">
              {/* Lightning bolts of anger */}
              <path d="M25,25 L30,35 L24,38" stroke="#ef4444" strokeWidth="2" fill="none" />
              <path d="M95,25 L90,35 L96,38" stroke="#ef4444" strokeWidth="2" fill="none" />
              
              {/* Angry User Body */}
              <circle cx="60" cy="50" r="16" fill="#fca5a5" />
              <path d="M35,95 C35,82 45,78 60,78 C75,78 85,82 85,95" fill="#e2e8f0" />
              
              {/* Angry Face */}
              <path d="M52,44 L56,46" stroke="#1e293b" strokeWidth="2" />
              <path d="M68,44 L64,46" stroke="#1e293b" strokeWidth="2" />
              <circle cx="53" cy="49" r="1.5" fill="#1e293b" />
              <circle cx="67" cy="49" r="1.5" fill="#1e293b" />
              <path d="M52,58 Q60,54 68,58" stroke="#1e293b" strokeWidth="2.5" fill="none" />
              
              {/* Red laptop */}
              <rect x="42" y="78" width="36" height="18" rx="2" fill="#ef4444" />
              <polygon points="36,96 84,96 80,101 40,101" fill="#991b1b" />
            </svg>
            <div className="absolute top-2 right-4 bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded border border-red-200">
              Rage Detected
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Frustration Triggered Dialog</div>
            <p className="text-xs font-extrabold text-slate-900">
              Looks like something wasn't working. Can you tell us what?
            </p>
            <div className="space-y-2">
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-500" 
                placeholder="Type your answer..."
                disabled
              />
              <button className="w-full bg-indigo-600 text-white font-extrabold text-xs py-2 rounded-xl">
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* 6. AI Analytics */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                6
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                AI Analytics
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              AI automatically clusters responses and turns raw customer complaints into highly action-oriented executive summaries.
            </p>
          </div>

          {/* Mini CSS Chart Representation */}
          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">Top Pain Reasons Classified</div>
            <div className="space-y-2 text-[10px] font-bold text-slate-600">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Pricing too high</span>
                  <span className="text-indigo-600">42%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Missing features</span>
                  <span className="text-pink-500">28%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Confusing info</span>
                  <span className="text-emerald-500">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-50 h-full rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-3 text-indigo-900 relative shadow-sm">
            <span className="absolute top-2 right-2 text-indigo-400 text-xs">✕</span>
            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
              <Bot size={12} /> AI Summary Insight
            </div>
            <p className="text-xs font-bold leading-relaxed text-indigo-950">
              Users from <strong className="text-indigo-600 bg-indigo-100 px-1 py-0.5 rounded">Google Ads</strong> think pricing is expensive, while organic visitors are mainly confused by missing feature descriptions on the landing page.
            </p>
          </div>
        </div>

        {/* 7. Revenue Attribution */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                7
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
                Revenue Attribution <span className="flex text-amber-400">⭐⭐⭐⭐⭐</span>
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              Connect user feedback to actual purchases and calculate direct, real-world business impact.
            </p>
          </div>

          {/* Multi Line graph preview */}
          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">Attribution Correlations</div>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between text-[10px] font-extrabold text-red-700">
                <span>"Pricing" Mentions</span>
                <span className="flex items-center gap-1">
                  31% lower conv. 📉
                </span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-[10px] font-extrabold text-emerald-700">
                <span>Fixing Checkout Conf.</span>
                <span className="flex items-center gap-1">
                  +12% Revenue 📈
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Impact Box */}
          <div className="lg:col-span-4 bg-white border-2 border-indigo-600 rounded-2xl p-5 space-y-2 shadow-lg relative">
            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Revenue Impact Projected</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">$24,300</div>
            <p className="text-[10px] text-slate-500 font-bold">Estimated monthly conversion revenue increase.</p>
            {/* SVG mini trendline */}
            <svg viewBox="0 0 100 30" className="w-full h-8 mt-2">
              <path d="M0,25 Q20,10 40,18 T80,5 T100,2" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
              <path d="M0,25 Q20,10 40,18 T80,5 T100,2 L100,30 L0,30 Z" fill="url(#purpleGrad)" opacity="0.1" />
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#fff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 8. Journey Surveys */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                8
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Journey Surveys
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              Deploy modular surveys at every single crossroad of the customer lifecycle journey.
            </p>
          </div>

          {/* Timeline Milestones representation */}
          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-x-auto">
            <div className="flex items-center justify-between min-w-[240px] text-[8px] font-bold text-slate-400">
              {['Before Signup', 'After Signup', 'After Purchase', 'After 30 Days', 'Before Renewal'].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 text-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-bold ${idx === 2 ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {idx + 1}
                  </div>
                  <span className="max-w-[45px] leading-tight">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Journey Survey (Post-Purchase)</div>
            <p className="text-xs font-extrabold text-slate-900">
              How was your experience with your first purchase?
            </p>
            <div className="flex justify-center gap-1 pb-1">
              {[1, 2, 3, 4, 5].map(st => (
                <Star key={st} size={18} fill="#f59e0b" stroke="#d97706" className="cursor-pointer" />
              ))}
            </div>
          </div>
        </div>

        {/* 9. AI Follow-up Questions */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                9
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                AI Follow-up Questions
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              Deepen visitor feedback in real-time by asking tailored follow-up sub-questions based on what they initially answered.
            </p>
          </div>

          {/* Dialogue Simulator */}
          <div className="lg:col-span-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-100">Intelligent Conversation</div>
            <div className="space-y-2 text-[10px] leading-relaxed">
              <div className="text-right">
                <span className="inline-block bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-2xl rounded-tr-none font-bold">
                  You: "Too expensive."
                </span>
              </div>
              <div className="text-left">
                <span className="inline-block bg-indigo-50 text-indigo-800 px-2.5 py-1.5 rounded-2xl rounded-tl-none font-extrabold">
                  AI: "Compared to which competitor?"
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Adaptive Follow-up</div>
            <p className="text-xs font-extrabold text-slate-900">
              Which competitor were you comparing us with?
            </p>
            <div className="space-y-2">
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-500" 
                placeholder="Type competitor name..."
                disabled
              />
              <button className="w-full bg-indigo-600 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1">
                <span>Next</span> <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 10. Automatic Insights */}
        <div className="bg-slate-50/50 rounded-3xl p-5 sm:p-8 border border-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-md">
                10
              </span>
              <h5 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Automatic Insights
              </h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
              No manual work or guesswork. AI sifts through data patterns every single day and delivers neat daily executive digests.
            </p>
            <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
              No manual work. No guesswork.
            </span>
          </div>

          {/* Daily Insight Box */}
          <div className="lg:col-span-4 p-4 bg-indigo-950 text-white rounded-2xl border border-indigo-900 space-y-2.5 relative">
            <div className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
              <Bot size={12} /> Daily Insight
            </div>
            <p className="text-[11px] font-bold text-indigo-100 leading-relaxed">
              Yesterday, 43 visitors abandoned checkout specifically because <strong className="text-indigo-300">shipping costs</strong> appeared too late in the funnel.
            </p>
          </div>

          {/* User pointing graphic simulation */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center shrink-0">
              <Bot size={24} className="text-indigo-600" />
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-800">Perfect Clarity Achieved</div>
              <p className="text-[10px] text-slate-400 font-semibold leading-tight">
                "Our team optimized checkout fields and converted 12 additional sales today."
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Aesthetic Footer Branding */}
      <div className="pt-6 border-t border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Powered by CustomerLens Intelligent Behavior Capture
      </div>
    </div>
  );
}
