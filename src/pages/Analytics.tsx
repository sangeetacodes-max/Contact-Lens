import React from 'react';
import { AnalyticsData, ResponseRecordData } from '../lib/api';
import { Analytics } from '../components/Analytics';
import { Download, RefreshCw } from 'lucide-react';

interface AnalyticsPageProps {
  analyticsData: AnalyticsData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analyticsData,
  loading,
  onRefresh
}) => {
  const exportCsv = () => {
    if (!analyticsData || !analyticsData.recentResponses || analyticsData.recentResponses.length === 0) return;
    const headers = 'ID,Question,Answer,Sentiment,Category,Signal,Created At\n';
    const rows = analyticsData.recentResponses
      .map(r => `"${r.id}","${(r.question_text || '').replace(/"/g, '""')}","${(r.answer || '').replace(/"/g, '""')}","${r.sentiment || ''}","${r.category || ''}","${(r.signal || '').replace(/"/g, '""')}","${r.created_at}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customerlens-responses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Customer Analytics & Feedback Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real visitor sessions, exit reasons, and friction signals</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {analyticsData && analyticsData.recentResponses && analyticsData.recentResponses.length > 0 && (
            <button
              type="button"
              onClick={exportCsv}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      <Analytics data={analyticsData} loading={loading} />
    </div>
  );
};
