import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize server-side Firestore instance
const firebaseServerApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(firebaseServerApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseServerApp);

// ==========================================
// DATABASE TYPES & INTERFACES
// ==========================================

export interface Website {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  domain: string;
  site_id: string;
  verified: boolean;
  verification_token?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id?: string;
  question_text: string;
  type: 'multiple-choice' | 'text' | 'rating' | 'nps' | 'yes-no';
  options?: string[];
  required?: boolean;
  order_index?: number;
}

export interface SurveyTriggers {
  exit_intent?: boolean;
  time_on_page?: number; // seconds
  scroll_depth?: number; // percentage
  target_pages?: string[]; // e.g. ['/pricing', '/checkout']
  dwell_time_pricing?: number; // seconds (e.g. 45)
  pricing_visit_count?: number; // e.g. 3
  rage_clicks?: boolean;
  hesitation?: boolean;
}

export interface SurveyDesign {
  background_color: string;
  text_color: string;
  accent_color: string;
  placement: 'Exit Intent Popup' | 'Bottom Right Toast' | 'Bottom Left Toast' | 'Center Modal' | 'Slide-in Banner';
  font_family?: string;
  logo_url?: string;
}

export interface Survey {
  id: string;
  website_id: string;
  organization_id: string;
  site_id: string;
  title: string;
  headline: string;
  description?: string;
  status: 'draft' | 'published' | 'paused';
  questions: SurveyQuestion[];
  triggers: SurveyTriggers;
  design: SurveyDesign;
  thank_you_message?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface VisitorSession {
  id: string;
  website_id: string;
  site_id: string;
  session_id: string;
  visitor_id?: string;
  current_page: string;
  page_url?: string;
  time_on_page: number;
  scroll_depth: number;
  hesitation: boolean;
  rage_clicks: number;
  visit_count: number;
  pricing_visits: number;
  created_at: string;
  last_seen_at: string;
}

export interface VisitorEvent {
  id: string;
  website_id: string;
  site_id: string;
  session_id: string;
  event_type: 'pageview' | 'scroll' | 'click' | 'rage_click' | 'exit_intent' | 'hesitation' | 'checkout_abandonment' | 'custom';
  page: string;
  payload?: any;
  created_at: string;
}

export interface SurveyResponseRecord {
  id: string;
  website_id: string;
  survey_id: string;
  site_id: string;
  session_id: string;
  question_id?: string;
  question_text: string;
  answer: string;
  page_url: string;
  time_to_answer?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  importance?: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  signal?: string;
  growth_opportunity?: string;
  created_at: string;
}

export interface AiInsight {
  id: string;
  website_id: string;
  survey_id?: string;
  type: 'summary' | 'objection' | 'sentiment' | 'recommendation' | 'pattern';
  title: string;
  summary: string;
  objections?: Array<{ reason: string; percentage?: number; frequency?: number }>;
  sentiment_score?: number;
  recommendations?: Array<{ issue: string; recommendation: string; impact: string }>;
  raw_data?: any;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  website_id: string;
  organization_id?: string;
  type: 'response' | 'ai_insight' | 'verification' | 'trigger_alert' | 'system';
  title: string;
  message: string;
  survey_id?: string;
  response_id?: string;
  read: boolean;
  created_at: string;
}

// ==========================================
// REAL FIRESTORE DATASTORE (NO MEMORY FALLBACK)
// ==========================================

function getActiveDb() {
  if (!db) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }
  return db;
}

