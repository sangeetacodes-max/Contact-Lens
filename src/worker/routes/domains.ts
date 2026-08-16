import { Env, DomainVerificationRecord } from '../types';
import { DatabaseService } from '../services/db';
import { verifyFirebaseAuth } from '../middleware/auth';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

/**
 * Normalizes a raw input domain:
 * - Strips http://, https://
 * - Strips ports, paths, queries, hashes, trailing slashes
 * - Converts to lowercase and trims
 */
export function normalizeDomain(input: string): string {
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
 * Validates domain format strictly
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 3 || domain.length > 253) return false;
  // Domain regex accepting standard hostnames and subdomains
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
  return domainRegex.test(domain);
}

/**
 * Generates a cryptographically secure random verification token
 */
export function generateVerificationToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `cl_${hex}`;
}

/**
 * Performs a real DNS TXT query using DNS-over-HTTPS (DoH)
 * Compatible with Cloudflare Workers runtime (fetch API)
 */
export async function queryDnsTxtRecords(domain: string): Promise<string[]> {
  const cleanDomain = normalizeDomain(domain);
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
      const data = await cfRes.json() as any;
      if (data.Answer && Array.isArray(data.Answer)) {
        for (const ans of data.Answer) {
          if (ans.data) {
            // Strip surrounding escaped quotes: "\"customerlens-verification=cl_...\""
            const cleaned = String(ans.data).replace(/^"|"$/g, '').replace(/\\"/g, '"').trim();
            records.push(cleaned);
          }
        }
      }
    }
  } catch (err: any) {
    Logger.warn('Cloudflare DoH query error:', { domain: cleanDomain, error: err.message });
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
        const data = await gRes.json() as any;
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
      Logger.warn('Google DoH query error:', { domain: cleanDomain, error: err.message });
    }
  }

  return records;
}

