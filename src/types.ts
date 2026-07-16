export type BusinessType = 'Shopify' | 'WooCommerce' | 'SaaS' | 'Startup' | 'Agency' | 'Ecommerce' | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  isEmailVerified: boolean;
  plan: 'Free' | 'Pro' | 'Business';
  billingPeriod: 'monthly' | 'yearly';
  subscriptionActive: boolean;
  trialEndsAt: string; // ISO string
}

export interface Workspace {
  id: string;
  name: string;
  businessType: BusinessType;
  url: string;
  goal: string;
  customDomain?: string;
  customDomainStatus?: 'Pending' | 'Active' | 'Failed';
  whiteLabel?: {
    logoUrl?: string;
    primaryColor?: string;
    emailBranding?: string;
    removeBranding: boolean;
  };
}

export type SurveyDisplayOption =
  | 'Exit Intent Popup'
  | 'Popup After X Seconds'
  | 'Floating Widget'
  | 'Embedded Form'
  | 'Thank You Page'
  | 'Slide In'
  | 'Bottom Bar'
  | 'Full Page Survey'
  | 'Button Triggered Survey';

export interface Survey {
  id: string;
  title: string;
  displayOption: SurveyDisplayOption;
  headline: string;
  questions: {
    id: string;
    type: 'multiple-choice' | 'text' | 'rating';
    questionText: string;
    options?: string[];
  }[];
  colors: {
    background: string;
    text: string;
    accent: string;
  };
  brandingEnabled: boolean;
  imageUrl?: string;
  active: boolean;
  secondsDelay?: number;
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  timestamp: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
  visitorMeta?: {
    browser: string;
    country: string;
    pageUrl: string;
  };
}

export interface ConnectedWebsite {
  id: string;
  platform: 'Shopify' | 'WooCommerce' | 'WordPress' | 'Webflow' | 'Wix' | 'Squarespace' | 'Custom Website';
  url: string;
  status: 'Connected' | 'Not Installed';
  apiKey?: string;
  installedAt?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  date: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: 'Paid' | 'Failed';
  paymentMethod: 'Stripe' | 'PayPal';
  invoiceUrl: string;
}