export class FirestoreDataStore {
  // WEBSITES
  async getWebsite(idOrSiteId: string): Promise<Website | null> {
    const firestore = getActiveDb();
    if (!idOrSiteId) return null;

    try {
      // 1. Direct doc lookup by ID
      const directRef = doc(firestore, 'websites', idOrSiteId);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        return directSnap.data() as Website;
      }

      // 2. Query by site_id
      const qSite = query(collection(firestore, 'websites'), where('site_id', '==', idOrSiteId), limit(1));
      const qSiteSnap = await getDocs(qSite);
      if (!qSiteSnap.empty) {
        return qSiteSnap.docs[0].data() as Website;
      }

      // 3. Query by domain
      const qDomain = query(collection(firestore, 'websites'), where('domain', '==', idOrSiteId), limit(1));
      const qDomainSnap = await getDocs(qDomain);
      if (!qDomainSnap.empty) {
        return qDomainSnap.docs[0].data() as Website;
      }

      return null;
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getWebsite error:', err?.message);
      return null;
    }
  }

  async getAllWebsites(): Promise<Website[]> {
    const firestore = getActiveDb();
    try {
      const snap = await getDocs(collection(firestore, 'websites'));
      return snap.docs.map(d => d.data() as Website);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getAllWebsites error:', err?.message);
      return [];
    }
  }

  async saveWebsite(website: Website): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'websites', website.id);
    await setDoc(ref, website, { merge: true });
  }

  // SURVEYS
  async getSurvey(id: string): Promise<Survey | null> {
    const firestore = getActiveDb();
    if (!id) return null;
    try {
      const ref = doc(firestore, 'surveys', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as Survey;
      }
      return null;
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getSurvey error:', err?.message);
      return null;
    }
  }

  async getSurveysByWebsite(websiteIdOrSiteId: string): Promise<Survey[]> {
    const firestore = getActiveDb();
    if (!websiteIdOrSiteId) return [];
    try {
      const q = query(
        collection(firestore, 'surveys'),
        where('website_id', '==', websiteIdOrSiteId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as Survey);
      }

      // Also check site_id
      const q2 = query(
        collection(firestore, 'surveys'),
        where('site_id', '==', websiteIdOrSiteId)
      );
      const snap2 = await getDocs(q2);
      return snap2.docs.map(d => d.data() as Survey);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getSurveysByWebsite error:', err?.message);
      return [];
    }
  }

  async getAllSurveys(): Promise<Survey[]> {
    const firestore = getActiveDb();
    try {
      const snap = await getDocs(collection(firestore, 'surveys'));
      return snap.docs.map(d => d.data() as Survey);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getAllSurveys error:', err?.message);
      return [];
    }
  }

  async saveSurvey(survey: Survey): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'surveys', survey.id);
    await setDoc(ref, survey, { merge: true });
  }

  async deleteSurvey(id: string): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'surveys', id);
    await deleteDoc(ref);
  }

  // SESSIONS
  async getSession(sessionId: string): Promise<VisitorSession | null> {
    const firestore = getActiveDb();
    if (!sessionId) return null;
    try {
      const ref = doc(firestore, 'sessions', sessionId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as VisitorSession;
      }
      return null;
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getSession error:', err?.message);
      return null;
    }
  }

  async saveSession(session: VisitorSession): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'sessions', session.session_id);
    await setDoc(ref, session, { merge: true });
  }

  // EVENTS
  async addEvent(event: VisitorEvent): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'events', event.id);
    await setDoc(ref, event, { merge: true });
  }

  async getEvents(websiteIdOrSiteId?: string, limitCount = 100): Promise<VisitorEvent[]> {
    const firestore = getActiveDb();
    try {
      if (websiteIdOrSiteId) {
        const q = query(
          collection(firestore, 'events'),
          where('website_id', '==', websiteIdOrSiteId),
          limit(limitCount)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as VisitorEvent);
        }

        const q2 = query(
          collection(firestore, 'events'),
          where('site_id', '==', websiteIdOrSiteId),
          limit(limitCount)
        );
        const snap2 = await getDocs(q2);
        return snap2.docs.map(d => d.data() as VisitorEvent);
      }

      const qAll = query(collection(firestore, 'events'), limit(limitCount));
      const snapAll = await getDocs(qAll);
      return snapAll.docs.map(d => d.data() as VisitorEvent);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getEvents error:', err?.message);
      return [];
    }
  }

  // RESPONSES
  async addResponse(resp: SurveyResponseRecord): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'responses', resp.id);
    await setDoc(ref, resp, { merge: true });
  }

  async getResponses(websiteIdOrSiteId?: string, surveyId?: string, limitCount = 200): Promise<SurveyResponseRecord[]> {
    const firestore = getActiveDb();
    try {
      let q = collection(firestore, 'responses');
      const snap = await getDocs(q);
      let list = snap.docs.map(d => d.data() as SurveyResponseRecord);

      if (websiteIdOrSiteId) {
        list = list.filter(r => r.website_id === websiteIdOrSiteId || r.site_id === websiteIdOrSiteId);
      }
      if (surveyId) {
        list = list.filter(r => r.survey_id === surveyId);
      }

      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return list.slice(0, limitCount);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getResponses error:', err?.message);
      return [];
    }
  }

  // INSIGHTS
  async addInsight(insight: AiInsight): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'aiInsights', insight.id);
    await setDoc(ref, insight, { merge: true });
  }

  async getInsights(websiteIdOrSiteId?: string, limitCount = 20): Promise<AiInsight[]> {
    const firestore = getActiveDb();
    try {
      const snap = await getDocs(collection(firestore, 'aiInsights'));
      let list = snap.docs.map(d => d.data() as AiInsight);
      if (websiteIdOrSiteId) {
        list = list.filter(i => i.website_id === websiteIdOrSiteId);
      }
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return list.slice(0, limitCount);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getInsights error:', err?.message);
      return [];
    }
  }

  // NOTIFICATIONS
  async addNotification(notif: NotificationRecord): Promise<void> {
    const firestore = getActiveDb();
    const ref = doc(firestore, 'notifications', notif.id);
    await setDoc(ref, notif, { merge: true });
  }

  async getNotifications(websiteIdOrSiteId?: string, limitCount = 50): Promise<NotificationRecord[]> {
    const firestore = getActiveDb();
    try {
      const snap = await getDocs(collection(firestore, 'notifications'));
      let list = snap.docs.map(d => d.data() as NotificationRecord);
      if (websiteIdOrSiteId) {
        list = list.filter(n => n.website_id === websiteIdOrSiteId);
      }
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return list.slice(0, limitCount);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] getNotifications error:', err?.message);
      return [];
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    const firestore = getActiveDb();
    try {
      const ref = doc(firestore, 'notifications', id);
      await updateDoc(ref, { read: true });
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] markNotificationRead error:', err?.message);
    }
  }

  async markAllNotificationsRead(websiteIdOrSiteId?: string): Promise<void> {
    const firestore = getActiveDb();
    try {
      const list = await this.getNotifications(websiteIdOrSiteId);
      await Promise.all(
        list.filter(n => !n.read).map(n => updateDoc(doc(firestore, 'notifications', n.id), { read: true }))
      );
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_CONFIGURED') throw err;
      console.warn('[Firestore] markAllNotificationsRead error:', err?.message);
    }
  }
}

export const store = new FirestoreDataStore();

