import { Router } from 'express';
import { store } from '../db/schema';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const notificationsRouter = Router();

// GET /api/notifications - List notifications (with auth & ownership check)
notificationsRouter.get('/', requireAuth, requireWebsiteOwnership('website_id'), async (req, res) => {
  try {
    const website = req.website!;
    const notifications = await store.getNotifications(website.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    return res.json({ notifications, unreadCount });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/notifications/:id/read - Mark single as read
notificationsRouter.post('/:id/read', requireAuth, async (req, res) => {
  try {
    await store.markNotificationRead(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/notifications/read-all - Mark all as read
notificationsRouter.post('/read-all', requireAuth, requireWebsiteOwnership('website_id'), async (req, res) => {
  try {
    const website = req.website!;
    await store.markAllNotificationsRead(website.id);
    return res.json({ success: true });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});


