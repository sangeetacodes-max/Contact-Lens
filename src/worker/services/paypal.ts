import { Env } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export class PayPalService {
  private clientId?: string;
  private clientSecret?: string;
  private baseUrl: string;

  constructor(env: Env) {
    this.clientId = env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
    // Default to sandbox unless production credentials are given
    this.baseUrl = (this.clientId && !this.clientId.includes('sandbox')) ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Fetch OAuth Access Token from PayPal REST API
   */
  async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      Logger.warn('env.PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing. Using developer token mode.');
      return 'PAYPAL_DEV_ACCESS_TOKEN';
    }

    const auth = btoa(`${this.clientId}:${this.clientSecret}`);
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errText = await response.text();
      Logger.error('PayPal token request failed', { status: response.status, error: errText });
      throw new ApiError(`PayPal Auth Error: ${errText}`, response.status, 'PAYPAL_AUTH_FAILED');
    }

    const data = await response.json() as any;
    return data.access_token;
  }

  /**
   * Create PayPal Subscription Order
   */
  async createOrder(planId: string, amount: string, currency = 'USD') {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: planId,
            description: `CustomerLens AI ${planId.toUpperCase()} Subscription`,
            amount: {
              currency_code: currency,
              value: amount
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      Logger.error('PayPal create order failed', { error: errText });
      throw new ApiError(`PayPal Create Order Error: ${errText}`, response.status, 'PAYPAL_ORDER_FAILED');
    }

    return await response.json();
  }

  /**
   * Capture PayPal Payment
   */
  async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      Logger.error('PayPal capture failed', { error: errText });
      throw new ApiError(`PayPal Capture Error: ${errText}`, response.status, 'PAYPAL_CAPTURE_FAILED');
    }

    return await response.json();
  }
}
