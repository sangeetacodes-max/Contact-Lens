import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, AlertTriangle, Send, HeartHandshake, Sparkles } from 'lucide-react';

interface ExitIntentSurveyProps {
  onClose: () => void;
  onSubmit: (feedback: { reason: string; comment: string }) => void;
  triggerReason?: string;
  isNewUser?: boolean;
  viewCount?: number;
}

const EXIT_REASONS = [
  'The onboarding process felt too complicated',
  'I am looking for different features / capabilities',
  'I have concerns about the pricing or billing',
  'Other (Please describe below)'
];

const getTriggerExplanation = (reason: string): string => {
  const normalized = reason.toLowerCase();
  if (normalized.includes('scroll')) {
    return "Our AI detected rapid up-and-down scrolling reversals, signaling potential confusion or frustration while looking for specific content.";
  }
  if (normalized.includes('45s') || normalized.includes('pricing') || normalized.includes('hesitation')) {
    return "Our AI detected an extended 45-second pause on key decision sections, indicating hesitation or evaluation of product details.";
  }
  if (normalized.includes('returning') || normalized.includes('visitor')) {
    return "Our AI identified a returning visitor slowing down or pausing near the exit boundary, triggering a smart, proactive customer care hook.";
  }
  return "Our AI tracked your cursor speed and mouse trajectory accelerating directly towards the browser's close and tab navigation area, predicting intent to exit.";
};

export default function ExitIntentSurvey({ onClose, onSubmit, triggerReason, isNewUser, viewCount }: ExitIntentSurveyProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [otherText, setOtherText] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    
    // Generate a unique 15% discount code
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `LENS15-${randomSuffix}`;
    setGeneratedCode(code);
    
    // Persist to localStorage so other payment components can discover it
    localStorage.setItem('cl_survey_completed_code', code);

    onSubmit({
      reason: selectedReason,
      comment: selectedReason.includes('Other') ? otherText : otherText || 'No extra comments'
    });
    setSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="exit_intent_overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div
        id="exit_intent_card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative"
      >
        {/* Close Button */}
        <button
          id="btn_exit_intent_close"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
        >
          <X size={16} />
        </button>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                id="exit_intent_form"
                key="form"
                onSubmit={handleSubmit} 
                className="space-y-6 text-left"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Could we help with anything?
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    We'd love to understand your experience. Please share why you are leaving CustomerLens today so we can improve it.
                  </p>
                </div>

                {/* Options list */}
                <div className="space-y-2.5">
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {EXIT_REASONS.map((reason, idx) => (
                      <button
                        key={idx}
                        id={`btn_exit_reason_${idx}`}
                        type="button"
                        onClick={() => setSelectedReason(reason)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                          selectedReason === reason
                            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 font-semibold'
                            : 'border-slate-150 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selectedReason === reason ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-300'
                        }`}>
                          {selectedReason === reason && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                        </div>
                        <span className="text-xs">{reason}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Textarea */}
                {(selectedReason || selectedReason.includes('Other')) && (
                  <motion.div
                    id="exit_intent_details_container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      {selectedReason.includes('Other') ? 'Describe your problem' : 'Additional Comments (Optional)'}
                    </label>
                    <textarea
                      id="exit_intent_textarea"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder={selectedReason.includes('Other') ? "Please tell us what went wrong..." : "Any additional details to help us fix this problem?"}
                      rows={3}
                      required={selectedReason.includes('Other')}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-xs outline-none"
                    />
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    id="btn_exit_intent_stay"
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Stay on Site
                  </button>
                  <button
                    id="btn_exit_intent_submit"
                    type="submit"
                    disabled={!selectedReason || (selectedReason.includes('Other') && !otherText.trim())}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all"
                  >
                    Submit & Close <Send size={12} />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                id="exit_intent_thankyou"
                key="thankyou"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-5"
              >
                <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl text-emerald-600">
                  🎁
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Thank You! Here is Your Coupon:</h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    We appreciate your feedback. Copy this exclusive code below to get <strong className="text-indigo-600 font-extrabold">15% off</strong> any premium CustomerLens plan!
                  </p>
                </div>

                {/* Coupon Copy Box */}
                <div className="bg-indigo-50/55 border border-indigo-100 rounded-2xl p-4 max-w-sm mx-auto flex flex-col items-center gap-3 shadow-sm">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">YOUR EXCLUSIVE CODE</div>
                  <div className="flex items-center gap-2 w-full justify-center">
                    <span className="font-mono font-black text-lg text-indigo-950 bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-inner select-all tracking-wide">
                      {generatedCode || "LENS15-FREE"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      {copied ? "Copied! ✓" : "Copy"}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-[10px] font-semibold text-emerald-600 font-sans">
                      ✓ Copied to clipboard! Ready to paste at checkout.
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all"
                  >
                    Claim Discount & Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
