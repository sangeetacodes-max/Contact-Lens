import { Env } from '../types';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';
import { DatabaseService } from './db';

export interface CreateOrderParams {
  planId: string;
  amount: string;
  currency?: string;
  userId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CaptureOrderResult {
  id: string;
  order_id: string;
  status: string;
  captureId?: string;
  planId?: string;
  amount?: string;
  currency?: string;
  payerEmail?: string;
  payerId?: string;
  payerName?: string;
  capturedAt: string;
  details?: any;
}

export class PayPalService {
  private clientId?: string;
  private clientSecret?: string;
  private isSandbox: boolean;
  private baseUrl: string;
  private webhookId?: string;
  private db: DatabaseService;

  constructor(env: Env) {
    this.clientId = env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
    
    // Explicit environment configuration: defaults to production unless PAYPAL_ENV is 'sandbox' or client id starts with sandbox indicator
    const envSetting = (env.PAYPAL_ENV || process.env.PAYPAL_ENV || '').toLowerCase().trim();
    this.isSandbox = envSetting === 'sandbox' || (!!this.clientId && this.clientId.toLowerCase().includes('sandbox'));
    this.baseUrl = this.isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    this.webhookId = env.PAYPAL_WEBHOOK_ID || process.env.PAYPAL_WEBHOOK_ID;
    this.db = new DatabaseService(env);
  }

  /**
   * Check if PayPal is configured with credentials
   */
  isConfigured(): boolean {
    return Boolean(
      this.clientId && 
      this.clientSecret && 
      this.clientId.trim() !== '' && 
      this.clientSecret.trim() !== '' &&
      !this.clientId.includes('your-paypal') &&
      !this.clientSecret.includes('your-paypal')
    );
  }

  /**
   * Public configuration for frontend PayPal SDK
   */
  getPublicConfig() {
    return {
      configured: this.isConfigured(),
      clientId: this.isConfigured() ? this.clientId : null,
      environment: this.isSandbox ? 'sandbox' : 'production',
      currency: 'USD'
    };
  }

  /**
   * Fetch OAuth 2.0 Access Token from PayPal REST API using Client ID & Secret
   */
  async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new ApiError(
        'PayPal API credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
        500,
        'PAYPAL_CREDENTIALS_MISSING'
      );
    }

    try {
      // Basic Auth Header using btoa / Buffer
      const auth = typeof Buffer !== 'undefined'
        ? Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
        : btoa(`${this.clientId}:${this.clientSecret}`);

      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error('PayPal OAuth token request failed', { status: response.status, error: errorText });
        throw new ApiError(
          `Failed to authenticate with PayPal API (${response.status}): ${errorText}`,
          response.status >= 500 ? 502 : 400,
          'PAYPAL_AUTH_FAILED'
        );
      }

      const tokenData = await response.json() as { access_token?: string; token_type?: string; expires_in?: number };
      if (!tokenData.access_token) {
        throw new ApiError('PayPal OAuth response missing access_token', 502, 'PAYPAL_INVALID_TOKEN_RESPONSE');
      }

