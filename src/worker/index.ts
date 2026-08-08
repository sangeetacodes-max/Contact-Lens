import { Env } from './types';
import { handleCorsPreflight, corsHeaders } from './middleware/cors';
import { checkRateLimit } from './middleware/rateLimiter';
import { Logger } from './utils/logger';
import { errorResponse, ApiError } from './utils/errors';

import { handleAuthRoutes } from './routes/auth';
import { handleShopifyRoutes } from './routes/shopify';
import { handleWebsiteRoutes } from './routes/website';
import { handleAiRoutes } from './routes/ai';
import { handleSurveyRoutes } from './routes/surveys';
import { handleTrackingRoutes } from './routes/tracking';
import { handleAnalyticsRoutes } from './routes/analytics';
import { handleNotificationRoutes } from './routes/notifications';
import { handlePayPalRoutes } from './routes/paypal';

export default {
  async fetch(request: Request, env: Env, ctx?: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const startTime = Date.now();

    // 1. Preflight CORS
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    try {
      // 2. Rate Limiting Check
      await checkRateLimit(request, env, 120, 60);

      // 3. Logger
      Logger.info(`Worker Request: ${request.method} ${pathname}`);

      let response: Response;

      // 4. Route Dispatching
      if (pathname.startsWith('/api/auth')) {
        response = await handleAuthRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/shopify')) {
        response = await handleShopifyRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/website')) {
        response = await handleWebsiteRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/ai')) {
        response = await handleAiRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/surveys')) {
        response = await handleSurveyRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/events') || pathname === '/customerlens.js' || pathname === '/tracker.js') {
        response = await handleTrackingRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/analytics')) {
        response = await handleAnalyticsRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/notifications')) {
        response = await handleNotificationRoutes(request, env, pathname);
      } else if (pathname.startsWith('/api/paypal')) {
        response = await handlePayPalRoutes(request, env, pathname);
      } else if (pathname === '/api/health') {
        response = new Response(JSON.stringify({ status: 'ok', worker: 'CustomerLens AI Cloudflare Worker', timestamp: new Date().toISOString() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (env.ASSETS) {
        // Serve frontend SPA static assets (index.html, JS, CSS) built into ./dist
        return await env.ASSETS.fetch(request);
      } else {
        response = new Response('Not Found', { status: 404 });
      }

      // 5. Append CORS Headers to Response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));

      Logger.info(`Worker Response: ${request.method} ${pathname} [${response.status}] - ${Date.now() - startTime}ms`);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (err: any) {
      Logger.error(`Worker Exception on ${request.method} ${pathname}:`, { error: err.message || err });
      const errRes = errorResponse(err);
      const newHeaders = new Headers(errRes.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));
      return new Response(errRes.body, {
        status: errRes.status,
        headers: newHeaders
      });
    }
  }
};
