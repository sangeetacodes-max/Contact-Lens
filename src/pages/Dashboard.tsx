import React from 'react';
import { AnalyticsData, SurveyData, WebsiteData } from '../lib/api';
import { Analytics } from '../components/Analytics';
import { Plus, Code2, ExternalLink, ShieldCheck, Sparkles, Activity, Check, Copy } from 'lucide-react';

interface DashboardPageProps {
  currentWebsite: WebsiteData | null;
  analyticsData: AnalyticsData | null;
  surveys: SurveyData[];
  loading: boolean;
  onNavigateTab: (tab: 'dashboard' | 'surveys' | 'analytics' | 'notifications' | 'settings') => void;
  onCreateSurvey: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentWebsite,
  analyticsData,
  surveys,
  loading,
  onNavigateTab,
  onCreateSurvey
}) => {
  const [copied, setCopied] = React.useState(false);

  const trackingSnippet = `<script
  src="${window.location.origin}/customerlens.js"
  data-site-id="${currentWebsite?.site_id || 'site_default'}"
  async>
</script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(trackingSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Live Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Live Telemetry Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {currentWebsite ? `${currentWebsite.name} (${currentWebsite.domain})` : 'Your Connected Website'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Site ID: <span className="font-mono text-slate-300">{currentWebsite?.site_id || 'site_default'}</span>
            {currentWebsite?.verified && (
              <span className="inline-flex items-center gap-1 text-emerald-400 ml-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copySnippet}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Snippet' : 'Copy Tracking Code'}
          </button>
          <button
            type="button"
            onClick={onCreateSurvey}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Survey
          </button>
        </div>
      </div>

      {/* Snippet Notice if no data yet */}
      {analyticsData && !analyticsData.hasData && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Embed Script on Your Site</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste this single line into the <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">&lt;head&gt;</code> of your website to start capturing exit intent and customer objections.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
          >
            View Installation Guide <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Real Analytics & Insights Feed */}
      <Analytics data={analyticsData} loading={loading} />
    </div>
  );
};
