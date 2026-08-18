-- Cloudflare D1 Initial Migration for CustomerLens AI Production
-- Migration: 0001_initial_schema.sql

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  firebase_uid TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'Free',
  role TEXT DEFAULT 'owner',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  plan TEXT DEFAULT 'Free',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 3. Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  site_id TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  business_type TEXT DEFAULT 'ecommerce',
  goal TEXT,
  verified INTEGER DEFAULT 0,
  verification_method TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Sites Table
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  hostname TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  verification_token TEXT NOT NULL,
  verification_method TEXT,
  verified_at TEXT,
  first_ping_at TEXT,
  status TEXT DEFAULT 'UNVERIFIED', -- 'UNVERIFIED' | 'VERIFYING' | 'VERIFIED' | 'SURVEY_DRAFT' | 'PUBLISHED' | 'WAITING_FOR_INSTALLATION' | 'LIVE' | 'PAUSED'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. Domain Verifications Table
CREATE TABLE IF NOT EXISTS domain_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  site_id TEXT,
  domain TEXT NOT NULL,
  hostname TEXT NOT NULL,
  token TEXT NOT NULL,
  txt_record_value TEXT NOT NULL,
  cname_target TEXT,
  verified INTEGER DEFAULT 0,
  verified_at TEXT,
  last_checked_at TEXT,
  error_message TEXT,
  connection_type TEXT DEFAULT 'custom_domain', -- 'custom_domain' | 'cloudflare_workers' | 'shopify'
  created_at TEXT NOT NULL,
  UNIQUE(user_id, domain),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  user_id TEXT,
  title TEXT NOT NULL,
  headline TEXT NOT NULL,
  questions_json TEXT NOT NULL,
  colors_json TEXT NOT NULL,
  placement TEXT DEFAULT 'Exit Intent Popup',
  triggers_json TEXT,
  font_family TEXT DEFAULT 'Inter',
  logo_url TEXT,
  status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'paused'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

-- 7. Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'multiple-choice' | 'text' | 'rating' | 'nps' | 'yes-no' | 'email'
  options_json TEXT,
  required INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- 8. Survey Deployments Table
CREATE TABLE IF NOT EXISTS survey_deployments (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  survey_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  embed_snippet TEXT NOT NULL,
  status TEXT DEFAULT 'WAITING_FOR_INSTALLATION', -- 'PUBLISHED' | 'WAITING_FOR_INSTALLATION' | 'LIVE' | 'PAUSED'
  installation_detected INTEGER DEFAULT 0,
  first_event_at TEXT,
  last_event_at TEXT,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys(id)
);

-- 9. Survey Events Table (Detailed audit trail of survey lifecycle)
CREATE TABLE IF NOT EXISTS survey_events (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  survey_id TEXT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'survey_loaded' | 'survey_viewed' | 'survey_started' | 'question_answered' | 'survey_completed' | 'survey_dismissed' | 'pageview' | 'exit_intent'
  page_url TEXT,
  referrer TEXT,
  time_on_page INTEGER DEFAULT 0,
  device TEXT,
  browser TEXT,
  ip_country TEXT,
  payload_json TEXT,
  timestamp TEXT NOT NULL
);

-- 10. General Events Table (Raw visitor telemetry)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_url TEXT,
  referrer TEXT,
  time_on_page INTEGER DEFAULT 0,
  device TEXT,
  browser TEXT,
  payload_json TEXT,
  timestamp TEXT NOT NULL
);

-- 11. Survey Responses Table
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  survey_id TEXT NOT NULL,
  session_id TEXT,
  answers_json TEXT NOT NULL,
  page_url TEXT,
  visitor_meta_json TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys(id)
);

-- 12. AI Insights Table (Generated from stored responses only)
CREATE TABLE IF NOT EXISTS ai_insights (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  survey_id TEXT,
  response_count INTEGER NOT NULL,
  summary TEXT NOT NULL,
  key_insight TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  sentiment_score REAL,
  confidence_score REAL,
  recommendations_json TEXT,
  created_at TEXT NOT NULL
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 14. PayPal Orders Table
CREATE TABLE IF NOT EXISTS paypal_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  plan_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  capture_id TEXT,
  payer_email TEXT,
  payer_id TEXT,
  custom_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes for lightning fast analytics querying
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_user ON domain_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain ON domain_verifications(domain);
CREATE INDEX IF NOT EXISTS idx_surveys_site ON surveys(site_id);
CREATE INDEX IF NOT EXISTS idx_surveys_workspace ON surveys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deployments_site ON survey_deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_survey_events_site_type ON survey_events(site_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_site_type ON events(site_id, event_type);
CREATE INDEX IF NOT EXISTS idx_responses_site_survey ON responses(site_id, survey_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_site ON ai_insights(site_id);
