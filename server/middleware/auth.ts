import { Request, Response, NextFunction } from 'express';
import { store, Website } from '../db/schema';

export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  email?: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUser;
      website?: Website;
    }
  }
}

export function extractAuthUser(req: Request): AuthenticatedUser | null {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 1. Session Token (e.g. from local storage / preview)
  if (token && token.startsWith('cl_session_')) {
    const rawUser = decodeURIComponent(token.replace('cl_session_', '')).trim();
    if (!rawUser) return null;
    const isEmail = rawUser.includes('@');
    const userId = isEmail ? `usr_${rawUser.replace(/[^a-z0-9]/gi, '_')}` : rawUser;
    const orgId = `org_${userId}`;
    return {
      userId,
      organizationId: (req.headers['x-organization-id'] as string) || orgId,
      email: isEmail ? rawUser : undefined,
      name: isEmail ? rawUser.split('@')[0] : 'Merchant'
    };
  }

  // 2. Standard JWT token decoding
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          return null; // Expired token
        }
        const userId = payload.user_id || payload.sub || payload.uid;
        if (userId) {
          const orgId = payload.organization_id || payload.org_id || (req.headers['x-organization-id'] as string) || `org_${userId}`;
          return {
            userId,
            organizationId: orgId,
            email: payload.email,
            name: payload.name || (payload.email ? payload.email.split('@')[0] : 'User')
          };
        }
      }
    } catch {
      // Invalid JWT format
    }
  }

  // 3. Explicit HTTP Headers (x-user-id)
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId && headerUserId.trim()) {
    const trimmedId = headerUserId.trim();
    const orgId = (req.headers['x-organization-id'] as string) || `org_${trimmedId}`;
    return {
      userId: trimmedId,
      organizationId: orgId
    };
  }

  return null;
}

/**
 * Enforces authentication. Returns 401 if missing or invalid.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authUser = extractAuthUser(req);
  if (!authUser || !authUser.userId) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required. Failed authentication.'
    });
  }
  req.auth = authUser;
  next();
}

/**
 * Enforces ownership: authenticated user -> organization_id -> website_id -> data ownership.
 * Returns 403 if mismatch.
 */
export function requireWebsiteOwnership(paramKey = 'website_id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.auth;
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const websiteIdentifier = 
      (req.params[paramKey] as string) ||
      (req.query[paramKey] as string) ||
      (req.query.website_id as string) ||
      (req.query.site_id as string) ||
      (req.body[paramKey] as string) ||
      (req.body.website_id as string) ||
      (req.body.site_id as string);

    if (!websiteIdentifier) {
      return res.status(400).json({ error: 'Website identifier is required for this action.' });
    }

    try {
      const website = await store.getWebsite(websiteIdentifier);
      if (!website) {
        return res.status(404).json({ error: 'Website not found.' });
      }

      // Check ownership against organization_id or user_id
      const isOwner = 
        website.organization_id === authUser.organizationId ||
        website.user_id === authUser.userId ||
        (website.organization_id && authUser.organizationId && website.organization_id.includes(authUser.userId));

      if (!isOwner) {
        return res.status(403).json({
          error: 'Forbidden: Website ownership mismatch. You do not have permission to access or modify this website.'
        });
      }

      req.website = website;
      next();
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'Database error: Database unavailable.' });
      }
      return res.status(500).json({ error: err.message || 'Internal error checking website ownership.' });
    }
  };
}
