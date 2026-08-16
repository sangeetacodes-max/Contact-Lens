import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  Clock, 
  Server, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Sparkles,
  Layers,
  Eye,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authenticatedFetch } from '../lib/firebase';
import { DomainVerificationRecord } from '../types';

interface WebsiteVerificationProps {
  initialDomain?: string;
  onVerificationSuccess?: (domain: string) => void;
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
  minimal?: boolean;
}

export function WebsiteVerification({
  initialDomain = '',
  onVerificationSuccess,
  showNotification,
  minimal = false
}: WebsiteVerificationProps) {
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainVerificationRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainVerificationRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [recordTypeTab, setRecordTypeTab] = useState<'CNAME' | 'TXT'>('CNAME');
  const [showProviderGuide, setShowProviderGuide] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'cloudflare' | 'godaddy' | 'namecheap' | 'google' | 'route53'>('cloudflare');
  const [verificationFeedback, setVerificationFeedback] = useState<{
    domain: string;
    status: 'success' | 'pending' | 'error';
    message: string;
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

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (showNotification) {
      showNotification(msg, type);
    }
  };

  // Determine CNAME host and target
  const getCnameDetails = (domain: string) => {
    const clean = normalizeClientDomain(domain);
    const parts = clean.split('.');
    if (parts.length > 2) {
      // Subdomain (e.g. www.example.com -> www, feedback.example.com -> feedback)
      return {
        host: parts[0],
        target: 'custom.customerlens.app',
        fallbackTarget: 'customerlens.pages.dev'
      };
    }
    // Apex domain (example.com)
    return {
      host: '@',
      target: 'custom.customerlens.app',
      fallbackTarget: 'customerlens.pages.dev'
    };
  };

  // Fetch all domain verifications for current authenticated user
  const fetchDomains = async () => {
    try {
      const res = await authenticatedFetch('/api/domains');
      if (res.ok) {
        const data = await res.json();
        const records = data.records || data?.data?.records;
        if (records && Array.isArray(records)) {
          setDomains(records);
          if (records.length > 0 && !selectedDomain) {
            setSelectedDomain(records[0]);
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

  // Copy helper with visual feedback
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    notify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Connect Domain (Generate Verification Token)
  const handleConnectDomain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDomain = normalizeClientDomain(domainInput);

    if (!cleanDomain) {
      notify('Please enter your website domain (e.g. www.example.com)', 'error');
      return;
    }

    if (!cleanDomain.includes('.') || cleanDomain.length < 4) {
      notify('Please enter a valid domain with a top-level domain (e.g. www.example.com)', 'error');
      return;
    }

    setLoading(true);
    setVerificationFeedback(null);

    try {
      const res = await authenticatedFetch('/api/domains/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain })
      });

      const data = await res.json();
      const record = data.record || data?.data?.record;

      if (res.ok && record) {
        setSelectedDomain(record);
        setDomainInput('');
        await fetchDomains();
        notify(`DNS record ready for ${cleanDomain}!`, 'success');
      } else {
        notify(data.error || data.message || 'Failed to setup domain connection', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Network error while setting up domain', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify DNS (CNAME or TXT record lookup)
  const handleVerifyDns = async (recordToVerify: DomainVerificationRecord) => {
    const domain = recordToVerify.domain;
    setVerifyingDomain(domain);
    setVerificationFeedback(null);

    try {
      const res = await authenticatedFetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });

      const data = await res.json();
      const payload = data.data || data;

      if (res.ok && payload.verified) {
        setVerificationFeedback({
          domain,
          status: 'success',
          message: `✓ Domain ${domain} connected successfully! DNS record verified.`
        });
        notify(`✓ Domain ${domain} connected successfully!`, 'success');
        if (onVerificationSuccess) {
          onVerificationSuccess(domain);
        }
      } else {
        setVerificationFeedback({
          domain,
          status: 'pending',
          message: payload.message || "We couldn't find the DNS record yet. DNS propagation may take a few minutes. Check again shortly."
        });
        notify("DNS record not detected yet. Please allow time for DNS propagation.", 'info');
      }

      await fetchDomains();
      if (payload.record) {
        setSelectedDomain(payload.record);
      }
    } catch (err: any) {
      setVerificationFeedback({
        domain,
        status: 'error',
        message: err.message || 'DNS verification query failed.'
      });
      notify(err.message || 'Failed to query DNS records', 'error');
    } finally {
      setVerifyingDomain(null);
    }
  };

  // 3. Remove / Disconnect Domain
  const handleDeleteDomain = async (domain: string) => {
    if (!confirm(`Are you sure you want to disconnect ${domain}?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/domains?domain=${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        notify(`Domain ${domain} disconnected.`, 'info');
        if (selectedDomain?.domain === domain) {
          setSelectedDomain(null);
        }
        await fetchDomains();
      } else {
        const data = await res.json();
        notify(data.error || 'Failed to remove domain', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Failed to remove domain', 'error');
    }
  };

  const providerInstructions = {
    cloudflare: {
      name: 'Cloudflare',
      steps: [
        'Log in to Cloudflare Dashboard and select your domain.',
        'Navigate to DNS -> Records.',
        'Click "+ Add record".',
        'Choose Type: "CNAME" (or "TXT" for root apex verification).',
        'Enter Name: "www" (or your subdomain name).',
        'Enter Target: "custom.customerlens.app" (Proxy status: DNS only).',
        'Click "Save".'
      ]
    },
    godaddy: {
      name: 'GoDaddy',
      steps: [
        'Log in to your GoDaddy Domain Portfolio and select your domain.',
        'Go to DNS settings -> "Add New Record".',
        'Choose Type: "CNAME".',
        'Name: "www".',
        'Value: "custom.customerlens.app".',
        'TTL: 1/2 hour (or default) and click "Save".'
      ]
    },
    namecheap: {
      name: 'Namecheap',
      steps: [
        'Log in to Namecheap and open Domain List -> "Manage".',
        'Click the "Advanced DNS" tab.',
        'Click "ADD NEW RECORD" under Host Records.',
        'Type: "CNAME Record", Host: "www", Target: "custom.customerlens.app".',
        'Click the green checkmark to save.'
      ]
    },
    google: {
      name: 'Google Domains / Squarespace',
      steps: [
        'Log in to your DNS management console.',
        'Go to Custom DNS Records and click "Create new record".',
        'Host name: "www", Type: "CNAME", Data: "custom.customerlens.app".',
        'Click "Save".'
      ]
    },
    route53: {
      name: 'AWS Route 53',
      steps: [
        'Open Route 53 Hosted Zones and select your domain.',
        'Click "Create record".',
        'Record name: "www", Record type: "CNAME", Value: "custom.customerlens.app".',
        'Click "Create records".'
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CONNECT YOUR WEBSITE (INPUT FORM) */}
      {!selectedDomain ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="text-center space-y-1.5">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-1">
              <Globe size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Connect your website
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Link your domain so your customers can take surveys and view feedback experiences directly on your website.
            </p>
          </div>

          <form onSubmit={handleConnectDomain} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="input_connect_domain" className="block text-xs font-bold text-slate-700">
                Enter your domain
              </label>
              <div className="relative">
                <input
                  id="input_connect_domain"
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="www.example.com"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-2xl text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition-all"
                />
                {domainInput && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
                    Clean: {normalizeClientDomain(domainInput)}
                  </span>
                )}
              </div>
            </div>

            <button
              id="btn_connect_domain"
              type="submit"
              disabled={loading || !domainInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Connecting Domain...
                </>
              ) : (
                <>
                  Connect Domain
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <Info size={12} className="shrink-0" />
              Enter your root domain or subdomain (e.g. www.mystore.com or survey.brand.com)
            </p>
          </form>
        </div>
      ) : (
        /* 2. DNS INSTRUCTIONS OR CONNECTED STATE */
        <div className="space-y-6">
          {/* If Domain is NOT Verified Yet -> Step 2: "Add this DNS record" */}
          {!selectedDomain.verified ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6 max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-mono">
                    Pending DNS Verification
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Add this DNS record
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add the DNS record below in your domain provider to connect <span className="font-bold text-slate-800 font-mono">{selectedDomain.domain}</span>.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDomain(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Change Domain
                </button>
              </div>

              {/* Record Type Selector (CNAME vs TXT) */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-xs">
                <button
                  onClick={() => setRecordTypeTab('CNAME')}
                  className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-lg transition-all ${
                    recordTypeTab === 'CNAME' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CNAME (Recommended)
                </button>
                <button
                  onClick={() => setRecordTypeTab('TXT')}
                  className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-lg transition-all ${
                    recordTypeTab === 'TXT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  TXT (Ownership)
                </button>
              </div>

              {/* DNS Record Box */}
              {recordTypeTab === 'CNAME' ? (
                /* CNAME Box */
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 font-mono text-xs space-y-3.5 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">Type</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-800/60">CNAME</span>
                      <button onClick={() => handleCopy('CNAME', 'cname_type')} className="text-slate-400 hover:text-white p-1">
                        {copiedField === 'cname_type' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">Name</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/60">
                        {getCnameDetails(selectedDomain.domain).host}
                      </span>
                      <button onClick={() => handleCopy(getCnameDetails(selectedDomain.domain).host, 'cname_name')} className="text-slate-400 hover:text-white p-1">
                        {copiedField === 'cname_name' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider">Target</span>
                      <button
                        onClick={() => handleCopy(getCnameDetails(selectedDomain.domain).target, 'cname_target')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans font-medium"
                      >
                        {copiedField === 'cname_target' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedField === 'cname_target' ? 'Copied' : 'Copy target'}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-indigo-300 font-bold break-all select-all flex items-center justify-between">
                      <span>{getCnameDetails(selectedDomain.domain).target}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* TXT Record Box */
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 font-mono text-xs space-y-3.5 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">Type</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-800/60">TXT</span>
                      <button onClick={() => handleCopy('TXT', 'txt_type')} className="text-slate-400 hover:text-white p-1">
                        {copiedField === 'txt_type' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">Name / Host</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/60">@</span>
                      <button onClick={() => handleCopy('@', 'txt_host')} className="text-slate-400 hover:text-white p-1">
                        {copiedField === 'txt_host' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider">Value</span>
                      <button
                        onClick={() => handleCopy(selectedDomain.txtRecordValue, 'txt_value')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans font-medium"
                      >
                        {copiedField === 'txt_value' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedField === 'txt_value' ? 'Copied' : 'Copy value'}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-indigo-300 font-bold break-all select-all flex items-center justify-between">
                      <span>{selectedDomain.txtRecordValue}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Banner */}
              {verificationFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
                    verificationFeedback.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                      : verificationFeedback.status === 'pending'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {verificationFeedback.status === 'success' ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{verificationFeedback.message}</p>
                    {verificationFeedback.status === 'pending' && (
                      <p className="text-[11px] text-amber-800">
                        DNS records usually propagate within 1–10 minutes. Once you save the DNS record in your host, click "Verify DNS" below.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn_verify_dns_action"
                  onClick={() => handleVerifyDns(selectedDomain)}
                  disabled={verifyingDomain === selectedDomain.domain}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} className={verifyingDomain === selectedDomain.domain ? 'animate-spin' : ''} />
                  {verifyingDomain === selectedDomain.domain ? 'Verifying DNS Record...' : 'Verify DNS'}
                </button>

                <button
                  onClick={() => handleDeleteDomain(selectedDomain.domain)}
                  className="px-4 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* DNS Provider Guide Collapsible */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowProviderGuide(!showProviderGuide)}
                  className="w-full bg-slate-50 hover:bg-slate-100 p-3.5 text-left text-xs font-bold text-slate-800 flex justify-between items-center transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={15} className="text-indigo-600" />
                    How to add DNS record in your domain provider
                  </span>
                  {showProviderGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showProviderGuide && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-white border-t border-slate-200 space-y-4"
                    >
                      <div className="flex flex-wrap gap-1.5 border-b pb-3">
                        {(['cloudflare', 'godaddy', 'namecheap', 'google', 'route53'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setActiveProvider(p)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              activeProvider === p
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {providerInstructions[p].name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {providerInstructions[activeProvider].name} Instructions:
                        </h4>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                          {providerInstructions[activeProvider].steps.map((step, idx) => (
                            <li key={idx} className="pl-1">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            /* Domain is VERIFIED -> Step 3: Success Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6 max-w-2xl mx-auto"
            >
              {/* Success Header */}
              <div className="text-center space-y-3 py-2">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                    ✓ Domain connected successfully
                  </h2>
                  <p className="text-lg font-mono font-extrabold text-indigo-600 mt-1">
                    {selectedDomain.domain}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your domain is now connected to your account.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Status: ● Active
                </div>
              </div>

              {/* Action Buttons: [ Open Domain ] [ Manage Domain ] */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn_open_connected_domain"
                  onClick={() => setShowLivePreviewModal(true)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={16} />
                  Open Domain
                </button>

                <button
                  id="btn_manage_connected_domain"
                  onClick={() => setShowProviderGuide(!showProviderGuide)}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Sliders size={16} />
                  Manage Domain
                </button>
              </div>

              {/* Connected Domain Settings & Live Survey URL Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Live Customer Survey Endpoint:</span>
                  <button
                    onClick={() => handleCopy(`https://${selectedDomain.domain}/survey`, 'survey_url')}
                    className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedField === 'survey_url' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedField === 'survey_url' ? 'Copied' : 'Copy link'}
                  </button>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-indigo-700 font-bold flex justify-between items-center">
                  <span>https://{selectedDomain.domain}/survey</span>
                  <button
                    onClick={() => setShowLivePreviewModal(true)}
                    className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-sans font-bold flex items-center gap-1"
                  >
                    <Eye size={12} /> Preview
                  </button>
                </div>
              </div>

              {/* Manage Domain Options (Re-check, Disconnect) */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                <button
                  onClick={() => handleVerifyDns(selectedDomain)}
                  disabled={verifyingDomain === selectedDomain.domain}
                  className="text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1"
                >
                  <RefreshCw size={12} className={verifyingDomain === selectedDomain.domain ? 'animate-spin' : ''} />
                  Re-check DNS status
                </button>

                <button
                  onClick={() => handleDeleteDomain(selectedDomain.domain)}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Disconnect Domain
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. ARCHITECTURAL CLARITY: HOW CUSTOM DOMAIN FRONTEND SERVING WORKS */}
          {!minimal && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-5 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">How Your Custom Domain Works</h3>
                  <p className="text-xs text-slate-400">Multi-tenant Cloudflare Edge Routing</p>
                </div>
              </div>

              {/* Visual Flow Diagram */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <span>Customer visits</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{selectedDomain?.domain || 'example.com'}</span>
                </div>
                <div className="text-slate-500 pl-4">│</div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>▼ DNS CNAME Resolution</span>
                  <span className="text-slate-500 text-[10px]">(points to custom.customerlens.app)</span>
                </div>
                <div className="text-slate-500 pl-4">│</div>
                <div className="flex items-center gap-2 text-amber-300">
                  <span>▼ Cloudflare Edge Routing</span>
                </div>
                <div className="text-slate-500 pl-4">│</div>
                <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-800/50 text-indigo-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    <Sparkles size={13} className="text-indigo-400" />
                    CustomerLens Frontend Application
                  </div>
                  <div className="text-[11px] text-slate-300 pl-3.5 space-y-0.5 font-sans">
                    <p>• Identifies incoming domain (<code className="text-indigo-300">{selectedDomain?.domain || 'example.com'}</code>)</p>
                    <p>• Loads your survey branding, questions, & exit-intent triggers</p>
                    <p>• Serves directly at <code className="text-emerald-300">{selectedDomain?.domain || 'example.com'}/survey</code> without displaying backend URLs</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE CUSTOMER SURVEY PREVIEW MODAL */}
      <AnimatePresence>
        {showLivePreviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Mock Browser Header */}
              <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <div className="ml-3 px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-1.5 border border-slate-700">
                    <Globe size={12} className="text-emerald-400" />
                    <span>https://{selectedDomain?.domain || 'www.example.com'}/survey</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowLivePreviewModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕ Close Preview
                </button>
              </div>

              {/* Simulated Customer Website View */}
              <div className="p-6 md:p-8 bg-slate-50 flex-1 overflow-y-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto space-y-5">
                  <div className="border-b pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">Custom Domain Active</span>
                      <h4 className="text-base font-black text-slate-900 capitalize">
                        {selectedDomain?.domain ? selectedDomain.domain.split('.')[0] : 'Customer'} Feedback Experience
                      </h4>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      Live
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <p className="text-slate-600 leading-relaxed font-medium">
                      How was your visit today? Your direct feedback helps us optimize the experience.
                    </p>

                    {/* Interactive NPS / Feedback Simulator */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 block">How likely are you to recommend us?</label>
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => notify(`Feedback score ${n}/10 simulated successfully!`, 'success')}
                            className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white font-bold text-slate-700 text-xs transition-colors"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          notify('Simulated response captured & synced to CustomerLens dashboard!', 'success');
                          setShowLivePreviewModal(false);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-500">
                  This survey interface is served natively from your custom domain with zero third-party branding.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