      return tokenData.access_token;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      Logger.error('PayPal OAuth network error', { error: err?.message || String(err) });
      throw new ApiError(
        `Unable to reach PayPal authentication service: ${err?.message || 'Network error'}`,
        503,
        'PAYPAL_NETWORK_ERROR'
      );
    }
  }

  /**
   * Create a REAL PayPal Order using Orders v2 API (POST /v2/checkout/orders)
   */
  async createOrder(params: CreateOrderParams) {
    const { planId, amount, currency = 'USD', userId, returnUrl, cancelUrl } = params;

    // Validate amount format (e.g. 29.00)
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new ApiError('Invalid payment amount specified.', 400, 'INVALID_AMOUNT');
    }
    const formattedAmount = numericAmount.toFixed(2);

    const accessToken = await this.getAccessToken();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: planId || 'growth',
          description: `CustomerLens AI ${planId ? planId.toUpperCase() : 'PRO'} Plan Subscription`,
          custom_id: JSON.stringify({
            userId: userId || '',
            planId: planId || 'growth',
            createdAt: new Date().toISOString()
          }),
          amount: {
            currency_code: currency,
            value: formattedAmount
          }
        }
      ],
      application_context: {
        brand_name: 'CustomerLens AI',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: returnUrl || 'https://customerlens.ai/checkout/success',
        cancel_url: cancelUrl || 'https://customerlens.ai/checkout/cancel'
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'PayPal-Request-Id': `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error('PayPal create order failed', { status: response.status, error: errorText });
        throw new ApiError(
          `PayPal order creation failed (${response.status}): ${errorText}`,
          response.status >= 500 ? 502 : 400,
          'PAYPAL_CREATE_ORDER_FAILED'
        );
      }

      const orderData = await response.json() as any;
      const orderId = orderData.id;

      // Extract PayPal HATEOAS approve link
      const approveLink = (orderData.links || []).find((l: any) => l.rel === 'approve' || l.rel === 'payer-action');
      const approveUrl = approveLink ? approveLink.href : null;

      // Save order record in Cloudflare D1
      await this.db.savePayPalOrder({
        id: orderId,
        userId: userId || '',
        planId: planId || 'growth',
        amount: formattedAmount,
        currency,
        status: orderData.status || 'CREATED',
        customId: orderPayload.purchase_units[0].custom_id
      });

      Logger.info('Successfully created real PayPal order', { orderId, status: orderData.status, amount: formattedAmount });

      return {
        id: orderId,
        order_id: orderId,
        status: orderData.status,
        plan_id: planId,
        amount: formattedAmount,
        currency,
        links: orderData.links,
        approveUrl
      };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      Logger.error('PayPal create order network exception', { error: err?.message || String(err) });
      throw new ApiError(
        `Failed to communicate with PayPal Orders API: ${err?.message || 'Network error'}`,
        503,
        'PAYPAL_NETWORK_ERROR'
      );
    }
  }

  /**
   * Capture a REAL PayPal Payment (POST /v2/checkout/orders/{id}/capture)
   */
  async captureOrder(orderId: string, userId?: string): Promise<CaptureOrderResult> {
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      throw new ApiError('A valid PayPal order_id is required for capture.', 400, 'MISSING_ORDER_ID');
    }

    const cleanOrderId = orderId.trim();

    // Check D1 database to prevent duplicate capture attempts
    const existingOrder = await this.db.getPayPalOrder(cleanOrderId);
    if (existingOrder && existingOrder.status === 'COMPLETED' && existingOrder.captureId) {
      Logger.info('PayPal order was already captured. Returning existing verified record.', { orderId: cleanOrderId, captureId: existingOrder.captureId });
      return {
        id: cleanOrderId,
        order_id: cleanOrderId,
        status: 'COMPLETED',
        captureId: existingOrder.captureId,
        planId: existingOrder.planId,
        amount: existingOrder.amount,
        currency: existingOrder.currency,
        payerEmail: existingOrder.payerEmail,
        payerId: existingOrder.payerId,
        capturedAt: existingOrder.updatedAt || new Date().toISOString()
      };
    }

    const accessToken = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${encodeURIComponent(cleanOrderId)}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'PayPal-Request-Id': `capture_${cleanOrderId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error('PayPal capture order failed', { orderId: cleanOrderId, status: response.status, error: errorText });
        
        // Update status in D1 if failed
        await this.db.savePayPalOrder({
          id: cleanOrderId,
          userId: userId || '',
          planId: existingOrder?.planId || 'growth',
          amount: existingOrder?.amount || '0.00',
          status: 'FAILED'
        });

        let parsedError: any = {};
        try { parsedError = JSON.parse(errorText); } catch (_) {}

        const errorMessage = parsedError?.message || parsedError?.details?.[0]?.description || errorText;
        throw new ApiError(
          `PayPal payment capture failed (${response.status}): ${errorMessage}`,
          response.status === 422 ? 422 : (response.status >= 500 ? 502 : 400),
          parsedError?.name || 'PAYPAL_CAPTURE_FAILED'
        );
      }

      const captureData = await response.json() as any;

      // Extract capture status and details
      const orderStatus = captureData.status; // Expected: 'COMPLETED'
      const purchaseUnit = captureData.purchase_units?.[0] || {};
      const captureDetails = purchaseUnit.payments?.captures?.[0] || {};
      const captureId = captureDetails.id || null;
      const captureStatus = captureDetails.status || orderStatus;

      // Strict server-side verification: only consider verified if COMPLETED
      if (orderStatus !== 'COMPLETED' && captureStatus !== 'COMPLETED') {
        Logger.warn('PayPal capture returned non-completed status', { orderId: cleanOrderId, status: orderStatus, captureStatus });
        throw new ApiError(
          `Payment not completed. PayPal status is ${orderStatus || captureStatus}.`,
          400,
          'PAYPAL_PAYMENT_NOT_COMPLETED'
        );
      }

      const payer = captureData.payer || {};
      const payerEmail = payer.email_address || null;
      const payerId = payer.payer_id || null;
      const payerName = payer.name ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim() : null;
      const capturedAmount = captureDetails.amount?.value || existingOrder?.amount || '0.00';
      const capturedCurrency = captureDetails.amount?.currency_code || existingOrder?.currency || 'USD';
      const planId = purchaseUnit.reference_id || existingOrder?.planId || 'growth';

      // Update D1 database with verified capture record
      await this.db.updatePayPalOrderCapture(
        cleanOrderId,
        captureId || cleanOrderId,
        'COMPLETED',
        payerEmail,
        payerId
      );

      Logger.info('Successfully captured and verified real PayPal payment', {
        orderId: cleanOrderId,
        captureId,
        amount: capturedAmount,
        currency: capturedCurrency,
        payerEmail
      });

      return {
        id: cleanOrderId,
        order_id: cleanOrderId,
        status: 'COMPLETED',
        captureId: captureId || cleanOrderId,
        planId,
        amount: capturedAmount,
        currency: capturedCurrency,
        payerEmail,
        payerId,
        payerName: payerName || undefined,
        capturedAt: new Date().toISOString(),
        details: captureData
      };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      Logger.error('PayPal capture network exception', { orderId: cleanOrderId, error: err?.message || String(err) });
      throw new ApiError(
        `Failed to reach PayPal capture endpoint: ${err?.message || 'Network error'}`,
        503,
        'PAYPAL_NETWORK_ERROR'
      );
    }
  }

  /**
   * Verify PayPal Webhook Signature (POST /v1/notifications/verify-webhook-signature)
   */
  async verifyWebhookSignature(headers: Record<string, string>, rawBody: string | Record<string, any>): Promise<boolean> {
    if (!this.webhookId) {
      Logger.warn('PAYPAL_WEBHOOK_ID is not configured in environment. Webhook authenticity cannot be verified cryptographically.');
      return false;
    }

    const accessToken = await this.getAccessToken();

    const authAlgo = headers['paypal-auth-algo'] || headers['PAYPAL-AUTH-ALGO'];
    const certUrl = headers['paypal-cert-url'] || headers['PAYPAL-CERT-URL'];
    const transmissionId = headers['paypal-transmission-id'] || headers['PAYPAL-TRANSMISSION-ID'];
    const transmissionSig = headers['paypal-transmission-sig'] || headers['PAYPAL-TRANSMISSION-SIG'];
    const transmissionTime = headers['paypal-transmission-time'] || headers['PAYPAL-TRANSMISSION-TIME'];

    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      Logger.warn('Missing required PayPal webhook signature headers');
      return false;
    }

    const webhookEvent = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

    try {
      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: this.webhookId,
          webhook_event: webhookEvent
        })
      });

      if (!response.ok) {
        Logger.error('PayPal verify-webhook-signature call failed', { status: response.status });
        return false;
      }

      const result = await response.json() as { verification_status?: string };
      const isValid = result.verification_status === 'SUCCESS';
      Logger.info('PayPal webhook signature verification result', { status: result.verification_status, isValid });
      return isValid;
    } catch (err: any) {
      Logger.error('Error during PayPal webhook verification', { error: err?.message || String(err) });
      return false;
    }
  }
}
