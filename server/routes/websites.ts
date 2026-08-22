import { Router } from 'express';
import { store, Website } from '../db/schema';
import { dnsVerificationService } from '../services/dnsVerification';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const websitesRouter = Router();

// GET /api/websites - List all registered websites belonging to the authenticated user/organization
websitesRouter.get('/', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const allWebsites = await store.getAllWebsites();
    const userWebsites = allWebsites.filter(
      w => w.organization_id === authUser.organizationId || w.user_id === authUser.userId
    );
    return res.json({ websites: userWebsites });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/websites - Register new website for authenticated user/organization
websitesRouter.post('/', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const { name, domain } = req.body;
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim();
    if (!cleanDomain) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    const siteId = `site_${cleanDomain.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const token = `cl_token_${Math.random().toString(36).substring(2, 12)}`;

    const newWebsite: Website = {
      id: `web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organization_id: authUser.organizationId,
      user_id: authUser.userId,
      name: name || cleanDomain,
      domain: cleanDomain,
      site_id: siteId,
      verified: false,
      verification_token: token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await store.saveWebsite(newWebsite);
    return res.status(201).json({ success: true, website: newWebsite });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/websites/:id/verify - Verify DNS or HTML snippet with strict ownership check
websitesRouter.post('/:id/verify', requireAuth, requireWebsiteOwnership('id'), async (req, res) => {
  try {
    const website = req.website!;
    const token = website.verification_token || website.site_id;

    // 1. Real DNS TXT Verification
    const dnsRes = await dnsVerificationService.verifyTxtRecord(website.domain, token);
    if (dnsRes.verified) {
      website.verified = true;
      website.verified_at = new Date().toISOString();
      await store.saveWebsite(website);
      return res.json({ success: true, verified: true, method: 'dns_txt', message: 'Domain verified successfully via DNS TXT record.' });
    }

    // 2. Real HTML script snippet verification
    const htmlRes = await dnsVerificationService.verifyHtmlSnippet(website.domain, website.site_id);
    if (htmlRes.verified) {
      website.verified = true;
      website.verified_at = new Date().toISOString();
      await store.saveWebsite(website);
      return res.json({ success: true, verified: true, method: 'tracker_ping', message: 'Domain verified successfully via live script detection.' });
    }

    return res.status(400).json({
      success: false,
      verified: false,
      error: `Verification failed. Could not verify DNS TXT record containing '${token}' or detect live script tag on https://${website.domain}.`
    });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});


