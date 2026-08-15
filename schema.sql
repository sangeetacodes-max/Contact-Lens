-- Cloudflare D1 Database Schema for CustomerLens AI

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  firebase_uid TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS shopify_connections (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  shop TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  installed_at TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  headline TEXT NOT NULL,
  questions_json TEXT NOT NULL,
  colors_json TEXT NOT NULL,
  placement TEXT DEFAULT 'Exit Intent Popup',
  triggers_json TEXT,
  font_family TEXT DEFAULT 'Inter',
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_url TEXT,
  referrer TEXT,
  timestamp TEXT NOT NULL,
  time_on_page INTEGER DEFAULT 0,
  device TEXT,
  browser TEXT,
  payload_json TEXT
);

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

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  paypal_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

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

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  target TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

-- Indexes for lightning fast analytics querying
CREATE INDEX IF NOT EXISTS idx_events_site_type ON events(site_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_site_session ON events(site_id, session_id);
CREATE INDEX IF NOT EXISTS idx_responses_site_survey ON responses(site_id, survey_id);
CREATE INDEX IF NOT EXISTS idx_surveys_workspace ON surveys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
