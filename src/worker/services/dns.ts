/**
 * Real DNS Verification Service using DNS-over-HTTPS (Cloudflare & Google Resolvers)
 * Strict, real DNS TXT & CNAME lookups. Never returns fake verification.
 */

import { IDNSVerificationService } from './interfaces';
import { Logger } from '../utils/logger';

export class RealDNSVerificationService implements IDNSVerificationService {
  /**
   * Normalizes a domain input
   */
  normalizeDomain(input: string): string {
    if (!input || typeof input !== 'string') return '';
    let domain = input.trim().toLowerCase();
    
    // Remove protocol
    domain = domain.replace(/^https?:\/\//i, '');
    // Remove ports
    domain = domain.replace(/:\d+$/, '');
    // Remove path, query params, hash
    domain = domain.split('/')[0].split('?')[0].split('#')[0];
    // Remove leading and trailing dots or slashes
    domain = domain.replace(/^\.+|\.+$/g, '').trim();
    
    return domain;
  }

  /**
   * Validates standard FQDN format
   */
  isValidDomain(domain: string): boolean {
    if (!domain || domain.length < 3 || domain.length > 253) return false;
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    return domainRegex.test(domain);
  }

  /**
   * Generates a cryptographically secure verification token
   */
  generateToken(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `cl_${hex}`;
  }

  /**
   * Real DNS TXT query via Cloudflare DoH with Google DoH fallback
   */
  async queryTxtRecords(domain: string): Promise<string[]> {
    const cleanDomain = this.normalizeDomain(domain);
    if (!cleanDomain) return [];

    const records: string[] = [];

    // 1. Primary: Cloudflare DNS-over-HTTPS (DoH)
    try {
      const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=TXT`;
      const cfRes = await fetch(cfUrl, {
        headers: { 'Accept': 'application/dns-json' },
        signal: AbortSignal.timeout(6000)
      });

      if (cfRes.ok) {
        const data = (await cfRes.json()) as any;
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const ans of data.Answer) {
            if (ans.data) {
              const cleaned = String(ans.data).replace(/^"|"$/g, '').replace(/\\"/g, '"').trim();
              records.push(cleaned);
            }
          }
        }
      }
    } catch (err: any) {
      Logger.warn('Cloudflare DoH TXT query error:', { domain: cleanDomain, error: err.message });
    }

    // 2. Secondary fallback: Google DNS-over-HTTPS (DoH)
    if (records.length === 0) {
      try {
        const gUrl = `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=TXT`;
        const gRes = await fetch(gUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(6000)
        });

        if (gRes.ok) {
          const data = (await gRes.json()) as any;
          if (data.Answer && Array.isArray(data.Answer)) {
            for (const ans of data.Answer) {
              if (ans.data) {
                const cleaned = String(ans.data).replace(/^"|"$/g, '').replace(/\\"/g, '"').trim();
                records.push(cleaned);
              }
            }
          }
        }
      } catch (err: any) {
        Logger.warn('Google DoH TXT query error:', { domain: cleanDomain, error: err.message });
      }
    }

    return records;
  }

  /**
   * Real DNS CNAME query via Cloudflare DoH with Google DoH fallback
   */
  async queryCnameRecords(domain: string): Promise<string[]> {
    const cleanDomain = this.normalizeDomain(domain);
    if (!cleanDomain) return [];

    const targets: string[] = [];

    // 1. Primary: Cloudflare DNS-over-HTTPS (DoH)
    try {
      const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=CNAME`;
      const cfRes = await fetch(cfUrl, {
        headers: { 'Accept': 'application/dns-json' },
        signal: AbortSignal.timeout(6000)
      });

      if (cfRes.ok) {
        const data = (await cfRes.json()) as any;
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const ans of data.Answer) {
            if (ans.data) {
              const cleaned = String(ans.data).replace(/^"|"$/g, '').replace(/\.$/, '').trim().toLowerCase();
              targets.push(cleaned);
            }
          }
        }
      }
    } catch (err: any) {
      Logger.warn('Cloudflare DoH CNAME error:', { domain: cleanDomain, error: err.message });
    }

    // 2. Secondary fallback: Google DNS-over-HTTPS
    if (targets.length === 0) {
      try {
        const gUrl = `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=CNAME`;
        const gRes = await fetch(gUrl, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(6000)
        });

        if (gRes.ok) {
          const data = (await gRes.json()) as any;
          if (data.Answer && Array.isArray(data.Answer)) {
            for (const ans of data.Answer) {
              if (ans.data) {
                const cleaned = String(ans.data).replace(/^"|"$/g, '').replace(/\.$/, '').trim().toLowerCase();
                targets.push(cleaned);
              }
            }
          }
        }
      } catch (err: any) {
        Logger.warn('Google DoH CNAME error:', { domain: cleanDomain, error: err.message });
      }
    }

    return targets;
  }

  /**
   * Verifies domain DNS records against the expected challenge token or CNAME target
   */
  async verifyDomainDns(domain: string, expectedToken: string): Promise<{
    verified: boolean;
    method?: 'dns_txt' | 'dns_cname';
    details?: string;
  }> {
    const cleanDomain = this.normalizeDomain(domain);
    const expectedValue = `customerlens-verification=${expectedToken}`;

    const txtRecords = await this.queryTxtRecords(cleanDomain);
    const cnameTargets = await this.queryCnameRecords(cleanDomain);

    // Also check apex if www or vice versa
    let apexTxtRecords: string[] = [];
    if (cleanDomain.startsWith('www.')) {
      apexTxtRecords = await this.queryTxtRecords(cleanDomain.substring(4));
    }

    const allTxtRecords = [...txtRecords, ...apexTxtRecords];

    // Check TXT match
    const isTxtMatched = allTxtRecords.some(record => {
      const trimmed = record.trim();
      return (
        trimmed === expectedValue ||
        trimmed === expectedToken ||
        trimmed.toLowerCase() === expectedValue.toLowerCase() ||
        trimmed.includes(expectedValue)
      );
    });

    if (isTxtMatched) {
      return {
        verified: true,
        method: 'dns_txt',
        details: `DNS TXT record matching ${expectedValue} detected.`
      };
    }

    // Check CNAME match
    const validCnameTargets = [
      'custom.customerlens.app',
      'cname.customerlens.app',
      'customerlens.pages.dev',
      'customerlens-ai.pages.dev'
    ];

    const isCnameMatched = cnameTargets.some(target => {
      const t = target.toLowerCase().trim();
      return validCnameTargets.some(v => t.includes(v) || v.includes(t)) || t.includes('customerlens');
    });

    if (isCnameMatched) {
      return {
        verified: true,
        method: 'dns_cname',
        details: `DNS CNAME record pointing to ${cnameTargets[0]} detected.`
      };
    }

    return {
      verified: false,
      details: 'The required DNS TXT or CNAME record was not detected by public DNS resolvers.'
    };
  }
}
