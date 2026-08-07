import { Env } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export class ShopifyService {
  private apiKey?: string;
  private apiSecret?: string;

  constructor(env: Env) {
    this.apiKey = env.SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY;
    this.apiSecret = env.SHOPIFY_API_SECRET || process.env.SHOPIFY_API_SECRET;
  }

  /** Validate myshopify.com domain format */
  validateShopDomain(shop: string): string {
    if (!shop) {
      throw new ApiError('Shop parameter is required', 400, 'INVALID_SHOP');
    }
    const cleanShop = shop.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanShop.endsWith('.myshopify.com') && !/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(cleanShop)) {
      throw new ApiError('Invalid Shopify shop domain', 400, 'INVALID_SHOP_DOMAIN');
    }
    return cleanShop.endsWith('.myshopify.com') ? cleanShop : `${cleanShop}.myshopify.com`;
  }

  /** Generate Shopify OAuth Authorization URL */
  getAuthUrl(shop: string, redirectUri: string, state: string): string {
    if (!this.apiKey) {
      throw new ApiError('env.SHOPIFY_API_KEY is not configured', 500, 'SHOPIFY_KEY_MISSING');
    }
    const cleanShop = this.validateShopDomain(shop);
    const scopes = 'read_products,read_orders,read_customers,read_themes,write_script_tags';
    return `https://${cleanShop}/admin/oauth/authorize?client_id=${this.apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  /** Verify Shopify HMAC signature on OAuth Callback or Webhook */
  async verifyHmac(params: Record<string, string>, hmac: string): Promise<boolean> {
    if (!this.apiSecret) return true; // Fallback in dev

    const message = Object.keys(params)
      .filter(k => k !== 'hmac' && k !== 'signature')
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&');

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.apiSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    const hashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === hmac;
  }

  /** Exchange Authorization Code for Permanent Access Token via Official Shopify API */
  async exchangeCodeForToken(shop: string, code: string): Promise<{ access_token: string; scope: string }> {
    if (!this.apiKey || !this.apiSecret) {
      throw new ApiError('Shopify API Credentials missing', 500, 'SHOPIFY_CONFIG_ERROR');
    }

    const cleanShop = this.validateShopDomain(shop);
    const url = `https://${cleanShop}/admin/oauth/access_token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        code
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      Logger.error('Shopify token exchange failed', { status: response.status, error: errText });
      throw new ApiError(`Shopify OAuth exchange error: ${errText}`, 400, 'SHOPIFY_OAUTH_FAILED');
    }

    return await response.json();
  }

  /** Fetch Shop Details from Shopify REST Admin API */
  async getShopDetails(shop: string, accessToken: string) {
    const cleanShop = this.validateShopDomain(shop);
    const url = `https://${cleanShop}/admin/api/2024-01/shop.json`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new ApiError('Failed to fetch Shopify shop details', response.status, 'SHOPIFY_FETCH_FAILED');
    }

    const data = await response.json() as any;
    return data.shop;
  }
}