export async function handleDomainRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);
  const user = await verifyFirebaseAuth(request, env);
  const userId = user.uid || user.id;

  // 1. Generate or Retrieve Verification Record (POST /api/domains/token or POST /api/domains/generate)
  if ((pathname === '/api/domains/token' || pathname === '/api/domains/generate') && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const rawDomain = body.domain || body.websiteUrl;

    if (!rawDomain) {
      throw new ApiError('Domain is required for verification setup', 400, 'MISSING_DOMAIN');
    }

    const domain = normalizeDomain(rawDomain);
    if (!isValidDomain(domain)) {
      throw new ApiError(`Invalid domain format: "${rawDomain}". Please enter a valid domain (e.g. example.com or app.example.com).`, 400, 'INVALID_DOMAIN');
    }

    // Check if user already has a record for this domain
    let record = await db.getDomainVerification(userId, domain);

    if (!record) {
      const token = generateVerificationToken();
      record = {
        id: `dv_${userId}_${domain}`,
        userId,
        domain,
        token,
        txtRecordValue: `customerlens-verification=${token}`,
        verified: false,
        verifiedAt: null,
        createdAt: new Date().toISOString()
      };
      await db.saveDomainVerification(record);
      Logger.info('Generated new DNS TXT verification token', { domain, userId });
    }

    return jsonResponse({
      success: true,
      record,
      instructions: {
        type: 'TXT',
        host: '@',
        domain,
        value: record.txtRecordValue,
        description: `Add a DNS TXT record with Host "@" and Value "${record.txtRecordValue}" in your domain's DNS management panel (Cloudflare, GoDaddy, Namecheap, Google Domains/Squarespace, etc.).`
      }
    });
  }

  // 2. Verify Domain via Real DNS TXT Lookup (POST /api/domains/verify)
  if (pathname === '/api/domains/verify' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const rawDomain = body.domain || body.websiteUrl;

    if (!rawDomain) {
      throw new ApiError('Domain is required for DNS verification', 400, 'MISSING_DOMAIN');
    }

    const domain = normalizeDomain(rawDomain);
    if (!isValidDomain(domain)) {
      throw new ApiError(`Invalid domain format: "${rawDomain}".`, 400, 'INVALID_DOMAIN');
    }

    let record = await db.getDomainVerification(userId, domain);
    if (!record) {
      // Auto-generate token if not already generated
      const token = generateVerificationToken();
      record = {
        id: `dv_${userId}_${domain}`,
        userId,
        domain,
        token,
        txtRecordValue: `customerlens-verification=${token}`,
        verified: false,
        verifiedAt: null,
        createdAt: new Date().toISOString()
      };
      await db.saveDomainVerification(record);
    }

    const expectedToken = record.token;
    const expectedRecordValue = `customerlens-verification=${expectedToken}`;

    // Perform REAL DNS TXT Lookups
    Logger.info('Starting real DNS TXT verification lookup', { domain, userId });
    const dnsRecords = await queryDnsTxtRecords(domain);

    // Also check apex domain if subdomain was provided or vice versa for flexibility
    let apexRecords: string[] = [];
    if (domain.startsWith('www.')) {
      const apex = domain.substring(4);
      apexRecords = await queryDnsTxtRecords(apex);
    }

    const allRecords = [...dnsRecords, ...apexRecords];
    Logger.info('Retrieved DNS TXT records from resolvers', { domain, count: allRecords.length });

    // Strict validation: Check if exact verification token exists in TXT records
    const isTokenFound = allRecords.some(rec => {
      const trimmed = rec.trim();
      return (
        trimmed === expectedRecordValue ||
        trimmed === expectedToken ||
        trimmed.toLowerCase() === expectedRecordValue.toLowerCase() ||
        trimmed.includes(expectedRecordValue)
      );
    });

    const now = new Date().toISOString();

    if (isTokenFound) {
      record.verified = true;
      record.verifiedAt = now;
      record.lastCheckedAt = now;
      record.errorMessage = undefined;
      await db.saveDomainVerification(record);

      // Also mark workspace verified if matched
      await db.setWorkspaceVerified(domain, true, 'dns_txt');

      Logger.info('Domain verified successfully via DNS TXT', { domain, userId });

      return jsonResponse({
        success: true,
        verified: true,
        domain,
        verifiedAt: now,
        message: `✓ Domain ${domain} verified successfully via DNS TXT record!`,
        record
      });
    } else {
      // DNS record not propagated or missing
      record.lastCheckedAt = now;
      record.errorMessage = "We couldn't find the verification record yet. DNS changes can take some time to propagate. Check again later.";
      await db.saveDomainVerification(record);

      Logger.info('DNS TXT record not found for domain', { domain, foundCount: allRecords.length });

      return jsonResponse({
        success: false,
        verified: false,
        domain,
        propagated: false,
        message: "We couldn't find the verification record yet. DNS changes can take some time to propagate. Check again later.",
        expectedRecord: expectedRecordValue,
        record
      });
    }
  }

  // 3. List User Domains (GET /api/domains) OR Get Single Domain (GET /api/domains/:domain)
  if (pathname === '/api/domains' && request.method === 'GET') {
    const records = await db.getDomainVerificationsByUser(userId);
    return jsonResponse({
      success: true,
      records
    });
  }

  // 3b. Get specific domain (GET /api/domains/:domain)
  if (pathname.startsWith('/api/domains/') && request.method === 'GET' && pathname !== '/api/domains/token' && pathname !== '/api/domains/generate' && pathname !== '/api/domains/verify') {
    const rawDomain = decodeURIComponent(pathname.replace('/api/domains/', ''));
    const domain = normalizeDomain(rawDomain);
    
    if (!domain) {
      throw new ApiError('Invalid domain specified in path', 400, 'INVALID_DOMAIN');
    }

    const record = await db.getDomainVerification(userId, domain);
    if (!record) {
      throw new ApiError(`Domain verification record not found for "${domain}"`, 404, 'NOT_FOUND');
    }

    return jsonResponse({
      success: true,
      record
    });
  }

  // 4. Delete / Remove Domain (DELETE /api/domains or DELETE /api/domains/:domain)
  if ((pathname === '/api/domains' || pathname.startsWith('/api/domains/')) && request.method === 'DELETE') {
    let domainToDelete = '';

    if (pathname.startsWith('/api/domains/') && pathname !== '/api/domains') {
      const rawDomain = decodeURIComponent(pathname.replace('/api/domains/', ''));
      domainToDelete = normalizeDomain(rawDomain);
    }

    if (!domainToDelete) {
      const url = new URL(request.url);
      const domainQuery = url.searchParams.get('domain');
      if (domainQuery) {
        domainToDelete = normalizeDomain(domainQuery);
      }
    }

    if (!domainToDelete) {
      const body = await request.json().catch(() => ({})) as any;
      if (body.domain) {
        domainToDelete = normalizeDomain(body.domain);
      }
    }

    if (!domainToDelete) {
      throw new ApiError('Domain is required to delete verification record', 400, 'MISSING_DOMAIN');
    }

    // Verify record exists and belongs to user before deleting
    const existing = await db.getDomainVerification(userId, domainToDelete);
    if (!existing) {
      throw new ApiError(`Domain verification record for "${domainToDelete}" not found for this user`, 404, 'NOT_FOUND');
    }

    await db.deleteDomainVerification(userId, domainToDelete);
    // Explicitly revoke verification on workspace
    await db.setWorkspaceVerified(domainToDelete, false, 'unverified');
    
    Logger.info('Removed and revoked domain verification record', { domain: domainToDelete, userId });

    return jsonResponse({
      success: true,
      domain: domainToDelete,
      revoked: true,
      message: `Domain ${domainToDelete} removed and verification revoked successfully.`
    });
  }

  return new Response('Not Found', { status: 404 });
}
