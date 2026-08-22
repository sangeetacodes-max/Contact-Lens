import React from 'react';
import { AnalyticsData, ResponseRecordData } from '../lib/api';
import { BarChart3, Users, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Inbox } from 'lucide-react';

interface AnalyticsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Aggregating telemetry and AI signals...</p>
      </div>
    );
  }

  // Strict "No data yet." requirement when no records exist
  if (!data || !data.hasData || (data.metrics.totalVisitors === 0 && data.metrics.totalResponses === 0)) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No data yet.</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Install the CustomerLens tracking script on your website to begin recording live visitor behavior, rage clicks, exit intent, and survey responses.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400">
          Listening for telemetry...
        </div>
      </div>
    );
  }

  const { metrics, sentiment, objections, insights, recentResponses } = data;

  return (
    <div className="space-y-6">
      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Visitors</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalVisitors}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tracked website sessions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Responses</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalResponses}</div>
          <div className="text-[11px] text-emerald-400 mt-1">{metrics.responseRate} completion rate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Triggers Fired</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.triggersFired}</div>
          <div className="text-[11px] text-slate-500 mt-1">Exit-intent & dwell triggers</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rage Clicks</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.rageClickEvents}</div>
          <div className="text-[11px] text-slate-500 mt-1">Friction / rapid clicks detected</div>
        </div>
      </div>

      {/* AI Macro Insights Panel */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400 text-sm font-bold mb-3">
            <Sparkles className="w-5 h-5" />
            <span>AI Executive Synthesis & Objections</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">{insights[0]?.title}</h4>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{insights[0]?.summary}</p>

          {insights[0]?.recommendations && insights[0].recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
              {insights[0].recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-emerald-400 flex items-center justify-between">
                    <span>{rec.issue}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{rec.impact} Impact</span>
                  </div>
                  <p className="text-slate-300">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sentiment & Objections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Customer Sentiment Score: {sentiment.score}/100</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Positive Sentiment</span>
                <span>{sentiment.positive}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${metrics.totalResponses > 0 ? (sentiment.positive / metrics.totalResponses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Neutral / Informational</span>
                <span>{sentiment.neutral}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${metrics.totalResponses > 0 ? (sentiment.neutral / metrics.totalResponses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Constructive / Objections</span>
                <span>{sentiment.negative}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${metrics.totalResponses > 0 ? (sentiment.negative / metrics.totalResponses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Objections Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-4">Common Objections & Friction Categories</h4>
          {objections.length === 0 ? (
            <p className="text-xs text-slate-400">No categorized objections yet.</p>
          ) : (
            <div className="space-y-3">
              {objections.map((obj, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-medium text-slate-200">{obj.reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{obj.count} responses</span>
                    <span className="font-mono font-bold text-emerald-400">{obj.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real Customer Responses Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Real Customer Responses ({recentResponses.length})</h4>
        {recentResponses.length === 0 ? (
          <p className="text-xs text-slate-400">No responses recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentResponses.map(resp => (
              <div key={resp.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-400">{resp.question_text}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(resp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-white font-medium">"{resp.answer}"</p>
                {resp.signal && (
                  <div className="text-xs text-slate-400 flex items-center gap-2 pt-0.5">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-bold">
                      {resp.category || 'Feedback'}
                    </span>
                    <span>AI Signal: {resp.signal}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
