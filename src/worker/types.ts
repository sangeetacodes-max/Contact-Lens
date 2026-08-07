// Cloudflare Worker Environment bindings interface
export interface Env {
  OPENAI_API_KEY?: string;
  SHOPIFY_API_KEY?: string;
  SHOPIFY_API_SECRET?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  FIREBASE_PROJECT_ID?: string;
  D1_DATABASE?: D1Database;
  KV_SESSIONS?: KVNamespace;
  R2_STORAGE?: R2Bucket;
}

// Minimal D1Database interfaces for Cloudflare Workers TypeScript typing
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: any;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// Minimal KVNamespace interface
export interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expiration?: number; expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}

// Minimal R2Bucket interface
export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: { httpMetadata?: Record<string, string>; customMetadata?: Record<string, string> }): Promise<R2Object>;
  delete(key: string): Promise<void>;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
}

// Standard JSON API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Auth User Record
export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  name?: string;
}

// Survey Question Format
export interface SurveyQuestion {
  id: string;
  type: 'multiple-choice' | 'text' | 'rating';
  questionText: string;
  options?: string[];
  required?: boolean;
}

// Survey Configuration
export interface SurveyConfig {
  id: string;
  workspaceId: string;
  headline: string;
  questions: SurveyQuestion[];
  colors: {
    background: string;
    text: string;
    accent: string;
  };
  placement: string;
  triggers: string[];
  fontFamily: string;
  logoUrl?: string;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  updatedAt: string;
}

// Live Tracking Event
export interface TrackingEvent {
  id: string;
  siteId: string;
  sessionId: string;
  eventType: 'pageview' | 'exit_intent' | 'scroll_depth' | 'cart_action' | 'survey_response';
  pageUrl: string;
  referrer: string;
  timestamp: string;
  timeOnPage?: number;
  device?: string;
  browser?: string;
  payload?: Record<string, any>;
}

// Survey Response
export interface SurveyResponse {
  id: string;
  siteId: string;
  surveyId: string;
  sessionId: string;
  answers: Array<{ questionId: string; answer: string }>;
  pageUrl: string;
  visitorMeta?: Record<string, any>;
  timestamp: string;
}
