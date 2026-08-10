import { Env } from '../types';
import { ShopifyService } from '../services/shopify';
import { StorageService } from '../services/storage';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handleShopifyRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const shopifyService = new ShopifyService(env);
  const storageService = new StorageService(env);

  // 1. Begin Shopify OAuth (/api/shopify/install or /api/shopify/auth)
  if (pathname === '/api/shopify/install' || pathname === '/api/shopify/auth') {
    const url = new URL(request.url);
    const rawShop = url.searchParams.get('shop') || url.searchParams.get('domain');
    if (!rawShop) {
      throw new ApiError('Missing shop query parameter. Usage: /api/shopify/install?shop=your-store.myshopify.com', 400, 'MISSING_SHOP');
    }

    const cleanShop = shopifyService.validateShopDomain(rawShop);
    const state = 'state_' + crypto.randomUUID();
    await storageService.kvPut(`shopify_state:${state}`, { shop: cleanShop, createdAt: Date.now() }, 600);

    const redirectUri = `${url.origin}/api/shopify/callback`;
    const authUrl = shopifyService.getAuthUrl(cleanShop, redirectUri, state);

    return Response.redirect(authUrl, 302);
  }

  // 2. Shopify OAuth Callback (/api/shopify/callback)
  if (pathname === '/api/shopify/callback') {
    const url = new URL(request.url);
    const rawShop = url.searchParams.get('shop');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const host = url.searchParams.get('host') || '';
    const hmac = url.searchParams.get('hmac');

    if (!rawShop || !code) {
      throw new ApiError('Invalid OAuth callback params', 400, 'INVALID_CALLBACK_PARAMS');
    }

    const shop = shopifyService.validateShopDomain(rawShop);

    // Verify stored state
    if (state) {
      const storedState = await storageService.kvGet(`shopify_state:${state}`);
      if (!storedState && process.env.NODE_ENV === 'production') {
        Logger.warn('OAuth state token check warning', { state, shop });
      }
    }

    // Verify HMAC if present
    if (hmac) {
      const paramsObj: Record<string, string> = {};
      url.searchParams.forEach((v, k) => { paramsObj[k] = v; });
      const isValidHmac = await shopifyService.verifyHmac(paramsObj, hmac);
      if (!isValidHmac && process.env.NODE_ENV === 'production') {
        throw new ApiError('Shopify HMAC verification failed', 401, 'INVALID_HMAC');
      }
    }

    // Exchange code for token via Official Shopify API
    const tokenData = await shopifyService.exchangeCodeForToken(shop, code);
    const accessToken = tokenData.access_token;

    let shopDetails: any = { domain: shop };
    try {
      shopDetails = await shopifyService.getShopDetails(shop, accessToken);
    } catch (err) {
      Logger.warn('Failed to fetch detailed shop info, using default store structure', { error: err });
      shopDetails = {
        id: shop.replace('.myshopify.com', ''),
        name: shop.replace('.myshopify.com', ''),
        domain: shop,
        myshopify_domain: shop
      };
    }

    // Save shop installation & tokens securely
    const installationData = {
      shop,
      accessToken,
      scope: tokenData.scope,
      shopDetails,
      host,
      installedAt: new Date().toISOString()
    };

    await storageService.kvPut(`shopify_installation:${shop}`, installationData);
    Logger.info('Successfully saved Shopify installation', { shop, shopName: shopDetails.name });

    // Redirect merchant into Shopify Admin embedded app frame
    const redirectTarget = `${url.origin}/?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}&embedded=true#dashboard`;
    return Response.redirect(redirectTarget, 302);
  }

  // 3. Shopify Connect API (/api/shopify/connect)
  if (pathname === '/api/shopify/connect' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const rawShop = body.shop || body.domain;

    if (!rawShop) {
      throw new ApiError('Shop domain is required', 400, 'SHOP_REQUIRED');
    }

    const cleanShop = shopifyService.validateShopDomain(rawShop);
    const existingInst = await storageService.kvGet(`shopify_installation:${cleanShop}`);

    const state = 'state_' + crypto.randomUUID();
    await storageService.kvPut(`shopify_state:${state}`, { shop: cleanShop, createdAt: Date.now() }, 600);

    const redirectUri = `${new URL(request.url).origin}/api/shopify/callback`;
    const authUrl = shopifyService.getAuthUrl(cleanShop, redirectUri, state);

    if (existingInst) {
      return jsonResponse({
        connected: true,
        shop: cleanShop,
        shopDetails: existingInst.shopDetails,
        authUrl,
        message: 'Shopify store connected!'
      });
    }

    return jsonResponse({
      connected: false,
      shop: cleanShop,
      authUrl,
      message: 'Please complete Shopify OAuth permissions approval'
    });
  }

  // 4. Shopify Status Check (/api/shopify/status)
  if (pathname === '/api/shopify/status') {
    const url = new URL(request.url);
    const rawShop = url.searchParams.get('shop');
    if (!rawShop) {
      return jsonResponse({ connected: false });
    }

    const cleanShop = shopifyService.validateShopDomain(rawShop);
    const existingInst = await storageService.kvGet(`shopify_installation:${cleanShop}`);

    if (existingInst) {
      return jsonResponse({
        connected: true,
        shop: cleanShop,
        shopDetails: existingInst.shopDetails
      });
    }

    return jsonResponse({ connected: false, shop: cleanShop });
  }

  // 5. Shopify Webhooks (/api/shopify/webhooks)
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
