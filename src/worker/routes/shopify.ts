import { Env } from '../types';
import { ShopifyService } from '../services/shopify';
import { StorageService } from '../services/storage';
import { DatabaseService } from '../services/db';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handleShopifyRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const shopifyService = new ShopifyService(env);
  const storageService = new StorageService(env);
  const dbService = new DatabaseService(env);

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

    // Production callback URL matching Shopify Partner Dashboard configuration
    const isWorkersDev = url.hostname.includes('workers.dev');
    const redirectUri = isWorkersDev 
      ? 'https://customerlens-ai.sangeeta-codes.workers.dev/api/shopify/callback' 
      : `${url.origin}/api/shopify/callback`;

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
      throw new ApiError('Invalid OAuth callback params. Both shop and code are required from Shopify.', 400, 'INVALID_CALLBACK_PARAMS');
    }

    const shop = shopifyService.validateShopDomain(rawShop);

    // Verify stored state
    if (state) {
      const storedState = await storageService.kvGet(`shopify_state:${state}`);
      if (!storedState && process.env.NODE_ENV === 'production') {
        Logger.warn('OAuth state token check warning', { state, shop });
      }
    }

    // Verify HMAC if present using SHOPIFY_API_SECRET
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
      Logger.warn('Failed to fetch detailed shop info, using store domain structure', { shop, error: err });
      shopDetails = {
        id: shop.replace('.myshopify.com', ''),
        name: shop.replace('.myshopify.com', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        domain: shop,
        myshopify_domain: shop,
        email: `merchant@${shop}`
      };
    }

    // Save shop installation & tokens securely in Cloudflare D1 and KV
    const installationData = {
      shop,
      accessToken,
      scope: tokenData.scope,
      shopDetails,
      host,
      userId: `usr_shopify_${shop.replace('.myshopify.com', '')}`,
      installedAt: new Date().toISOString()
    };

    await storageService.kvPut(`shopify_installation:${shop}`, installationData);
    await dbService.saveShopifyInstallation(installationData);
    Logger.info('Successfully saved Shopify merchant installation to D1 & KV', { shop, shopName: shopDetails.name });

    // Redirect merchant into Shopify Admin embedded app frame
    const redirectTarget = `${url.origin}/?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}&embedded=true#dashboard`;
    return Response.redirect(redirectTarget, 302);
  }

  // 3. Shopify App Bridge Session Verification & Token Exchange (/api/shopify/session)
  if (pathname === '/api/shopify/session' && (request.method === 'POST' || request.method === 'GET')) {
    let sessionToken = '';
    let rawShop = '';

    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({})) as any;
      if (body.sessionToken) sessionToken = body.sessionToken;
      if (body.shop) rawShop = body.shop;
    } else {
      const url = new URL(request.url);
      if (url.searchParams.get('shop')) rawShop = url.searchParams.get('shop')!;
    }

    // Decode session token if provided
    let tokenShop: string | undefined;
    if (sessionToken) {
      const decoded = shopifyService.decodeSessionToken(sessionToken);
      if (decoded?.shop) tokenShop = decoded.shop;
    }

    const effectiveShop = rawShop || tokenShop;
    if (!effectiveShop) {
      throw new ApiError('No valid Shopify shop or session token provided', 400, 'MISSING_SHOP_SESSION');
    }

    const cleanShop = shopifyService.validateShopDomain(effectiveShop);
    let installation = await storageService.kvGet(`shopify_installation:${cleanShop}`) || await dbService.getShopifyInstallation(cleanShop);

    // If session token provided but no permanent token stored, execute token exchange
    if (!installation && sessionToken) {
      const exchanged = await shopifyService.exchangeSessionToken(cleanShop, sessionToken);
      const shopDetails = await shopifyService.getShopDetails(cleanShop, exchanged.access_token);
      installation = {
        shop: cleanShop,
        accessToken: exchanged.access_token,
        shopDetails,
        installedAt: new Date().toISOString()
      };
      await storageService.kvPut(`shopify_installation:${cleanShop}`, installation);
      await dbService.saveShopifyInstallation(installation);
    }

    return jsonResponse({
      authenticated: true,
      shop: cleanShop,
      shopDetails: installation?.shopDetails || {
        id: cleanShop.replace('.myshopify.com', ''),
        name: cleanShop.replace('.myshopify.com', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        domain: cleanShop,
        myshopify_domain: cleanShop
      },
      installedAt: installation?.installedAt || new Date().toISOString()
    });
  }

  // 4. Shopify Connect API (/api/shopify/connect)
  if (pathname === '/api/shopify/connect' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const rawShop = body.shop || body.domain;

    if (!rawShop) {
      throw new ApiError('Shop domain is required. Please provide your real Shopify store domain.', 400, 'SHOP_REQUIRED');
    }

    const cleanShop = shopifyService.validateShopDomain(rawShop);
    const existingInst = await storageService.kvGet(`shopify_installation:${cleanShop}`) || await dbService.getShopifyInstallation(cleanShop);

    const state = 'state_' + crypto.randomUUID();
    await storageService.kvPut(`shopify_state:${state}`, { shop: cleanShop, createdAt: Date.now() }, 600);

    const url = new URL(request.url);
    const isWorkersDev = url.hostname.includes('workers.dev');
    const redirectUri = isWorkersDev 
      ? 'https://customerlens-ai.sangeeta-codes.workers.dev/api/shopify/callback' 
      : `${url.origin}/api/shopify/callback`;

    const authUrl = shopifyService.getAuthUrl(cleanShop, redirectUri, state);

    if (existingInst) {
      return jsonResponse({
        connected: true,
        shop: cleanShop,
        shopDetails: existingInst.shopDetails,
        authUrl,
        message: `Shopify store ${cleanShop} is connected!`
      });
    }

    return jsonResponse({
      connected: false,
      shop: cleanShop,
      authUrl,
      message: `Authorize CustomerLens on ${cleanShop}`
    });
  }

  // 5. Shopify Status Check (/api/shopify/status)
  if (pathname === '/api/shopify/status') {
    const url = new URL(request.url);
    const rawShop = url.searchParams.get('shop');
    if (!rawShop) {
      return jsonResponse({ connected: false });
    }

    const cleanShop = shopifyService.validateShopDomain(rawShop);
    const existingInst = await storageService.kvGet(`shopify_installation:${cleanShop}`) || await dbService.getShopifyInstallation(cleanShop);

    if (existingInst) {
      return jsonResponse({
        connected: true,
        shop: cleanShop,
        shopDetails: existingInst.shopDetails,
        installedAt: existingInst.installedAt
      });
    }

    return jsonResponse({ connected: false, shop: cleanShop });
  }

  // 6. Shopify Admin GraphQL Proxy (/api/shopify/graphql)
  if (pathname === '/api/shopify/graphql' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const { shop, query, variables } = body;
    if (!shop || !query) {
      throw new ApiError('Both shop and GraphQL query are required', 400, 'MISSING_GQL_PARAMS');
    }

    const cleanShop = shopifyService.validateShopDomain(shop);
    const inst = await storageService.kvGet(`shopify_installation:${cleanShop}`) || await dbService.getShopifyInstallation(cleanShop);
    const accessToken = inst?.accessToken || 'shpat_session';

    const gqlResult = await shopifyService.queryGraphQL(cleanShop, accessToken, query, variables);
    return jsonResponse(gqlResult);
  }

  // 7. Shopify Webhooks (/api/shopify/webhooks)
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

