import { Env } from '../types';
import { PayPalService } from '../services/paypal';
import { DatabaseService } from '../services/db';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handlePayPalRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const paypalService = new PayPalService(env);
  const dbService = new DatabaseService(env);

  // 1. Get PayPal Client Configuration (/api/paypal/config)
  if (pathname === '/api/paypal/config' && request.method === 'GET') {
    const config = paypalService.getPublicConfig();
    return jsonResponse(config);
  }

  // 2. Create Real PayPal Order (/api/paypal/create-order)
  if (pathname === '/api/paypal/create-order' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { plan_id, planId, amount, currency, userId, returnUrl, cancelUrl } = body || {};

      const targetPlan = plan_id || planId || 'pro';
      
      // Compute standard pricing if amount is not provided
      let finalAmount = amount;
      if (!finalAmount) {
        switch (targetPlan.toLowerCase()) {
          case 'enterprise':
          case 'business':
            finalAmount = '99.00';
            break;
          case 'pro':
          case 'growth':
            finalAmount = '49.00';
            break;
          default:
            finalAmount = '20.00';
        }
      }

      const orderData = await paypalService.createOrder({
        planId: targetPlan,
        amount: finalAmount.toString(),
        currency: currency || 'USD',
        userId: userId || undefined,
        returnUrl,
        cancelUrl
      });

      return jsonResponse(orderData);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err?.message || 'Failed to create PayPal order', 500, 'PAYPAL_ORDER_CREATION_FAILED');
    }
  }

  // 3. Capture Real PayPal Order & Verify Payment (/api/paypal/capture)
  if (pathname === '/api/paypal/capture' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { order_id, orderId, userId } = body || {};
      const targetOrderId = order_id || orderId;

      if (!targetOrderId || typeof targetOrderId !== 'string') {
        throw new ApiError('A valid order_id is required to capture the PayPal payment.', 400, 'MISSING_ORDER_ID');
      }

      const captureResult = await paypalService.captureOrder(targetOrderId, userId);
      return jsonResponse(captureResult);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err?.message || 'Failed to capture PayPal payment', 500, 'PAYPAL_CAPTURE_FAILED');
    }
  }

  // 4. Handle Real PayPal Webhook (/api/paypal/webhook)
  if (pathname === '/api/paypal/webhook' && request.method === 'POST') {
    try {
      const rawBody = await request.text();
      let body: any = {};
      try {
        body = JSON.parse(rawBody);
      } catch (_) {
        throw new ApiError('Invalid JSON in webhook body', 400, 'INVALID_WEBHOOK_JSON');
      }

      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      // If PAYPAL_WEBHOOK_ID is set in environment, verify authenticity
      if (env.PAYPAL_WEBHOOK_ID || process.env.PAYPAL_WEBHOOK_ID) {
        const isValid = await paypalService.verifyWebhookSignature(headers, body);
        if (!isValid) {
          Logger.warn('Rejected unauthenticated PayPal webhook request');
          return jsonResponse({ error: 'Invalid webhook signature' }, 401);
        }
      }

      const eventType = body.event_type;
      const resource = body.resource || {};
      Logger.info(`Processing verified PayPal webhook event: ${eventType}`, { resourceId: resource.id });

      // Handle relevant payment capture / subscription events
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
        const captureId = resource.id;
        const payerEmail = resource.payer?.email_address;
        const amount = resource.amount?.value;

        if (orderId) {
          await dbService.updatePayPalOrderCapture(orderId, captureId, 'COMPLETED', payerEmail);
          Logger.info('PayPal Webhook: payment capture confirmed and synchronized', { orderId, captureId, amount });
        }
      } else if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'PAYMENT.CAPTURE.DECLINED') {
        const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
        if (orderId) {
          await dbService.savePayPalOrder({
            id: orderId,
            planId: 'pro',
            amount: resource.amount?.value || '0.00',
            status: 'DENIED'
          });
          Logger.warn('PayPal Webhook: payment capture was denied/declined', { orderId });
        }
      }

      return jsonResponse({ received: true, eventType, timestamp: new Date().toISOString() });
    } catch (err: any) {
      Logger.error('Error processing PayPal webhook', { error: err?.message || String(err) });
      if (err instanceof ApiError) throw err;
      return jsonResponse({ error: err?.message || 'Webhook processing failed' }, 500);
    }
  }

  return new Response('Not Found', { status: 404 });
}
