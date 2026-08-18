import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Code2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authenticatedFetch } from '../lib/firebase';
import { DomainVerificationRecord } from '../types';

interface WebsiteVerificationProps {
  initialDomain?: string;
  onVerificationSuccess?: (domain: string) => void;
  onStatusChange?: (isVerified: boolean, domain: string) => void;
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
  minimal?: boolean;
}

export function WebsiteVerification({
  initialDomain = '',
  onVerificationSuccess,
  onStatusChange,
  showNotification,
  minimal = false
}: WebsiteVerificationProps) {
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DomainVerificationRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    domain: string;
    message: string;
    checkedAt: string;
  } | null>(null);

  // Normalize domain
  const normalizeClientDomain = (input: string): string => {
    if (!input) return '';
    let d = input.trim().toLowerCase();
    d = d.replace(/^https?:\/\//i, '');
    d = d.replace(/:\d+$/, '');
    d = d.split('/')[0].split('?')[0].split('#')[0];
    d = d.replace(/^\.+|\.+$/g, '').trim();
    return d;
  };

  const getErrorString = (err: any, fallback = 'Operation failed'): string => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      if (typeof err.message === 'string') return err.message;
      if (err.error) {
        if (typeof err.error === 'string') return err.error;
        if (typeof err.error === 'object' && typeof err.error.message === 'string') return err.error.message;
      }
    }
    return fallback;
  };

  const notify = (msg: any, type: 'success' | 'error' | 'info' = 'info') => {
    if (showNotification) {
      const cleanMsg = typeof msg === 'string' ? msg : getErrorString(msg, 'Notification');
      showNotification(cleanMsg, type);
    }
  };

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    notify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fetch existing domain verifications
  const fetchDomains = async () => {
    try {
      const res = await authenticatedFetch('/api/domains');
      if (res.ok) {
        const data = await res.json();
        const records = data.records || data?.data?.records;
        if (records && Array.isArray(records) && records.length > 0) {
          const verified = records.find((r: DomainVerificationRecord) => r.verified);
          if (verified) {
            setSelectedRecord(verified);
            setVerificationResult({
              verified: true,
              domain: verified.domain,
              message: `Domain ${verified.domain} is verified via DNS TXT record.`,
              checkedAt: verified.verifiedAt || new Date().toISOString()
            });
            onVerificationSuccess?.(verified.domain);
            onStatusChange?.(true, verified.domain);
          } else if (!selectedRecord) {
            setSelectedRecord(records[0]);
            onStatusChange?.(false, records[0].domain);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load domains:', err);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // Step 1: Add Website -> Generate unique token
  const handleAddWebsite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDomain = normalizeClientDomain(domainInput);

    if (!cleanDomain) {
      notify('Please enter your website domain (e.g. yourwebsite.com)', 'error');
      return;
    }

    if (!cleanDomain.includes('.') || cleanDomain.length < 4) {
      notify('Please enter a valid domain (e.g. yourwebsite.com)', 'error');
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await authenticatedFetch('/api/domains/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain })
      });

      const data = await res.json();
      const record = data.record || data?.data?.record;

      if (res.ok && record) {
        setSelectedRecord(record);
        if (record.verified) {
          setVerificationResult({
            verified: true,
            domain: record.domain,
            message: `Domain ${record.domain} is verified.`,
            checkedAt: new Date().toISOString()
          });
          onVerificationSuccess?.(record.domain);
          onStatusChange?.(true, record.domain);
        } else {
          onStatusChange?.(false, record.domain);
        }
        notify(`DNS verification token generated for ${cleanDomain}`, 'success');
      } else {
        const errorMsg = getErrorString(data.error || data.message, 'Failed to setup domain');
        notify(errorMsg, 'error');
      }
    } catch (err: any) {
      notify(getErrorString(err, 'Network error while generating token'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify DNS TXT lookup
  const handleVerifyDns = async () => {
    if (!selectedRecord) return;
    const domain = selectedRecord.domain;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await authenticatedFetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });

      const data = await res.json();
      const payload = data.data || data;

      if (res.ok && payload.verified) {
        const updatedRecord = { ...selectedRecord, verified: true, verifiedAt: new Date().toISOString() };
        setSelectedRecord(updatedRecord);
        setVerificationResult({
          verified: true,
          domain,
          message: `✓ Domain verified! DNS TXT record found for ${domain}.`,
          checkedAt: new Date().toLocaleTimeString()
        });
        notify(`✓ Domain ${domain} verified successfully!`, 'success');
        onVerificationSuccess?.(domain);
        onStatusChange?.(true, domain);
      } else {
        const errorMsg = getErrorString(payload?.message || payload?.error, `DNS TXT record not detected yet. Looked for name "_customerlens" on ${domain}. Please allow 1–5 minutes for DNS propagation.`);
        setVerificationResult({
          verified: false,
          domain,
          message: errorMsg,
          checkedAt: new Date().toLocaleTimeString()
        });
        notify(`DNS record not found yet. Please check your DNS provider.`, 'error');
        onStatusChange?.(false, domain);
      }
    } catch (err: any) {
      const errorMsg = getErrorString(err, 'Error checking DNS records. Please try again.');
      setVerificationResult({
        verified: false,
        domain,
        message: errorMsg,
        checkedAt: new Date().toLocaleTimeString()
      });
      notify('Could not perform DNS lookup at this moment.', 'error');
      onStatusChange?.(false, domain);
    } finally {
      setVerifying(false);
    }
  };

  const trackingSnippet = selectedRecord
    ? `<script src="${window.location.origin}/customerlens.js" data-site-id="${selectedRecord.siteId || `site_${selectedRecord.domain.replace(/[^a-z0-9]/g, '_')}`}" async></script>`
    : '';

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* ──────────────────────────────────
          STEP 1: ADD YOUR WEBSITE
         ────────────────────────────────── */}
      {!selectedRecord ? (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-1">
              <Globe size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Add your website
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Enter your website domain to generate a unique DNS verification record.
            </p>
          </div>

          <form onSubmit={handleAddWebsite} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="input_website_domain" className="block text-xs font-bold text-slate-700">
                Website Domain
              </label>
              <div className="relative">
                <input
                  id="input_website_domain"
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="yourwebsite.com"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-2xl text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              id="btn_website_continue"
              type="submit"
              disabled={loading || !domainInput.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Generating Token...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        /* ──────────────────────────────────
            STEP 2: VERIFY DOMAIN OWNERSHIP
           ────────────────────────────────── */
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Card Header with Change option */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className={selectedRecord.verified ? "text-emerald-600" : "text-indigo-600"} />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Verify domain ownership
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono font-bold text-slate-700">
                {selectedRecord.domain}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedRecord(null);
                setVerificationResult(null);
                onStatusChange?.(false, '');
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline"
            >
              Change
            </button>
          </div>

          {/* DNS TXT Record Details Box */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-3 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">DNS TXT Record</span>
              <button
                type="button"
                onClick={() => handleCopy(`Type: TXT\nName: _customerlens\nValue: ${selectedRecord.token}`, 'all')}
                className="text-indigo-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'all' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedField === 'all' ? 'Copied' : 'Copy All'}
              </button>
            </div>

            {/* Record Type */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-sans text-[11px]">Type:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">TXT</span>
                <button
                  type="button"
                  onClick={() => handleCopy('TXT', 'type')}
                  className="text-slate-400 hover:text-slate-200 p-0.5"
                  title="Copy Type"
                >
                  {copiedField === 'type' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Record Name / Host */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-sans text-[11px]">Name:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">_customerlens</span>
                <button
                  type="button"
                  onClick={() => handleCopy('_customerlens', 'name')}
                  className="text-slate-400 hover:text-slate-200 p-0.5"
                  title="Copy Name"
                >
                  {copiedField === 'name' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Record Value / Token */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Value:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedRecord.token, 'value')}
                  className="text-indigo-400 hover:text-indigo-200 text-[11px] font-sans font-medium flex items-center gap-1"
                >
                  {copiedField === 'value' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedField === 'value' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-indigo-200 break-all select-all font-mono text-[11px] leading-relaxed">
                {selectedRecord.token}
              </div>
            </div>
          </div>

          {/* Dedicated [ Copy ] button */}
          <button
            type="button"
            id="btn_copy_record"
            onClick={() => handleCopy(selectedRecord.token, 'main_copy')}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copiedField === 'main_copy' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedField === 'main_copy' ? 'Copied to Clipboard!' : 'Copy Value'}</span>
          </button>

          <p className="text-xs text-slate-500 text-center font-medium">
            Add this to your DNS provider
          </p>

          {/* Action: [ Verify DNS ] */}
          <button
            id="btn_verify_dns"
            type="button"
            onClick={handleVerifyDns}
            disabled={verifying}
            className="w-full bg-[#008060] hover:bg-[#006048] disabled:opacity-60 text-white text-sm font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {verifying ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Querying DNS Resolvers...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Verify DNS
              </>
            )}
          </button>

          {/* ──────────────────────────────────
              VERIFICATION STATUS DISPLAY
             ────────────────────────────────── */}
          <AnimatePresence>
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  verificationResult.verified
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {verificationResult.verified ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-emerald-800 uppercase tracking-wider text-[11px]">✓ Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-rose-600" />
                        <span className="text-rose-800 uppercase tracking-wider text-[11px]">✕ Not Verified</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Checked {verificationResult.checkedAt}
                  </span>
                </div>

                <p className="leading-relaxed">
                  {verificationResult.message}
                </p>

                {/* If Verified: Show Tracking Script Snippet */}
                {verificationResult.verified && (
                  <div className="pt-2 border-t border-emerald-200/70 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                      <span className="flex items-center gap-1">
                        <Code2 size={13} />
                        CustomerLens Tracking Script
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(trackingSnippet, 'script')}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded"
                      >
                        {copiedField === 'script' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'script' ? 'Copied' : 'Copy Script'}
                      </button>
                    </div>
                    <pre className="p-2 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto border border-slate-800">
                      {trackingSnippet}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
