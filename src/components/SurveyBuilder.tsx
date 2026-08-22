import React, { useState } from 'react';
import { SurveyData, SurveyQuestionData, api } from '../lib/api';
import { Sparkles, Plus, Trash2, Eye, Sliders, CheckCircle2, ArrowRight, Save, X } from 'lucide-react';

interface SurveyBuilderProps {
  websiteId: string;
  initialSurvey?: SurveyData | null;
  onSave: (survey: SurveyData) => void;
  onCancel: () => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  websiteId,
  initialSurvey,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialSurvey?.title || 'Exit Intent Feedback');
  const [headline, setHeadline] = useState(initialSurvey?.headline || 'Wait! Before you leave...');
  const [thankYouMessage, setThankYouMessage] = useState(initialSurvey?.thank_you_message || 'Thank you for your valuable feedback!');
  const [status, setStatus] = useState<'published' | 'draft'>(initialSurvey?.status || 'published');

  const [questions, setQuestions] = useState<SurveyQuestionData[]>(
    initialSurvey?.questions || [
      {
        id: `q_${Date.now()}`,
        question_text: 'What was the main reason for your visit today?',
        type: 'multiple-choice',
        options: ['Looking for pricing info', 'Comparing options', 'Need specific features', 'Just browsing'],
        required: true
      }
    ]
  );

  const [triggers, setTriggers] = useState(
    initialSurvey?.triggers || {
      exit_intent: true,
      dwell_time_pricing: 45,
      pricing_visit_count: 3,
      rage_clicks: true,
      hesitation: true
    }
  );

  const [design, setDesign] = useState(
    initialSurvey?.design || {
      background_color: '#0f172a',
      text_color: '#ffffff',
      accent_color: '#10b981',
      placement: 'Exit Intent Popup' as const
    }
  );

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState('Find out why users leave without buying');
  const [activeTab, setActiveTab] = useState<'questions' | 'triggers' | 'design'>('questions');
  const [saving, setSaving] = useState(false);

  // Handle AI Survey Generation
  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    try {
      const result = await api.surveys.generateWithAi({
        domain: 'website',
        goal: aiGoal
      });
      if (result) {
        if (result.title) setTitle(result.title);
        if (result.headline) setHeadline(result.headline);
        if (result.questions) setQuestions(result.questions);
        if (result.triggers) setTriggers(result.triggers);
        if (result.design) setDesign(result.design);
        if (result.thank_you_message) setThankYouMessage(result.thank_you_message);
      }
    } catch (e) {
      console.warn('AI Generation failed, retaining existing setup:', e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Add question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        question_text: 'What can we improve?',
        type: 'multiple-choice',
        options: ['Pricing', 'Product Clarity', 'Feature Set', 'Other'],
        required: true
      }
    ]);
  };

  // Update question
  const updateQuestion = (idx: number, patch: Partial<SurveyQuestionData>) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...patch };
    setQuestions(updated);
  };

  // Remove question
  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Save survey
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<SurveyData> = {
        website_id: websiteId,
        title,
        headline,
        status,
        questions,
        triggers,
        design,
        thank_you_message: thankYouMessage
      };

      let saved: SurveyData;
      if (initialSurvey?.id) {
        saved = await api.surveys.update(initialSurvey.id, payload);
      } else {
        saved = await api.surveys.create(payload);
      }
      onSave(saved);
    } catch (err) {
      console.error('Failed to save survey:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            {initialSurvey ? 'Edit Survey' : 'Create New Survey'}
          </h2>
          <p className="text-sm text-slate-400">Configure high-converting contextual triggers and questions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save & Deploy'}
          </button>
        </div>
      </div>

      {/* AI Generator Bar */}
      <div className="mt-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>AI Survey Architect:</span>
          <input
            type="text"
            value={aiGoal}
            onChange={e => setAiGoal(e.target.value)}
            placeholder="e.g. Find out why visitors leave pricing page..."
            className="bg-slate-900/80 border border-emerald-500/40 text-white text-xs px-3 py-1.5 rounded-lg w-64 md:w-80 outline-none focus:border-emerald-400"
          />
        </div>
        <button
          type="button"
          onClick={handleAiGenerate}
          disabled={isAiGenerating}
          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition flex items-center gap-1.5"
        >
          {isAiGenerating ? 'Generating...' : 'Auto-Generate with AI'}
        </button>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'questions'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Questions ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('triggers')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'triggers'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Behavioral Triggers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'design'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Design & Styling
            </button>
          </div>

          {/* TAB 1: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Internal Survey Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Visitor Headline (Main Prompt)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-2">
                {questions.map((q, qIndex) => (
                  <div key={q.id || qIndex} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Question {qIndex + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={q.question_text}
                      onChange={e => updateQuestion(qIndex, { question_text: e.target.value })}
                      placeholder="e.g. What almost stopped you from purchasing?"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                    />

                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                        <select
                          value={q.type}
                          onChange={e => updateQuestion(qIndex, { type: e.target.value as any })}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="text">Open Text Response</option>
                          <option value="rating">1-5 Rating Scale</option>
                          <option value="yes-no">Yes / No</option>
                        </select>
                      </div>
                    </div>

                    {q.type === 'multiple-choice' && (
                      <div className="space-y-2 pt-1">
                        <label className="block text-[11px] text-slate-400">Options</label>
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const newOpts = [...(q.options || [])];
                                newOpts[optIdx] = e.target.value;
                                updateQuestion(qIndex, { options: newOpts });
                              }}
                              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = (q.options || []).filter((_, i) => i !== optIdx);
                                updateQuestion(qIndex, { options: newOpts });
                              }}
                              className="text-slate-500 hover:text-red-400 p-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            updateQuestion(qIndex, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] });
                          }}
                          className="text-xs text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                        >
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-2.5 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Add Another Question
              </button>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Thank You Message</label>
                <input
                  type="text"
                  value={thankYouMessage}
                  onChange={e => setThankYouMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TRIGGERS */}
          {activeTab === 'triggers' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Configure the behavioral intelligence rules that govern when this survey is shown to visitors.
              </p>

              <div className="space-y-3">
                {/* Exit Intent */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(triggers.exit_intent)}
                    onChange={e => setTriggers({ ...triggers, exit_intent: e.target.checked })}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">Exit Intent Detection</div>
                    <div className="text-xs text-slate-400">Trigger when cursor moves rapidly towards browser navigation bar or closes tab.</div>
                  </div>
                </label>

                {/* Pricing Dwell */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Pricing Page Dwell Time</div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">{triggers.dwell_time_pricing || 45}s</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={triggers.dwell_time_pricing || 45}
                    onChange={e => setTriggers({ ...triggers, dwell_time_pricing: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-xs text-slate-400">Triggers after visitor hesitates on pricing/plans page.</div>
                </div>

                {/* Repeated Pricing Visits */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Repeated Pricing Page Visits</div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">{triggers.pricing_visit_count || 3} visits</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="1"
                    value={triggers.pricing_visit_count || 3}
                    onChange={e => setTriggers({ ...triggers, pricing_visit_count: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-xs text-slate-400">Triggers when user views pricing multiple times without converting.</div>
                </div>

                {/* Rage Clicks */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(triggers.rage_clicks)}
                    onChange={e => setTriggers({ ...triggers, rage_clicks: e.target.checked })}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">Rage Click & Frustration Sensor</div>
                    <div className="text-xs text-slate-400">Trigger if user rapidly clicks an unresponsive button or broken element (&gt;3 clicks/sec).</div>
                  </div>
                </label>

                {/* Long Hesitation */}
                <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(triggers.hesitation)}
                    onChange={e => setTriggers({ ...triggers, hesitation: e.target.checked })}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">Long Inactivity / Hesitation Sensor</div>
                    <div className="text-xs text-slate-400">Trigger if visitor freezes and pauses interaction for over 25 seconds.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: DESIGN */}
          {activeTab === 'design' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Widget Placement</label>
                <select
                  value={design.placement}
                  onChange={e => setDesign({ ...design, placement: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm outline-none"
                >
                  <option value="Exit Intent Popup">Center Popup Modal</option>
                  <option value="Bottom Right Toast">Bottom Right Toast</option>
                  <option value="Bottom Left Toast">Bottom Left Toast</option>
                  <option value="Slide-in Banner">Slide-in Banner</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.background_color}
                      onChange={e => setDesign({ ...design, background_color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{design.background_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.text_color}
                      onChange={e => setDesign({ ...design, text_color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{design.text_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.accent_color}
                      onChange={e => setDesign({ ...design, accent_color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{design.accent_color}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" />
            Live Visitor Preview
          </div>

          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-white/10 relative"
            style={{
              backgroundColor: design.background_color,
              color: design.text_color
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
              CustomerLens Micro-Survey
            </div>
            <h3 className="text-base font-bold mb-1.5 leading-snug">{headline || 'Headline Prompt'}</h3>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">
              {questions[0]?.question_text || 'Question text...'}
            </p>

            {questions[0]?.type === 'multiple-choice' ? (
              <div className="space-y-2">
                {(questions[0]?.options || ['Option 1', 'Option 2']).map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full text-left px-3.5 py-2 text-xs rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 transition flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-3 h-3 opacity-40" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  disabled
                  placeholder="Visitor enters feedback..."
                  className="w-full bg-black/20 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                />
                <button
                  type="button"
                  style={{ backgroundColor: design.accent_color }}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white shadow-md"
                >
                  Submit
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <span className="text-[10px] opacity-50">Powered by CustomerLens AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
