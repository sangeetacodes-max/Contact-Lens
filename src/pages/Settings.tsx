import React, { useState } from 'react';
import { WebsiteData, api } from '../lib/api';
import { Globe, ShieldCheck, Copy, Check, RefreshCw, Plus, Terminal, ExternalLink, Code2 } from 'lucide-react';

interface SettingsPageProps {
  websites: WebsiteData[];
  currentWebsite: WebsiteData | null;
  onSelectWebsite: (website: WebsiteData) => void;
  onRefreshWebsites: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  websites,
  currentWebsite,
  onSelectWebsite,
  onRefreshWebsites
}) => {
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; message: string } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedTxt, setCopiedTxt] = useState(false);

  const siteId = currentWebsite?.site_id || 'site_default';
  const txtValue = `customerlens-site-verification=${currentWebsite?.verification_token || siteId}`;

  const trackingSnippet = `<script
  src="${window.location.origin}/customerlens.js"
  data-site-id="${siteId}"
  async>
</script>`;

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsAdding(true);
    try {
      const added = await api.websites.create(newName.trim() || newDomain.trim(), newDomain.trim());
      onRefreshWebsites();
      onSelectWebsite(added);
      setNewDomain('');
      setNewName('');
    } catch (err) {
      console.error('Failed to add website:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async () => {
    if (!currentWebsite) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.websites.verify(currentWebsite.id);
      if (res.verified) {
        setVerifyResult({ verified: true, message: `Domain ${currentWebsite.domain} verified via ${res.method || 'DNS'}!` });
        onRefreshWebsites();
      } else {
        setVerifyResult({ verified: false, message: res.error || 'Verification record not found. Ensure DNS TXT record or snippet is active.' });
      }
    } catch (err: any) {
      setVerifyResult({ verified: false, message: err.message || 'Verification error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Website & Tracking Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage connected domains, DNS ownership verification, and tracking script</p>
      </div>

      {/* Website Switcher / Add New */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          Connected Websites ({websites.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {websites.map(site => {
            const isSelected = site.id === currentWebsite?.id || site.site_id === currentWebsite?.site_id;
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelectWebsite(site)}
                className={`p-4 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">{site.name || site.domain}</span>
                  {site.verified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono">Unverified</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{site.domain}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">ID: {site.site_id}</div>
              </button>
            );
          })}
        </div>

        {/* Add New Form */}
        <form onSubmit={handleAddWebsite} className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Website Name (e.g. My Store)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 flex-1 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="Domain (e.g. mystore.com)"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            required
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 flex-1 min-w-[140px]"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAdding ? 'Adding...' : 'Add Website'}
          </button>
        </form>
      </div>

      {/* Tracking Snippet Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              CustomerLens Tracking Snippet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste into your website's <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">&lt;head&gt;</code> tag to enable telemetry and surveys.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(trackingSnippet);
              setCopiedSnippet(true);
              setTimeout(() => setCopiedSnippet(false), 2000);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSnippet ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
          {trackingSnippet}
        </pre>
      </div>

      {/* Real DNS Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Domain DNS Ownership Verification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a DNS TXT record to your domain registrar (Cloudflare, GoDaddy, Namecheap) to verify ownership.
            </p>
          </div>
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Verifying DNS...' : 'Verify Ownership'}
          </button>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Record Type: <strong className="text-white">TXT</strong></span>
            <span>Host / Name: <strong className="text-white">@</strong> (or root domain)</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <span className="font-mono text-slate-300 truncate">{txtValue}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(txtValue);
                setCopiedTxt(true);
                setTimeout(() => setCopiedTxt(false), 2000);
              }}
              className="text-slate-400 hover:text-emerald-400 p-1"
              title="Copy TXT value"
            >
              {copiedTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {verifyResult && (
          <div
            className={`p-3 rounded-xl text-xs ${
              verifyResult.verified
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
            }`}
          >
            {verifyResult.message}
          </div>
        )}
      </div>
    </div>
  );
};
