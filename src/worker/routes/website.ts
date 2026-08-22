import { Env } from '../types';
import { DatabaseService } from '../services/db';
import { OpenAIService } from '../services/openai';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handleWebsiteRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);
  const openai = new OpenAIService(env);

  // 1. Website Verification Endpoint (/api/website/verify)
  if (pathname === '/api/website/verify' && request.method === 'POST') {
    const { domain, method, verificationToken, siteId } = await request.json() as any;

    if (!domain) {
      throw new ApiError('Domain is required for verification', 400, 'MISSING_DOMAIN');
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    const token = verificationToken || siteId || '';
    let verified = false;
    let detailMessage = '';

    if (method === 'meta') {
      try {
        const targetUrl = `https://${cleanDomain}`;
        const res = await fetch(targetUrl, { headers: { 'User-Agent': 'CustomerLens-Verifier/1.0' } });
        if (res.ok) {
          const html = await res.text();
          if (html.includes('customerlens-site-verification') && (token ? html.includes(token) : true)) {
            verified = true;
          } else {
            detailMessage = `Meta tag customerlens-site-verification not found on ${targetUrl}`;
          }
        } else {
          detailMessage = `Could not reach ${targetUrl} (HTTP ${res.status})`;
        }
      } catch (err: any) {
        verified = false;
        detailMessage = `Connection error reaching ${cleanDomain}: ${err?.message || 'timeout'}`;
      }
    } else if (method === 'dns') {
      try {
        const dnsRes = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=TXT`);
        if (dnsRes.ok) {
          const dnsData = await dnsRes.json() as any;
          const records = dnsData.Answer || [];
          verified = records.some((r: any) => r.data && (r.data.includes('customerlens-verification') || (token && r.data.includes(token))));
          if (!verified) {
            detailMessage = `TXT record with customerlens-verification not found for ${cleanDomain}`;
          }
        } else {
          detailMessage = `DNS resolution query failed for ${cleanDomain}`;
        }
      } catch (err: any) {
        verified = false;
        detailMessage = `DNS resolution error for ${cleanDomain}: ${err?.message || 'network error'}`;
      }
    } else {
      // Snippet method
      try {
        const targetUrl = `https://${cleanDomain}`;
        const res = await fetch(targetUrl, { headers: { 'User-Agent': 'CustomerLens-Verifier/1.0' } });
        if (res.ok) {
          const html = await res.text();
          if (html.includes('customerlens.js') || html.includes('tracker.js') || (token && html.includes(token))) {
            verified = true;
          } else {
            detailMessage = `CustomerLens embed snippet not detected on ${targetUrl}`;
          }
        } else {
          detailMessage = `Could not reach ${targetUrl} (HTTP ${res.status})`;
        }
      } catch (err: any) {
        verified = false;
        detailMessage = `Connection error reaching ${cleanDomain}: ${err?.message || 'timeout'}`;
      }
    }

    if (!verified) {
      return jsonResponse({
        verified: false,
        domain: cleanDomain,
        method: method || 'snippet',
        error: detailMessage || `Verification check failed for ${cleanDomain}. Ensure tag is deployed live.`
      }, 400);
    }

    await db.setWorkspaceVerified(siteId || cleanDomain, verified, method || 'snippet');

    return jsonResponse({
      verified: true,
      domain: cleanDomain,
      method: method || 'snippet',
      verifiedAt: new Date().toISOString(),
      message: `Website ${cleanDomain} verified successfully!`
    });
  }

  // 2. Website Scanning & CRO Audit Endpoint (/api/website/scan)
  if (pathname === '/api/website/scan' && request.method === 'POST') {
    const { websiteUrl } = await request.json() as any;

    if (!websiteUrl) {
      throw new ApiError('websiteUrl is required for website scanning', 400, 'MISSING_URL');
    }

    const cleanUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    const fetchRes = await fetch(cleanUrl, { headers: { 'User-Agent': 'CustomerLens-Scanner/1.0' } });
    if (!fetchRes.ok) {
      throw new ApiError(`Unable to fetch real website content from ${cleanUrl} (HTTP ${fetchRes.status})`, 400, 'FETCH_FAILED');
    }
    const scrapedHtml = await fetchRes.text();

    const scanResult = await openai.scanWebsite(cleanUrl, scrapedHtml);

    return jsonResponse({
      websiteUrl: cleanUrl,
      scannedAt: new Date().toISOString(),
      audit: scanResult
    });
  }

  return new Response('Not Found', { status: 404 });
}
