import React from 'react';
import { SurveyData, api } from '../lib/api';
import { Play, Pause, Edit3, Trash2, Code, Plus, MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';

interface SurveyListProps {
  surveys: SurveyData[];
  onEdit: (survey: SurveyData) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  onEdit,
  onCreateNew,
  onRefresh
}) => {
  const handleToggleStatus = async (survey: SurveyData) => {
    const nextStatus = survey.status === 'published' ? 'paused' : 'published';
    try {
      await api.surveys.update(survey.id, { status: nextStatus });
      onRefresh();
    } catch (e) {
      console.error('Failed to update survey status:', e);
    }
  };

  const handleDelete = async (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    try {
      await api.surveys.delete(surveyId);
      onRefresh();
    } catch (e) {
      console.error('Failed to delete survey:', e);
    }
  };

  if (surveys.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No surveys created yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Create your first behavioral survey to start capturing exit intent, pricing friction, and customer feedback.
        </p>
        <button
          type="button"
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create First Survey
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Active Surveys ({surveys.length})</h3>
        <button
          type="button"
          onClick={onCreateNew}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs shadow-md transition inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          New Survey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surveys.map(survey => {
          const isPublished = survey.status === 'published';
          const triggerCount = Object.values(survey.triggers || {}).filter(Boolean).length;

          return (
            <div
              key={survey.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {survey.status}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{survey.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">"{survey.headline}"</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 my-4">
                  <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    {survey.questions?.length || 1} Question{(survey.questions?.length || 1) > 1 ? 's' : ''}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    {triggerCount} Active Trigger{triggerCount > 1 ? 's' : ''}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
                    {survey.design?.placement || 'Popup'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(survey)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    isPublished
                      ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                      : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                >
                  {isPublished ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPublished ? 'Pause' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(survey)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Edit Survey"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(survey.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Delete Survey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
