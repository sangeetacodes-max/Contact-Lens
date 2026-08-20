import { Env } from '../types';
import { NotificationService } from '../services/notifications';
import { DatabaseService } from '../services/db';
import { verifyFirebaseAuth } from '../middleware/auth';
import { jsonResponse } from '../utils/errors';

export async function handleNotificationRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const notifService = new NotificationService(env);
  const db = new DatabaseService(env);
  const url = new URL(request.url);

  // GET /api/notifications
  if (pathname === '/api/notifications' && request.method === 'GET') {
    let resolvedUserId: string | null = null;

    // 1. Check verified Firebase Auth header
    try {
      const user = await verifyFirebaseAuth(request, env);
      if (user && user.id) {
        resolvedUserId = user.id;
      }
    } catch {}

    // 2. If not in auth header, resolve through site_id -> workspace_id -> authorized owner
    if (!resolvedUserId) {
      const siteId = url.searchParams.get('siteId') || url.searchParams.get('workspaceId');
      if (siteId) {
        const siteInfo = await db.getSiteById(siteId);
        if (siteInfo && siteInfo.userId) {
          resolvedUserId = siteInfo.userId;
        }
      }
    }

    if (!resolvedUserId) {
      return jsonResponse([]);
    }

    const notifications = await notifService.listNotifications(resolvedUserId);
    return jsonResponse(notifications);
  }

  // POST /api/notifications/mark-read
  if (pathname === '/api/notifications/mark-read' && request.method === 'POST') {
    return jsonResponse({ updated: true });
  }

  return new Response('Not Found', { status: 404 });
}
