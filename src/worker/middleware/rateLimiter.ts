import { Env } from '../types';
import { ApiError } from '../utils/errors';

const memoryRateLimitStore = new Map<string, { count: number; expiresAt: number }>();

export async function checkRateLimit(request: Request, env: Env, maxRequests = 100, windowSeconds = 60): Promise<void> {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anonymous';
  const key = `ratelimit:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  if (env.KV_SESSIONS) {
    try {
      const record = await env.KV_SESSIONS.get(key, 'json');
      if (record && record.expiresAt > now) {
        if (record.count >= maxRequests) {
          throw new ApiError('Rate limit exceeded. Please try again later.', 429, 'TOO_MANY_REQUESTS');
        }
        await env.KV_SESSIONS.put(key, JSON.stringify({ count: record.count + 1, expiresAt: record.expiresAt }), { expirationTtl: windowSeconds });
      } else {
        await env.KV_SESSIONS.put(key, JSON.stringify({ count: 1, expiresAt: now + windowSeconds }), { expirationTtl: windowSeconds });
      }
      return;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
    }
  }

  // Memory fallback rate limiting
  const record = memoryRateLimitStore.get(key);
  if (record && record.expiresAt > now) {
    if (record.count >= maxRequests) {
      throw new ApiError('Rate limit exceeded. Please try again later.', 429, 'TOO_MANY_REQUESTS');
    }
    record.count++;
  } else {
    memoryRateLimitStore.set(key, { count: 1, expiresAt: now + windowSeconds });
  }
}
