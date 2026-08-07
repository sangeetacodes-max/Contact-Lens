import { Env } from '../types';
import { NotificationService } from '../services/notifications';
import { verifyFirebaseAuth } from '../middleware/auth';
import { jsonResponse } from '../utils/errors';

export async function handleNotificationRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const notifService = new NotificationService(env);

  // GET /api/notifications
  if (pathname === '/api/notifications' && request.method === 'GET') {
    let userId = 'default_user';
    try {
      const user = await verifyFirebaseAuth(request, env);
      userId = user.id;
    } catch {}

    const notifications = await notifService.listNotifications(userId);
    return jsonResponse(notifications);
  }

  // POST /api/notifications/mark-read
  if (pathname === '/api/notifications/mark-read' && request.method === 'POST') {
    return jsonResponse({ updated: true });
  }

  return new Response('Not Found', { status: 404 });
}
