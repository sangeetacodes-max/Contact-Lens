import { Env } from '../types';
import { ShopifyService } from '../services/shopify';
import { StorageService } from '../services/storage';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handleShopifyRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const shopifyService = new ShopifyService(env);
  const storageService = new StorageService(env);

  // 1. Begin Shopify OAuth (/api/shopify/auth)
  if (pathname === '/api/shopify/auth') {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');
    if (!shop) {
      throw new ApiError('Missing shop query parameter', 400, 'MISSING_SHOP');
    }

    const state = 'state_' + crypto.randomUUID();
    await storageService.kvPut(`shopify_state:${state}`, { shop, createdAt: Date.now() }, 600);

    const redirectUri = `${url.origin}/api/shopify/callback`;
    const authUrl = shopifyService.getAuthUrl(shop, redirectUri, state);

    return Response.redirect(authUrl, 302);
  }

  // 2. Shopify OAuth Callback (/api/shopify/callback)
  if (pathname === '/api/shopify/callback') {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const hmac = url.searchParams.get('hmac');

    if (!shop || !code || !state) {
      throw new ApiError('Invalid OAuth callback params', 400, 'INVALID_CALLBACK_PARAMS');
    }

    // Verify stored state
    const storedState = await storageService.kvGet(`shopify_state:${state}`);
    if (!storedState && process.env.NODE_ENV === 'production') {
      throw new ApiError('Invalid or expired OAuth state token', 400, 'INVALID_OAUTH_STATE');
    }

    // Verify HMAC if present
    if (hmac) {
      const paramsObj: Record<string, string> = {};
      url.searchParams.forEach((v, k) => { paramsObj[k] = v; });
      const isValidHmac = await shopifyService.verifyHmac(paramsObj, hmac);
      if (!isValidHmac) {
        throw new ApiError('Shopify HMAC verification failed', 401, 'INVALID_HMAC');
      }
    }

    // Exchange code for token via Official Shopify API
    const tokenData = await shopifyService.exchangeCodeForToken(shop, code);
    const shopDetails = await shopifyService.getShopDetails(shop, tokenData.access_token);

    Logger.info('Successfully connected Shopify store', { shop, shopName: shopDetails.name });

    return jsonResponse({
      connected: true,
      shop,
      shopDetails,
      message: `Shopify store ${shopDetails.name || shop} connected successfully!`
    });
  }

  // 3. Shopify Webhooks (/api/shopify/webhooks)
  if (pathname === '/api/shopify/webhooks' && request.method === 'POST') {
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
    const topic = request.headers.get('X-Shopify-Topic') || 'general';
    const shop = request.headers.get('X-Shopify-Shop-Domain') || 'unknown';

    const bodyText = await request.text();
    Logger.info(`Received Shopify webhook: ${topic} from ${shop}`);

    return jsonResponse({ received: true, topic, shop });
  }

  return new Response('Not Found', { status: 404 });
}
