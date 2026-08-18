/**
 * Production Service Contracts & Types for CustomerLens AI Cloudflare Worker
 */

import { 
  DomainVerificationRecord, 
  SurveyConfig, 
  TrackingEvent, 
  SurveyResponse, 
  Env 
} from '../types';

export interface IDNSVerificationService {
  normalizeDomain(input: string): string;
  isValidDomain(domain: string): boolean;
  generateToken(): string;
  queryTxtRecords(domain: string): Promise<string[]>;
  queryCnameRecords(domain: string): Promise<string[]>;
  verifyDomainDns(domain: string, expectedToken: string): Promise<{
    verified: boolean;
    method?: 'dns_txt' | 'dns_cname';
    details?: string;
  }>;
}

export interface DeploymentRecord {
  id: string;
  siteId: string;
  surveyId: string;
  domain: string;
  embedSnippet: string;
  status: 'PUBLISHED' | 'WAITING_FOR_INSTALLATION' | 'LIVE' | 'PAUSED';
  installationDetected: boolean;
  firstEventAt: string | null;
  lastEventAt: string | null;
  publishedAt: string;
  createdAt: string;
}

export interface SiteAnalytics {
  siteId: string;
  totalEvents: number;
  totalPageviews: number;
  exitIntents: number;
  cartActions: number;
  totalResponses: number;
  responseRate: string;
  installationDetected: boolean;
  firstPingAt: string | null;
  lastPingAt: string | null;
  status: 'UNVERIFIED' | 'VERIFIED' | 'WAITING_FOR_INSTALLATION' | 'LIVE';
}

export interface ExitAnalysisResult {
  hasEnoughData: boolean;
  responseCount: number;
  message?: string;
  topExitReasons: Array<{ reason: string; percentage: number }>;
  mostCommonComplaints: string[];
  sentiment: string;
  sentimentScore: number | null;
  aiSuggestions: Array<{ issue: string; recommendation: string; impact: string }>;
}
