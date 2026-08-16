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
  ChevronUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authenticatedFetch } from '../lib/firebase';
import { DomainVerificationRecord } from '../types';

interface WebsiteVerificationProps {
  initialDomain?: string;
  onVerificationSuccess?: (domain: string) => void;
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function WebsiteVerification({
  initialDomain = '',
  onVerificationSuccess,
  showNotification
}: WebsiteVerificationProps) {
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainVerificationRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainVerificationRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showProviderGuide, setShowProviderGuide] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'cloudflare' | 'godaddy' | 'namecheap' | 'google' | 'route53'>('cloudflare');
  const [verificationFeedback, setVerificationFeedback] = useState<{
    domain: string;
    status: 'success' | 'pending' | 'error';
    message: string;
  } | null>(null);

  // Normalize domain in client UI
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

  // Fetch all domain verifications for current authenticated user
  const fetchDomains = async () => {
    try {
      const res = await authenticatedFetch('/api/domains');
      if (res.ok) {
        const data = await res.json();
        if (data.records) {
          setDomains(data.records);
          if (data.records.length > 0 && !selectedDomain) {
            setSelectedDomain(data.records[0]);
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

  // Copy helper with animated feedback
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    notify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Generate Verification Token for domain
  const handleGenerateRecord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDomain = normalizeClientDomain(domainInput);

    if (!cleanDomain) {
      notify('Please enter a valid website domain name (e.g., example.com)', 'error');
      return;
    }

    if (!cleanDomain.includes('.') || cleanDomain.length < 4) {
      notify('Please enter a valid domain with a top-level extension (e.g., example.com)', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authenticatedFetch('/api/domains/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain })
      });

      const data = await res.json();
      if (res.ok && data.success && data.record) {
        setSelectedDomain(data.record);
        setDomainInput('');
        await fetchDomains();
        notify(`Verification record generated for ${cleanDomain}!`, 'success');
      } else {
        notify(data.error || data.message || 'Failed to generate verification record', 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Network error while generating token', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Perform Real DNS TXT Lookup
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

      if (res.ok && data.verified) {
        setVerificationFeedback({
          domain,
          status: 'success',
          message: `✓ Domain ${domain} verified successfully via DNS TXT record!`
        });
        notify(`✓ Website ${domain} ownership verified!`, 'success');
        if (onVerificationSuccess) {
          onVerificationSuccess(domain);
        }
      } else {
        setVerificationFeedback({
          domain,
          status: 'pending',
          message: data.message || "We couldn't find the verification record yet. DNS changes can take some time to propagate. Check again later."
        });
        notify("DNS record not detected yet. Please allow time for DNS propagation.", 'info');
      }

      await fetchDomains();
      if (data.record) {
        setSelectedDomain(data.record);
      }
    } catch (err: any) {
      setVerificationFeedback({
        domain,
        status: 'error',
        message: err.message || 'DNS verification request failed.'
      });
      notify(err.message || 'Failed to query DNS records', 'error');
    } finally {
      setVerifyingDomain(null);
    }
  };

  // 3. Delete domain verification
  const handleDeleteDomain = async (domain: string) => {
    if (!confirm(`Are you sure you want to remove ${domain} from your verified domains?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/domains?domain=${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        notify(`Domain ${domain} removed.`, 'info');
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
        'Log in to your Cloudflare Dashboard and select your domain.',
        'Click on the "DNS" -> "Records" tab in the left sidebar.',
        'Click "+ Add record".',
        'Set Type to "TXT".',
        'Set Name to "@" (or your specific subdomain).',
        'Set Content to the verification value below.',
        'Set TTL to "Auto" and click "Save".'
      ]
    },
    godaddy: {
      name: 'GoDaddy',
      steps: [
        'Log in to your GoDaddy Domain Portfolio.',
        'Select your domain and go to "DNS" settings.',
        'Click "Add New Record".',
        'Select "TXT" from the Type dropdown.',
        'Enter "@" in the Name field.',
        'Paste the verification value in the Value field.',
        'Set TTL to 1/2 hour (or Default) and click "Save".'
      ]
    },
    namecheap: {
      name: 'Namecheap',
      steps: [
        'Log in to your Namecheap account and go to Domain List.',
        'Click "Manage" next to your domain, then click the "Advanced DNS" tab.',
        'Click "ADD NEW RECORD" in the Host Records section.',
        'Select "TXT Record" as the type.',
        'Enter "@" for Host, paste the value in Value, and set TTL to Automatic.',
        'Click the green checkmark (Save Changes).'
      ]
    },
    google: {
      name: 'Google Domains / Squarespace',
      steps: [
        'Log in to your DNS management console.',
        'Navigate to the Custom DNS Records section.',
        'Click "Create new record".',
        'Set Host name to "@", Type to "TXT", TTL to 300 (or default).',
        'Paste the verification value in the Data/Value field and click "Save".'
      ]
    },
    route53: {
      name: 'AWS Route 53',
      steps: [
        'Open AWS Route 53 Console and choose Hosted Zones.',
        'Select your domain name hosted zone.',
        'Click "Create record".',
        'Leave Record name blank (or enter subdomain).',
        'Choose Record type: "TXT".',
        'Paste the verification token value (surrounded by quotes if required) in the Value field.',
        'Click "Create records".'
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Website Ownership Verification (DNS TXT)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Verify that you own or manage your website by adding a standard DNS TXT record. 
              Once verified, CustomerLens activates automated analytics, AI exit-intent intelligence, and conversion tracking without requiring Shopify store registration.
            </p>
          </div>
        </div>
      </div>

      {/* Domain Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Globe size={16} className="text-indigo-600" />
          Add Website Domain to Verify
        </h3>
        
        <form onSubmit={handleGenerateRecord} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-grow">
              <input
                id="input_verify_website_domain"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="example.com (or www.mystore.com)"
                className="w-full pl-3 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
              {domainInput && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                  Clean: {normalizeClientDomain(domainInput)}
                </span>
              )}
            </div>
            <button
              id="btn_generate_dns_record"
              type="submit"
              disabled={loading || !domainInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  Generate Verification Record
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info size={13} className="text-slate-400 shrink-0" />
            Enter your root domain or subdomain. Protocols like <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">https://</code> and paths will be normalized automatically.
          </p>
        </form>
      </div>

      {/* Active Selected Domain Verification Panel */}
      {selectedDomain && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6"
        >
          {/* Domain Status Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Target Domain</span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="text-base font-bold text-slate-900 font-mono">{selectedDomain.domain}</span>
                {selectedDomain.verified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={13} />
                    Website verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock size={13} />
                    Pending DNS Verification
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id={`btn_verify_dns_${selectedDomain.domain}`}
                onClick={() => handleVerifyDns(selectedDomain)}
                disabled={verifyingDomain === selectedDomain.domain}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                  selectedDomain.verified 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <RefreshCw size={13} className={verifyingDomain === selectedDomain.domain ? 'animate-spin' : ''} />
                {verifyingDomain === selectedDomain.domain 
                  ? 'Querying DNS TXT Records...' 
                  : selectedDomain.verified 
                    ? 'Re-check DNS Status' 
                    : 'Verify DNS Record Now'}
              </button>

              <button
                onClick={() => handleDeleteDomain(selectedDomain.domain)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Remove domain"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Verification Feedback Banner */}
          {verificationFeedback && verificationFeedback.domain === selectedDomain.domain && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
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
                    Tip: DNS changes usually propagate within 1–15 minutes, but can take up to 24 hours depending on your DNS host's TTL settings. You can click "Verify DNS Record Now" again at any time.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* DNS TXT Record Specification Box */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Server size={14} className="text-indigo-600" />
                Add the following DNS TXT record to your domain:
              </span>
              <button
                onClick={() => handleCopy(
                  `Type: TXT\nHost/Name: @\nValue: ${selectedDomain.txtRecordValue}`,
                  'all'
                )}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                {copiedField === 'all' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                {copiedField === 'all' ? 'Copied all details!' : 'Copy full record'}
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-3 shadow-inner">
              {/* Row 1: Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Record Type:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">TXT</span>
                  <button
                    onClick={() => handleCopy('TXT', 'type')}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                    title="Copy record type"
                  >
                    {copiedField === 'type' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Row 2: Host / Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Host / Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">@</span>
                  <span className="text-[10px] text-slate-400 font-sans">(or leave blank if your provider does not support @)</span>
                  <button
                    onClick={() => handleCopy('@', 'host')}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                    title="Copy host"
                  >
                    {copiedField === 'host' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Row 3: Value / TXT Content */}
              <div className="flex flex-col gap-1.5 pt-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider">TXT Value / Content:</span>
                  <button
                    onClick={() => handleCopy(selectedDomain.txtRecordValue, 'value')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans font-medium"
                  >
                    {copiedField === 'value' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedField === 'value' ? 'Copied value' : 'Copy value'}
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-indigo-300 font-bold break-all select-all flex items-center justify-between gap-2">
                  <span>{selectedDomain.txtRecordValue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Provider Step-by-Step Instructions Toggle */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowProviderGuide(!showProviderGuide)}
              className="w-full bg-slate-50 hover:bg-slate-100 p-3.5 text-left text-xs font-bold text-slate-800 flex justify-between items-center transition-colors"
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={15} className="text-indigo-600" />
                Step-by-Step DNS Setup Guide by Provider
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
                  {/* Provider Tabs */}
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

                  {/* Active Provider Steps */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Instructions for {providerInstructions[activeProvider].name}:
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
      )}

      {/* Managed Domains Table */}
      {domains.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Your Registered Domains ({domains.length})</h3>
            <button
              onClick={fetchDomains}
              className="text-slate-400 hover:text-slate-700 text-xs font-medium flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Refresh list
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="pb-2.5">Domain</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Verification Token</th>
                  <th className="pb-2.5">Created</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {domains.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {rec.domain}
                    </td>
                    <td className="py-3">
                      {rec.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={11} />
                          Pending DNS
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500 max-w-[180px] truncate">
                      {rec.token}
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDomain(rec)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px]"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleVerifyDns(rec)}
                        disabled={verifyingDomain === rec.domain}
                        className="text-slate-600 hover:text-indigo-600 font-semibold text-[11px]"
                      >
                        {verifyingDomain === rec.domain ? 'Checking...' : 'Verify DNS'}
                      </button>
                      <button
                        onClick={() => handleDeleteDomain(rec.domain)}
                        className="text-slate-400 hover:text-rose-600 font-semibold text-[11px]"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
