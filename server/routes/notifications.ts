import { Router } from 'express';
import { store, NotificationRecord, Website } from '../db/schema';
import { openAIService } from '../services/openai';
import { requireAuth, requireWebsiteOwnership } from '../middleware/auth';

export const notificationsRouter = Router();

async function getUserWebsites(organizationId: string, userId: string): Promise<Website[]> {
  const allWebsites = await store.getAllWebsites();
  return allWebsites.filter(w => w.organization_id === organizationId || w.user_id === userId);
}

// GET /api/notifications - List notifications.
// With ?website_id: strict ownership check on that website.
// Without it: aggregated across all websites owned by the caller.
notificationsRouter.get('/', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const websiteId = (req.query.website_id as string) || (req.query.site_id as string);

    if (websiteId) {
      const website = await store.getWebsite(websiteId);
      if (!website) {
        return res.status(404).json({ error: 'Website not found.' });
      }
      if (website.organization_id !== authUser.organizationId && website.user_id !== authUser.userId) {
        return res.status(403).json({ error: 'Forbidden: Website ownership mismatch.' });
      }
      const notifications = await store.getNotifications(website.id);
      const unreadCount = notifications.filter(n => !n.read).length;
      return res.json({ notifications, unreadCount });
    }

    const userWebsites = await getUserWebsites(authUser.organizationId, authUser.userId);
    const websiteIds = new Set(userWebsites.map(w => w.id));
    const all = await store.getNotifications();
    const notifications = all.filter(n => websiteIds.has(n.website_id));
    const unreadCount = notifications.filter(n => !n.read).length;
    return res.json({ notifications, unreadCount });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/notifications/ai-bulletin - Generate a real AI insights bulletin from
// the caller's actual stored responses and persist it as a notification.
notificationsRouter.post('/ai-bulletin', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const userWebsites = await getUserWebsites(authUser.organizationId, authUser.userId);
    const website = userWebsites[0];
    if (!website) {
      return res.status(404).json({ error: 'No registered website found. Register your website first.' });
    }

    const websiteIds = new Set(userWebsites.map(w => w.id));
    const [allResponses, surveys] = await Promise.all([
      store.getResponses(),
      store.getSurveysByWebsite(website.id)
    ]);
    const responses = allResponses.filter(r => websiteIds.has(r.website_id));

    const bulletin = await openAIService.generateInsightsBulletin({
      businessName: website.name || website.domain,
      domain: website.domain,
      responses,
      surveysCount: surveys.length
    });

    const notif: NotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      website_id: website.id,
      organization_id: website.organization_id,
      type: 'ai_insight',
      title: bulletin.title,
      message: bulletin.summary,
      read: false,
      created_at: new Date().toISOString()
    };
    await store.addNotification(notif);

    return res.json({ success: true, notification: notif, responsesCount: responses.length });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: AI API key not configured.' });
    }
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// POST /api/notifications/digest - Generate a real executive digest from actual
// telemetry and persist it to the notification center.
notificationsRouter.post('/digest', requireAuth, async (req, res) => {
  try {
    const authUser = req.auth!;
    const { businessName, goal, recipientEmail } = req.body || {};
    const userWebsites = await getUserWebsites(authUser.organizationId, authUser.userId);
    const website = userWebsites[0];
    if (!website) {
      return res.status(404).json({ error: 'No registered website found. Register your website first.' });
    }

    const websiteIds = new Set(userWebsites.map(w => w.id));
    const [allResponses, allEvents, surveys] = await Promise.all([
      store.getResponses(),
      store.getEvents(),
      store.getSurveysByWebsite(website.id)
    ]);
    const responses = allResponses.filter(r => websiteIds.has(r.website_id));
    const events = allEvents.filter(e => websiteIds.has(e.website_id));

    const digest = await openAIService.generateExecutiveDigest({
      businessName: businessName || website.name || website.domain,
      domain: website.domain,
      goal,
      recipientEmail: recipientEmail || authUser.email,
      responses,
      eventsCount: events.length,
      surveysCount: surveys.length
    });

    const notif: NotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      website_id: website.id,
      organization_id: website.organization_id,
      type: 'ai_insight',
      title: digest.subject,
      message: digest.body,
      read: false,
      created_at: new Date().toISOString()
    };
    await store.addNotification(notif);

    return res.json({ success: true, digest, notification: notif });
  } catch (err: any) {
    if (err.message === 'DATABASE_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Database error: Database unavailable' });
    }
    if (err.message === 'OPENAI_KEY_NOT_CONFIGURED' || err.message === 'OPENAI_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'AI unavailable: AI API key not configured.' });
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


