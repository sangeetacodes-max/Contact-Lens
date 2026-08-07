import { Env } from '../types';
import { PayPalService } from '../services/paypal';
import { jsonResponse, ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';

export async function handlePayPalRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const paypalService = new PayPalService(env);

  // 1. Create PayPal Order / Subscription (/api/paypal/create-order)
  if (pathname === '/api/paypal/create-order' && request.method === 'POST') {
    const { plan_id, planId, amount } = await request.json() as any;
    const targetPlan = plan_id || planId || 'growth';
    const planAmount = amount || (targetPlan === 'enterprise' ? '299.00' : targetPlan === 'pro' ? '79.00' : '29.00');

    const orderData = await paypalService.createOrder(targetPlan, planAmount);
    return jsonResponse(orderData);
  }

  // 2. Capture PayPal Payment (/api/paypal/capture)
  if (pathname === '/api/paypal/capture' && request.method === 'POST') {
    const { order_id, orderId } = await request.json() as any;
    const targetOrderId = order_id || orderId;

    if (!targetOrderId) {
      throw new ApiError('order_id is required for payment capture', 400, 'MISSING_ORDER_ID');
    }

    const captureData = await paypalService.captureOrder(targetOrderId);
    return jsonResponse(captureData);
  }

  // 3. PayPal Webhook Listener (/api/paypal/webhook)
  if (pathname === '/api/paypal/webhook' && request.method === 'POST') {
    const body = await request.json() as any;
    Logger.info('Received PayPal Webhook:', { eventType: body.event_type });
    return jsonResponse({ received: true, eventType: body.event_type });
  }

  return new Response('Not Found', { status: 404 });
}
