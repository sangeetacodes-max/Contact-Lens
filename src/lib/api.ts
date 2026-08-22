/**
 * CustomerLens AI Unified Client API Library
 * Connects the React dashboard to the real backend database, telemetry, surveys, and OpenAI.
 */

export interface WebsiteData {
  id: string;
  name: string;
  domain: string;
  site_id: string;
  verified: boolean;
  verification_token?: string;
  created_at: string;
}

export interface SurveyQuestionData {
  id: string;
  question_text: string;
  type: 'multiple-choice' | 'text' | 'rating' | 'nps' | 'yes-no';
  options?: string[];
  required?: boolean;
}

export interface SurveyData {
  id: string;
  website_id: string;
  site_id: string;
  title: string;
  headline: string;
  description?: string;
  status: 'draft' | 'published' | 'paused';
  questions: SurveyQuestionData[];
  triggers: {
    exit_intent?: boolean;
    dwell_time_pricing?: number;
    pricing_visit_count?: number;
    rage_clicks?: boolean;
    hesitation?: boolean;
    time_on_page?: number;
    scroll_depth?: number;
  };
  design: {
    background_color: string;
    text_color: string;
    accent_color: string;
    placement: 'Exit Intent Popup' | 'Bottom Right Toast' | 'Bottom Left Toast' | 'Center Modal' | 'Slide-in Banner';
  };
  thank_you_message?: string;
  created_at: string;
  published_at?: string;
}

export interface ResponseRecordData {
  id: string;
  survey_id: string;
  question_text: string;
  answer: string;
  page_url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  importance?: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  signal?: string;
  growth_opportunity?: string;
  created_at: string;
}

export interface AnalyticsData {
  hasData: boolean;
  website?: WebsiteData | null;
  metrics: {
    totalVisitors: number;
    totalResponses: number;
    activeSurveys: number;
    responseRate: string;
    triggersFired: number;
    rageClickEvents: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    score: number;
  };
  objections: Array<{ reason: string; count: number; percentage: number }>;
  insights: Array<{
    id: string;
    title: string;
    summary: string;
    sentiment_score?: number;
    objections?: Array<{ reason: string; percentage?: number }>;
    recommendations?: Array<{ issue: string; recommendation: string; impact: string }>;
    created_at: string;
  }>;
  recentResponses: ResponseRecordData[];
  recentEvents: any[];
}

export interface NotificationData {
  id: string;
  type: 'response' | 'ai_insight' | 'verification' | 'trigger_alert' | 'system';
  title: string;
  message: string;
  survey_id?: string;
  response_id?: string;
  read: boolean;
  created_at: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // WEBSITES
  websites: {
    list: async () => {
      const data = await fetchJson<{ websites: WebsiteData[] }>('/api/websites');
      return data.websites || [];
    },
    create: async (name: string, domain: string) => {
      const data = await fetchJson<{ success: boolean; website: WebsiteData }>('/api/websites', {
        method: 'POST',
        body: JSON.stringify({ name, domain })
      });
      return data.website;
    },
    verify: async (id: string) => {
      return fetchJson<{ success: boolean; verified: boolean; method?: string; error?: string }>(`/api/websites/${id}/verify`, {
        method: 'POST'
      });
    }
  },

  // SURVEYS
  surveys: {
    list: async (websiteId?: string) => {
      const query = websiteId ? `?website_id=${encodeURIComponent(websiteId)}` : '';
      const data = await fetchJson<{ surveys: SurveyData[] }>(`/api/surveys${query}`);
      return data.surveys || [];
    },
    get: async (id: string) => {
      const data = await fetchJson<{ survey: SurveyData }>(`/api/surveys/${id}`);
      return data.survey;
    },
    create: async (survey: Partial<SurveyData>) => {
      const data = await fetchJson<{ success: boolean; survey: SurveyData }>('/api/surveys', {
        method: 'POST',
        body: JSON.stringify(survey)
      });
      return data.survey;
    },
    update: async (id: string, survey: Partial<SurveyData>) => {
      const data = await fetchJson<{ success: boolean; survey: SurveyData }>(`/api/surveys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(survey)
      });
      return data.survey;
    },
    delete: async (id: string) => {
      return fetchJson<{ success: boolean }>(`/api/surveys/${id}`, {
        method: 'DELETE'
      });
    },
    generateWithAi: async (params: { domain: string; businessName?: string; goal?: string; businessType?: string }) => {
      const data = await fetchJson<{ success: boolean; generated: any }>('/api/surveys/ai-generate', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return data.generated;
    }
  },

  // RESPONSES
  responses: {
    list: async (websiteId?: string, surveyId?: string) => {
      const params = new URLSearchParams();
      if (websiteId) params.set('website_id', websiteId);
      if (surveyId) params.set('survey_id', surveyId);
      const data = await fetchJson<{ responses: ResponseRecordData[]; count: number; hasData: boolean }>(
        `/api/responses?${params.toString()}`
      );
      return data;
    },
    submit: async (payload: {
      site_id: string;
      survey_id: string;
      question_text: string;
      answer: string;
      page_url?: string;
    }) => {
      return fetchJson<{ success: boolean; response: ResponseRecordData }>('/api/responses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  },

  // ANALYTICS
  analytics: {
    get: async (websiteId?: string) => {
      const query = websiteId ? `?website_id=${encodeURIComponent(websiteId)}` : '';
      return fetchJson<AnalyticsData>(`/api/analytics${query}`);
    }
  },

  // NOTIFICATIONS
  notifications: {
    list: async (websiteId?: string) => {
      const query = websiteId ? `?website_id=${encodeURIComponent(websiteId)}` : '';
      const data = await fetchJson<{ notifications: NotificationData[]; unreadCount: number }>(`/api/notifications${query}`);
      return data;
    },
    markRead: async (id: string) => {
      return fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: 'POST'
      });
    },
    markAllRead: async (websiteId?: string) => {
      return fetchJson<{ success: boolean }>('/api/notifications/read-all', {
        method: 'POST',
        body: JSON.stringify({ website_id: websiteId })
      });
    }
  }
};
