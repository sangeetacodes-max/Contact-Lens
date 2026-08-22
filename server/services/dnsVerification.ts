import dns from 'dns';
import { promises as dnsPromises } from 'dns';

export interface DnsVerificationResult {
  verified: boolean;
  method: 'dns_txt' | 'dns_cname' | 'html_meta' | 'tracker_ping';
  recordFound?: string;
  expectedRecord?: string;
  error?: string;
  verifiedAt?: string;
}

export class DnsVerificationService {
  /**
   * Real DNS TXT Record verification for domain ownership
   */
  async verifyTxtRecord(domain: string, expectedToken: string): Promise<DnsVerificationResult> {
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
    const expectedValue = expectedToken.startsWith('customerlens-site-verification=')
      ? expectedToken
      : `customerlens-site-verification=${expectedToken}`;

    try {
      // 1. Try Node.js native DNS resolver
      const records = await dnsPromises.resolveTxt(cleanDomain);
      const flattened = records.map(chunks => chunks.join(''));
      
      const matched = flattened.find(rec => rec.includes(expectedToken) || rec === expectedValue);
      if (matched) {
        return {
          verified: true,
          method: 'dns_txt',
          recordFound: matched,
          expectedRecord: expectedValue,
          verifiedAt: new Date().toISOString()
        };
      }
    } catch (nodeDnsErr) {
      // Fall through to DNS over HTTPS query
    }

    // 2. Query Cloudflare & Google DNS-over-HTTPS as high-reliability fallback
    try {
      const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=TXT`;
      const res = await fetch(dohUrl, {
        headers: { Accept: 'application/dns-json' }
      });
      if (res.ok) {
        const data = await res.json() as any;
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const item of data.Answer) {
            const val = (item.data || '').replace(/"/g, '');
            if (val.includes(expectedToken) || val === expectedValue) {
              return {
                verified: true,
                method: 'dns_txt',
                recordFound: val,
                expectedRecord: expectedValue,
                verifiedAt: new Date().toISOString()
              };
            }
          }
        }
      }
    } catch (dohErr) {
      // Ignore and report failure
    }

    return {
      verified: false,
      method: 'dns_txt',
      expectedRecord: expectedValue,
      error: `TXT record containing '${expectedToken}' not found on DNS for ${cleanDomain}`
    };
  }

  /**
   * Verify via live HTML script tag detection or tracker ping
   */
  async verifyHtmlSnippet(url: string, siteId: string): Promise<DnsVerificationResult> {
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const response = await fetch(fullUrl, {
        headers: { 'User-Agent': 'CustomerLens-Verifier/1.0' },
        signal: AbortSignal.timeout(6000)
      });
      if (response.ok) {
        const html = await response.text();
        if (html.includes(siteId) || html.includes('customerlens.js') || html.includes('tracker.js')) {
          return {
            verified: true,
            method: 'tracker_ping',
            verifiedAt: new Date().toISOString()
          };
        }
      }
    } catch (err: any) {
      return {
        verified: false,
        method: 'tracker_ping',
        error: `Could not fetch ${url}: ${err?.message || 'Connection timeout'}`
      };
    }

    return {
      verified: false,
      method: 'tracker_ping',
      error: `Snippet with site ID ${siteId} was not detected on ${url}`
    };
  }
}

export const dnsVerificationService = new DnsVerificationService();
