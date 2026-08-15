import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopifyLogo } from './ShopifyLogo';
import { 
  Sparkles, 
  Check, 
  Copy, 
  RefreshCw, 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  Wand2, 
  Pipette, 
  Palette,
  Type,
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  X, 
  Bell, 
  MessageSquare, 
  PieChart, 
  BarChart3,
  Lightbulb, 
  Bot, 
  Sliders, 
  HelpCircle, 
  CheckSquare, 
  ShieldCheck, 
  Eye, 
  Smile, 
  Tag, 
  Gift,
  TrendingUp, 
  Target, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Sparkle,
  Settings,
  Clock,
  RotateCcw,
  Pencil,
  Star,
  Plus,
  PlusCircle,
  Minus,
  Maximize2,
  Search,
  Filter,
  Home
} from 'lucide-react';
import { BusinessType, Survey, Workspace } from '../types';

export interface GeneratedSurveyConfig {
  id: string;
  goalId: string;
  goalLabel: string;
  goalIcon: string;
  title: string;
  trigger: string;
  questionsCount: number;
  completion: string;
  rate: string;
  accentColor: string;
  bgColor: string;
  bgImageUrl?: string;
  logoDoodle: string;
  logoUrl?: string;
  sizePosition: 'Bottom Right Widget' | 'Compact Center Modal' | 'Full Center Modal' | 'Bottom Banner';
  headline: string;
  questionText: string;
  options: string[];
  incentiveText?: string;
  aiTone: 'Friendly & Casual' | 'Professional & Direct' | 'Luxury & Exclusive' | 'Playful & Fun' | 'Empathetic & Helpful';
  formatType: '5-6 Question Slide' | 'AI Cart Box' | 'Page-Specific Trigger' | 'Conversational Popover';
  isExpanded: boolean;
}

interface ZigpollTemplate {
  id: string;
  title: string;
  desc: string;
  category: 'General' | 'Manual' | 'Ecommerce' | 'Email & SMS';
  categoryGroup: string;
  recommended: string[];
  isSparkle?: boolean;
  previewType: 'example_slide' | 'radio_list' | 'rating_1_5' | 'rating_1_10' | 'csat_emojis' | 'exit_intent_discount' | 'exit_intent_hesitation' | 'email_input';
  previewTitle: string;
  previewSub?: string;
  banner?: string;
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
  hasTextarea?: boolean;
}

const ZIGPOLL_TEMPLATES: ZigpollTemplate[] = [
  // MANUAL
  {
    id: 'api_only',
    title: 'API Only',
    desc: 'Make this survey available to be triggered using our JS API only.',
    category: 'Manual',
    categoryGroup: 'MANUAL',
    recommended: ['JS API'],
    previewType: 'example_slide',
    previewTitle: 'Example Slide',
    previewSub: 'This is an example slide. Your published zigpoll will look something like this given your current settings.'
  },
  {
    id: 'embed_code',
    title: 'Embed Code Snippet',
    desc: 'Embed this survey anywhere with a simple code snippet.',
    category: 'Manual',
    categoryGroup: 'MANUAL',
    recommended: ['Embed Snippet'],
    previewType: 'example_slide',
    previewTitle: 'Example Slide',
    previewSub: 'This is an example slide. Your published zigpoll will look something like this given your current settings.'
  },
  {
    id: 'configure_manually',
    title: 'Configure Manually',
    desc: 'Display the survey only on the page or pages that you specify.',
    category: 'Manual',
    categoryGroup: 'MANUAL',
    recommended: ['Page Rules'],
    previewType: 'example_slide',
    previewTitle: 'Example Slide',
    previewSub: 'This is an example slide. Your published zigpoll will look something like this given your current settings.'
  },
  {
    id: 'synthetic_research',
    title: 'Synthetic Research',
    desc: 'Generate synthetic survey responses from configurable audience profiles.',
    category: 'Manual',
    categoryGroup: 'MANUAL',
    recommended: ['Audience AI'],
    isSparkle: true,
    previewType: 'example_slide',
    previewTitle: 'Synthetic Research Slide',
    previewSub: 'Generate synthetic survey responses from configurable audience profiles.'
  },

  // ECOMMERCE
  {
    id: 'exit_intent',
    title: 'Exit Intent',
    desc: 'Show when the user intends to exit your website.',
    category: 'Ecommerce',
    categoryGroup: 'ECOMMERCE',
    recommended: ['Exit Intent', 'Abandoned Checkout'],
    previewType: 'exit_intent_hesitation',
    previewTitle: 'What was your biggest hesitation or concern while browsing our website?',
    previewSub: 'Your honest feedback helps us improve.',
    options: [
      "I couldn't find enough information",
      "Prices were unclear or too high",
      "I don't trust the website yet",
      "Checkout process seemed complicated",
      "I'm just browsing, not ready to buy",
      "Other"
    ]
  },
  {
    id: 'product_pages',
    title: 'Product Pages',
    desc: 'Show this survey on all of your product pages.',
    category: 'Ecommerce',
    categoryGroup: 'ECOMMERCE',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'Does this page tell you everything you need to know about the product?',
    options: ['Yes, definitely!', 'Sort of...', 'Not at all']
  },
  {
    id: 'pre_purchase_exit',
    title: 'Pre-Purchase Exit Intent',
    desc: 'Understand why a customer is leaving your website before purchase and win them back.',
    category: 'Ecommerce',
    categoryGroup: 'EXIT INTENT & ABANDONED CART',
    recommended: ['Exit Intent', 'Abandoned Checkout'],
    previewType: 'exit_intent_discount',
    banner: 'Get 10% off your next order by completing this survey!',
    previewTitle: "What's the primary reason that stopped you from making a purchase today?",
    hasTextarea: true
  },
  {
    id: 'abandoned_checkout',
    title: 'Abandoned Checkout',
    desc: 'Engage your users after an abandoned checkout and win them back.',
    category: 'Ecommerce',
    categoryGroup: 'EXIT INTENT & ABANDONED CART',
    recommended: ['Exit Intent', 'Abandoned Checkout'],
    previewType: 'exit_intent_discount',
    banner: 'Get 10% off your next order by completing this survey!',
    previewTitle: "What's the primary reason that stopped you from making a purchase today?",
    hasTextarea: true
  },
  {
    id: 'exit_intent_survey',
    title: 'Exit Intent Survey',
    desc: 'Understand why customers are leaving your site without converting.',
    category: 'Ecommerce',
    categoryGroup: 'EXIT INTENT & ABANDONED CART',
    recommended: ['Exit Intent', 'Abandoned Checkout'],
    previewType: 'radio_list',
    previewTitle: 'What stopped you from buying today?',
    options: ['Shipping fees were too high', 'Just comparing options', 'Payment method not available', 'Decided to buy later', 'Other']
  },
  {
    id: 'reward_email',
    title: 'Reward Email Capture',
    desc: 'Incentivize your customers to submit their email provide feedback.',
    category: 'Ecommerce',
    categoryGroup: 'ECOMMERCE',
    recommended: ['On-Site', 'Homepage Modal'],
    previewType: 'email_input',
    previewTitle: 'Unlock 10% OFF Your Order',
    previewSub: 'Enter your email to receive your instant promo code.'
  },
  {
    id: 'identify_goals',
    title: 'Identify Customer Goals',
    desc: 'Use this survey to understand how customers plan to use your product.',
    category: 'Ecommerce',
    categoryGroup: 'ECOMMERCE',
    recommended: ['On-Site', 'Order Delivered'],
    previewType: 'radio_list',
    previewTitle: 'How do you plan to use our product?',
    options: ['Personal use', 'Gift for someone else', 'Business / Work', 'Other']
  },
  {
    id: 'identify_blockers',
    title: 'Identify Sign-Up Blockers',
    desc: 'This survey helps identify issues with your product or messaging.',
    category: 'Ecommerce',
    categoryGroup: 'ECOMMERCE',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'What almost kept you from signing up today?',
    options: ['Unclear pricing', 'Privacy concerns', "Didn't see features I needed", 'Other']
  },
  {
    id: 'improve_signup',
    title: 'Improve Your Sign Up Experience',
    desc: 'Measure the sign-up experience and gauge user expectations.',
    category: 'Ecommerce',
    categoryGroup: 'ECOMMERCE',
    recommended: ['On-Site'],
    previewType: 'rating_1_5',
    previewTitle: 'How easy was it to create your account?',
    minLabel: 'Not Easy',
    maxLabel: 'Very Easy'
  },

  // CUSTOMER SATISFACTION
  {
    id: 'nps',
    title: 'Net Promoter Score (NPS)',
    desc: 'Gauge the loyalty of your customer relationships.',
    category: 'General',
    categoryGroup: 'CUSTOMER SATISFACTION',
    recommended: ['Link', 'On-Site', 'Email'],
    previewType: 'rating_1_10',
    previewTitle: 'How likely are you to recommend us to a friend?',
    minLabel: 'Not at all likely',
    maxLabel: 'Extremely likely'
  },
  {
    id: 'customer_experience',
    title: 'Customer Experience Survey',
    desc: 'Get a 360 degree view of how your customers feel about your website.',
    category: 'General',
    categoryGroup: 'CUSTOMER SATISFACTION',
    recommended: ['Post Purchase', 'On-Site'],
    previewType: 'csat_emojis',
    previewTitle: 'How was your overall website experience?',
    minLabel: 'Hated It',
    maxLabel: 'Loved It'
  },
  {
    id: 'customer_satisfaction_survey',
    title: 'Customer Satisfaction Survey',
    desc: 'Understand how your customers really feel about their purchase.',
    category: 'General',
    categoryGroup: 'CUSTOMER SATISFACTION',
    recommended: ['Post Purchase', 'Email', 'SMS'],
    previewType: 'csat_emojis',
    previewTitle: 'How satisfied are you with your recent order?',
    minLabel: 'Dissatisfied',
    maxLabel: 'Very Satisfied'
  },
  {
    id: 'csat',
    title: 'Customer Satisfaction (CSAT)',
    desc: 'Understand how customers feel about an interaction.',
    category: 'General',
    categoryGroup: 'CUSTOMER SATISFACTION',
    recommended: ['Post Purchase'],
    previewType: 'csat_emojis',
    previewTitle: 'How did you feel about our checkout process?',
    minLabel: 'Hated It',
    maxLabel: 'Loved It'
  },
  {
    id: 'ces',
    title: 'Customer Effort (CES)',
    desc: 'Measure the difficulty of an interaction.',
    category: 'General',
    categoryGroup: 'CUSTOMER SATISFACTION',
    recommended: ['Post Purchase', 'On-Site'],
    previewType: 'rating_1_5',
    previewTitle: 'How easy was it to complete your purchase today?',
    minLabel: 'Very Difficult',
    maxLabel: 'Very Easy'
  },

  // SOFTWARE (SAAS)
  {
    id: 'pmf',
    title: 'Product-Market Fit (SaaS)',
    desc: 'Run the classic Sean Ellis test to measure how much your users would miss your product.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['Email', 'Link', 'On-Site'],
    previewType: 'radio_list',
    previewTitle: 'How would you feel if you could no longer use our product?',
    options: ['Very disappointed', 'Somewhat disappointed', 'Not disappointed', 'N/A - I no longer use it']
  },
  {
    id: 'onboarding',
    title: 'Onboarding Survey',
    desc: 'Learn what new users want to accomplish and where they get stuck during setup.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site', 'Email', 'Link'],
    previewType: 'radio_list',
    previewTitle: 'What is your primary goal today?',
    options: ['Increase sales conversion', 'Collect customer feedback', 'Reduce cart drop-off', 'Just exploring']
  },
  {
    id: 'upgrade_survey',
    title: 'Upgrade Survey',
    desc: 'Understand what drives customers to move to a higher plan so you can do more of it.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['Email', 'Link', 'On-Site'],
    previewType: 'radio_list',
    previewTitle: "What's the main reason you upgraded?",
    options: ['Hit a limit on my plan', 'Needed a specific feature', 'My team or usage grew', 'Wanted better support', 'Recommended by a colleague', 'Other']
  },
  {
    id: 'downgrade_survey',
    title: 'Downgrade Survey',
    desc: 'Find out why customers move to a smaller plan and what would keep them on a higher one.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['Email', 'Link', 'On-Site'],
    previewType: 'radio_list',
    previewTitle: "What's the main reason you're moving to a smaller plan?",
    options: ['Too expensive for my current usage', 'Not using enough of the features', 'Missing a feature I needed', 'Just scaling back for now', 'Switching to another tool', 'Other']
  },
  {
    id: 'cancellation_survey',
    title: 'Cancellation Survey',
    desc: 'Capture why customers cancel so you can reduce churn and win some back.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site', 'Link', 'Email'],
    previewType: 'radio_list',
    previewTitle: "What's the main reason you're cancelling?",
    options: ['Too expensive', 'Missing features I need', 'Too hard to use', 'I no longer need it', 'Switching to a competitor', 'Just trying it out', 'Other']
  },
  {
    id: 'feature_request',
    title: 'Feature Request Survey',
    desc: 'Collect and prioritize the features your customers want most.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site', 'Email', 'Link'],
    previewType: 'radio_list',
    previewTitle: 'Which feature should we build next?',
    options: ['Klaviyo / Email Integration', 'Custom CSS & Branding', 'Advanced Analytics Export', 'Multi-language Support', 'Other']
  },
  {
    id: 'site_feedback',
    title: 'Site Feedback',
    desc: 'General feedback about your website.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'How would you rate our website navigation?',
    options: ['Very easy to find items', 'Somewhat easy', 'Confusing / Hard to find items']
  },
  {
    id: 'feature_feedback',
    title: 'Feature Feedback',
    desc: 'Discover what your customers think about recent changes.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site', 'Email'],
    previewType: 'radio_list',
    previewTitle: 'How do you like our new dashboard layout?',
    options: ['Love it!', "It's okay", 'Preferred the old one']
  },
  {
    id: 'improve_product_desc',
    title: 'Improve Product Descriptions',
    desc: 'Understand how effective your product descriptions are to customers.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'Does this page tell you everything you need to know about the product?',
    options: ['Yes, definitely!', 'Sort of...', 'Not at all']
  },
  {
    id: 'improve_site_nav',
    title: 'Improve Site Navigation',
    desc: 'Understand how effective your site navigation is to your customers.',
    category: 'General',
    categoryGroup: 'SOFTWARE (SAAS)',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'Were you able to find what you were looking for today?',
    options: ['Yes easily', 'Took some searching', "No, couldn't find it"]
  },

  // GENERAL
  {
    id: 'link_only',
    title: 'Link Only',
    desc: 'Access this survey via a public URL only. Commonly used for one-off campaigns.',
    category: 'General',
    categoryGroup: 'GENERAL',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'How did you hear about us?',
    options: ['Social Media', 'Friend / Colleague', 'Search Engine', 'Other']
  },
  {
    id: 'every_page',
    title: 'Every Page',
    desc: 'Show this survey on every page of your website.',
    category: 'General',
    categoryGroup: 'GENERAL',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'What was your biggest hesitation or concern while browsing our website?',
    previewSub: 'Your honest feedback helps us improve.',
    options: ["I couldn't find enough information", 'Prices were unclear or too high', "I don't trust the website yet", 'Checkout process seemed complicated', "I'm just browsing, not ready to buy", 'Other']
  },
  {
    id: 'homepage_only',
    title: 'Homepage Only',
    desc: 'Show this survey on your homepage only.',
    category: 'General',
    categoryGroup: 'GENERAL',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'Welcome! What brings you to our store today?',
    options: ['Looking for specific items', 'Browsing sales & discounts', 'Learning about your brand']
  },
  {
    id: 'feedback',
    title: 'Feedback',
    desc: 'Unobtrusive survey on every page prompting feedback.',
    category: 'General',
    categoryGroup: 'GENERAL',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'How can we make this page better?',
    options: ['Add more product details', 'Lower shipping rates', 'Faster page loading', 'Other']
  },
  {
    id: 'homepage_popup',
    title: 'Homepage Pop Up',
    desc: 'Show this survey as a modal when the user lands on your homepage.',
    category: 'General',
    categoryGroup: 'GENERAL',
    recommended: ['On-Site'],
    previewType: 'radio_list',
    previewTitle: 'Are you shopping for yourself or someone else today?',
    options: ['Shopping for myself', 'Looking for a gift', 'Just exploring']
  },

  // EMAIL & SMS
  {
    id: 'email_campaign',
    title: 'Email Campaign',
    desc: 'Email this survey out to your customers.',
    category: 'Email & SMS',
    categoryGroup: 'EMAIL & SMS',
    recommended: ['Email Campaign'],
    previewType: 'radio_list',
    previewTitle: 'How likely are you to purchase from our next collection?',
    options: ['Definitely will', 'Maybe', 'Not likely']
  }
];

export interface SlideQuestionTemplate {
  id: string;
  title: string;
  type: 'Single Choice' | 'Multiple Choice' | 'Short Answer' | 'Long Answer' | 'Satisfaction' | 'Range' | 'Binary Choice';
  typeIcon: string;
  pairedWith: string[];
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
}

export interface ManagedSlideItem {
  id: string;
  title: string;
  type: string;
  typeIcon: string;
  options?: string[];
  conditionText?: string;
  showSlideBadge?: boolean;
}

const INITIAL_MANAGED_SLIDES: ManagedSlideItem[] = [
  {
    id: 'ms_1',
    title: 'How was your shopping experience today?',
    type: 'Satisfaction',
    typeIcon: '🎭',
    options: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
  },
  {
    id: 'ms_2',
    title: 'Sorry you feel that way.',
    type: 'Long Answer',
    typeIcon: '💬',
    conditionText: 'If How was your shopping experience today? is Very Unsatisfied or How was your shopping experience today? is Unsatisfied',
    showSlideBadge: true
  },
  {
    id: 'ms_3',
    title: 'Thanks for your feedback!',
    type: 'Long Answer',
    typeIcon: '💬',
    conditionText: 'If How was your shopping experience today? is Neutral',
    showSlideBadge: true
  },
  {
    id: 'ms_4',
    title: "We're happy to hear that!",
    type: 'Long Answer',
    typeIcon: '💬',
    conditionText: 'If How was your shopping experience today? is Satisfied or How was your shopping experience today? is Very Satisfied',
    showSlideBadge: true
  },
  {
    id: 'ms_5',
    title: 'Has your opinion on our brand changed since you last shopped with us?',
    type: 'Binary Choice',
    typeIcon: '🔤',
    options: ['Yes', 'No']
  },
  {
    id: 'ms_6',
    title: 'How has it changed?',
    type: 'Long Answer',
    typeIcon: '💬',
    conditionText: 'If Has your opinion on our brand changed since you last shopped with us? is Yes',
    showSlideBadge: true
  },
  {
    id: 'ms_7',
    title: 'Thanks!',
    type: 'Promo Code',
    typeIcon: '🎁',
    options: ['THANKYOU10']
  }
];

const SLIDE_QUESTIONS_TEMPLATES: SlideQuestionTemplate[] = [
  {
    id: 'how_hear',
    title: 'How did you hear about us?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'On-Site'],
    options: ['Search engine (Google, Bing)', 'Social media (TikTok, Instagram)', 'Friend or family recommendation', 'Podcast or Youtube', 'Other']
  },
  {
    id: 'what_led_store',
    title: 'What led you to our store today?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'On-Site'],
    options: ['Looking for a specific item', 'Saw an ad on social media', 'Browsing for deals', 'Repeat customer recommendation']
  },
  {
    id: 'when_first_hear',
    title: 'When did you first hear about us?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'Order Delivered'],
    options: ['Less than a day', 'Less than a week', 'Less than a month', 'Over a month ago']
  },
  {
    id: 'what_brought_site',
    title: 'What brought you to our site today?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['On-Site', 'Post Purchase'],
    options: ['Searching for products', 'Direct recommendation', 'Saw a promotion / ad', 'Email newsletter']
  },
  {
    id: 'how_long_know',
    title: 'How long did you know about us before placing your first purchase?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase'],
    options: ['Less than a day', 'Less than a week', 'Less than a month', '1 - 3 months', '3 - 12 months', 'Over 12 months']
  },
  {
    id: 'when_first_learn',
    title: 'When did you first learn about us?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase'],
    options: ['Today', 'Earlier this week', 'In the past month', 'More than 3 months ago']
  },
  {
    id: 'what_stopping_purchase',
    title: "What's stopping you from making a purchase?",
    type: 'Multiple Choice',
    typeIcon: '☑️',
    pairedWith: ['Exit Intent', 'On-Site'],
    options: ['Shipping fees were too high', 'Just comparing options', 'Need more product reviews', 'Decided to buy later', 'Other']
  },
  {
    id: 'do_you_have_questions',
    title: 'Do you have any questions for us?',
    type: 'Short Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase', 'On-Site']
  },
  {
    id: 'competitors_better',
    title: 'What do our competitors do better than us?',
    type: 'Short Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase']
  },
  {
    id: 'whats_occupation',
    title: "What's your occupation?",
    type: 'Short Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase']
  },
  {
    id: 'shopping_experience',
    title: 'How was your shopping experience?',
    type: 'Satisfaction',
    typeIcon: '🎭',
    pairedWith: ['Post Purchase']
  },
  {
    id: 'who_purchase_for',
    title: 'Who is this purchase for?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'Order Delivered'],
    options: ['Myself', 'Friend or family', 'Coworker or client', 'Other']
  },
  {
    id: 'how_old',
    title: 'Approximately how old are you?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'On-Site'],
    options: ['Under 18', '18 - 24', '25 - 34', '35 - 44', '45 - 54', '55+']
  },
  {
    id: 'what_purchase_for',
    title: 'What is this purchase for?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase', 'Order Delivered']
  },
  {
    id: 'how_often_shop',
    title: 'How often do you shop?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['On-Site'],
    options: ['Multiple times a week', 'Once a week', 'Once a month', 'A few times a year']
  },
  {
    id: 'most_important_shopping',
    title: 'What is most important when shopping for products like ours?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'On-Site'],
    options: ['High quality materials', 'Competitive price', 'Fast & free shipping', 'Great customer service']
  },
  {
    id: 'generation_identify',
    title: 'What generation do you identify with?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'Order Delivered'],
    options: ['Gen Z', 'Millennial', 'Gen X', 'Baby Boomer']
  },
  {
    id: 'happy_product_selection',
    title: 'Are you happy with our product selection?',
    type: 'Single Choice',
    typeIcon: '✔️',
    pairedWith: ['Post Purchase', 'Order Delivered'],
    options: ['Yes, loved it!', 'It was okay', 'No, missing items']
  },
  {
    id: 'biggest_competitors',
    title: 'Who do you think our biggest competitors are?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase', 'Order Delivered']
  },
  {
    id: 'important_fast_shipping',
    title: 'How important is fast shipping to you?',
    type: 'Range',
    typeIcon: '📊',
    pairedWith: ['Post Purchase', 'On-Site'],
    minLabel: 'Not Important',
    maxLabel: 'Very Important'
  },
  {
    id: 'do_we_stand_out',
    title: 'Do we stand out?',
    type: 'Binary Choice',
    typeIcon: '🔤',
    pairedWith: ['Post Purchase', 'On-Site'],
    options: ['Yes', 'No']
  },
  {
    id: 'recommend_friend',
    title: 'Would you recommend us to a friend?',
    type: 'Binary Choice',
    typeIcon: '🔤',
    pairedWith: ['Post Purchase', 'On-Site'],
    options: ['Yes', 'No']
  },
  {
    id: 'website_difficult',
    title: 'Was any part of this website difficult to navigate?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['On-Site', 'Post Purchase']
  },
  {
    id: 'wish_we_had_more',
    title: 'What do you wish we had more of?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['On-Site', 'Exit Intent', 'Post Purchase']
  },
  {
    id: 'thank_for_purchase',
    title: 'Who can we thank for your purchase today?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase']
  },
  {
    id: 'something_love_doing',
    title: "What's something you love doing?",
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['On-Site', 'Post Purchase']
  },
  {
    id: 'favorite_thing_brand',
    title: "What's your favorite thing about our brand?",
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase', 'On-Site']
  },
  {
    id: 'enjoy_most_experience',
    title: 'What did you enjoy most about your experience?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase']
  },
  {
    id: 'feature_want_have',
    title: 'What feature do you want us to have?',
    type: 'Long Answer',
    typeIcon: '💬',
    pairedWith: ['Post Purchase']
  }
];

interface OnboardingWizardProps {
  onComplete: (workspace: Workspace, initialSurvey: Survey) => void;
  userEmail: string;
  onBack?: () => void;
  onGoToLanding?: () => void;
}

export default function OnboardingWizard({ onComplete, userEmail, onBack, onGoToLanding }: OnboardingWizardProps) {
  // Wizard Steps: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [maxStepReached, setMaxStepReached] = useState<1 | 2 | 3>(1);

  // --- PERSISTENT SIDEBAR & MODE STATES ---
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('Surveys');
  const [step2Mode, setStep2Mode] = useState<'templates' | 'slides' | 'scratch'>('templates');
  const [isSurveyHidden, setIsSurveyHidden] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(5);

  // --- STEP 1 STATE ---
  const [websiteUrl, setWebsiteUrl] = useState('https://yourwebsite.com');
  const [activePlatform, setActivePlatform] = useState<string>('Custom Website');
  const [verifyMethod, setVerifyMethod] = useState<'script' | 'dns' | 'meta'>('script');
  
  // Shopify Modal & OAuth Flow state
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const [shopifyDomainInput, setShopifyDomainInput] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cl_shopify_shop') : null;
    return saved || '';
  });
  const [isInstallingShopify, setIsInstallingShopify] = useState(false);
  const [shopifyInstallStep, setShopifyInstallStep] = useState<'prompt' | 'installing' | 'success'>('prompt');

  const handleConnectShopifyDirect = () => {
    const rawInput = shopifyDomainInput && shopifyDomainInput.trim() ? shopifyDomainInput.trim() : '';
    if (!rawInput) {
      setShowShopifyModal(true);
      return;
    }
    const cleanShopDomain = rawInput.includes('.') ? rawInput : `${rawInput}.myshopify.com`;
    const fullUrl = cleanShopDomain.startsWith('http') ? cleanShopDomain : `https://${cleanShopDomain}`;

    setWebsiteUrl(fullUrl);
    setActivePlatform('Shopify');

    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(cleanShopDomain)}`;
  };

  // Step 1 completion check: Completed if shopify is installed, custom domain is set, or maxStepReached >= 2
  const isStep1Completed = useMemo(() => {
    return (
      shopifyInstallStep === 'success' ||
      (Boolean(websiteUrl) && websiteUrl !== 'https://yourwebsite.com' && websiteUrl.trim().length > 0) ||
      maxStepReached >= 2
    );
  }, [shopifyInstallStep, websiteUrl, maxStepReached]);

  // Dynamic connected app / store name (from Shopify integration or website URL)
  const connectedAppName = useMemo(() => {
    if (shopifyDomainInput && shopifyDomainInput.trim()) {
      const cleaned = shopifyDomainInput
        .replace(/^https?:\/\//i, '')
        .replace(/\.myshopify\.com$/i, '')
        .split('/')[0]
        .trim();
      if (cleaned) return cleaned.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    if (websiteUrl && websiteUrl !== 'https://yourwebsite.com') {
      const cleaned = websiteUrl
        .replace(/^https?:\/\//i, '')
        .split('/')[0]
        .split('.')[0]
        .trim();
      if (cleaned) return cleaned.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Your Store';
  }, [shopifyDomainInput, websiteUrl]);
  
  // Script verification progress state
  const [isVerifying, setIsVerifying] = useState(false);
  const [progressIndex, setProgressIndex] = useState<number>(5); // Auto-connected
  const [copied, setCopied] = useState(false);

  // --- STEP 2 TEMPLATES STATE & LIST ---
  const [templateSearchFilter, setTemplateSearchFilter] = useState<string>('');
  const ALL_FILTER_CATEGORIES = useMemo(() => [
    'Post Purchase',
    'Attribution & Discovery',
    'Customer Satisfaction',
    'Software (SaaS)',
    'Exit Intent & Abandoned Cart',
    'Feedback & Optimization',
    'Engagement'
  ], []);

  const REWARD_ATTRACTION_TEMPLATES = useMemo(() => [
    { id: '10_off', label: '🎁 Get 10% OFF on your order', text: 'Get 10% OFF your order after completing this 15-second survey!' },
    { id: 'coupon', label: '🏷️ Unlock $10 Coupon Code', text: '🎁 Complete in 15s to unlock $10 OFF coupon code: LENS10' },
    { id: 'shipping', label: '🚚 Get Free Express Shipping Code', text: '🚚 Complete this quick survey to claim Free Express Shipping on your order!' },
    { id: 'mystery', label: '🎉 Unlock Mystery 15% OFF Discount', text: '🎉 Complete survey to unlock a mystery 15% OFF discount code!' },
    { id: 'points', label: '⭐ Earn 100 VIP Loyalty Points', text: '⭐ Earn 100 bonus loyalty points immediately after completing this survey.' },
    { id: 'gift', label: '🛍️ Get Free Sample Gift With Order', text: '🛍️ Complete this survey to receive a free sample gift with your purchase.' }
  ], []);

  const [isRewardDropdownOpen, setIsRewardDropdownOpen] = useState<boolean>(false);
  const [rewardSearchText, setRewardSearchText] = useState<string>('');
  const [rewardCustomInput, setRewardCustomInput] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Let AI Decide',
    'General',
    'Manual',
    'Ecommerce',
    'Email & SMS',
    'Post Purchase',
    'Attribution & Discovery',
    'Customer Satisfaction',
    'Software (SaaS)',
    'Exit Intent & Abandoned Cart',
    'Feedback & Optimization',
    'Engagement'
  ]);
  const [categoryFilterSearch, setCategoryFilterSearch] = useState<string>('');
  const [isFilterCategoriesOpen, setIsFilterCategoriesOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('cancellation_survey');

  // Interactive Motion Preview States
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(0);
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState<string | null>(null);
  const [isPreviewThankYou, setIsPreviewThankYou] = useState<boolean>(false);

  // --- STEP 2 SUB-SECTIONS & AI BUILDER STATES ---
  const [step2SubSection, setStep2SubSection] = useState<'all' | 'questions' | 'appearance' | 'aistrategy' | 'behavior'>('questions');
  const [selectedSurveyGoal, setSelectedSurveyGoal] = useState<string>('Understand why visitors leave');

  // Survey Behavior Options State
  const [aiAdaptiveOptions, setAiAdaptiveOptions] = useState<boolean>(true);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isCustomizeDrawerOpen, setIsCustomizeDrawerOpen] = useState<boolean>(false);
  const [customizeTab, setCustomizeTab] = useState<'theme' | 'branding' | 'layout' | 'animation'>('theme');
  
  // Customization Options
  const [surveyThemeColor, setSurveyThemeColor] = useState<string>('#008060');
  const [surveyFont, setSurveyFont] = useState<string>('Sans-Serif');
  const [surveyButtonShape, setSurveyButtonShape] = useState<string>('Rounded');
  const [surveyBorderRadius, setSurveyBorderRadius] = useState<string>('16px');
  const [surveyLogo, setSurveyLogo] = useState<string>('CustomerLens');
  const [surveyBg, setSurveyBg] = useState<string>('#FFFFFF');
  const [surveyBgImage, setSurveyBgImage] = useState<string>('None');
  const [surveyDoodles, setSurveyDoodles] = useState<boolean>(true);
  const [surveyLayout, setSurveyLayout] = useState<string>('Bottom Right');
  const [surveyAnimation, setSurveyAnimation] = useState<string>('Slide');

  // --- SLIDE QUESTIONS & MANAGEMENT STATES ---
  const [questionViewMode, setQuestionViewMode] = useState<'picker' | 'management'>('picker');
  const [managedSlides, setManagedSlides] = useState<ManagedSlideItem[]>(INITIAL_MANAGED_SLIDES);
  const [activeManagedSlideId, setActiveManagedSlideId] = useState<string>('ms_5');
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState<boolean>(false);

  const activeManagedSlide = useMemo(() => {
    return managedSlides.find(s => s.id === activeManagedSlideId) || managedSlides[0];
  }, [activeManagedSlideId, managedSlides]);

  const [slideSearchQuery, setSlideSearchQuery] = useState<string>('');
  const [selectedSlideId, setSelectedSlideId] = useState<string>('how_long_know');
  const [isUsePromptOpen, setIsUsePromptOpen] = useState<boolean>(false);
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [customSlideTemplates, setCustomSlideTemplates] = useState<SlideQuestionTemplate[]>(SLIDE_QUESTIONS_TEMPLATES);

  const handleCreateSlideFromTemplate = () => {
    if (!activeSlideTemplate) return;

    const newMainId = 'ms_' + Math.random().toString(36).substring(2, 7);
    const mainSlide: ManagedSlideItem = {
      id: newMainId,
      title: activeSlideTemplate.title,
      type: activeSlideTemplate.type,
      typeIcon: activeSlideTemplate.typeIcon,
      options: activeSlideTemplate.options || (
        activeSlideTemplate.type === 'Binary Choice' ? ['Yes', 'No'] :
        activeSlideTemplate.type === 'Satisfaction' ? ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] :
        ['Option 1', 'Option 2', 'Option 3']
      )
    };

    const followUps: ManagedSlideItem[] = [];

    if (activeSlideTemplate.type === 'Satisfaction') {
      followUps.push(
        {
          id: 'ms_fu1_' + Math.random().toString(36).substring(2, 7),
          title: 'Sorry you feel that way.',
          type: 'Long Answer',
          typeIcon: '💬',
          conditionText: `If ${activeSlideTemplate.title} is Very Unsatisfied or ${activeSlideTemplate.title} is Unsatisfied`,
          showSlideBadge: true
        },
        {
          id: 'ms_fu2_' + Math.random().toString(36).substring(2, 7),
          title: "We're happy to hear that!",
          type: 'Long Answer',
          typeIcon: '💬',
          conditionText: `If ${activeSlideTemplate.title} is Satisfied or ${activeSlideTemplate.title} is Very Satisfied`,
          showSlideBadge: true
        }
      );
    } else if (activeSlideTemplate.type === 'Binary Choice') {
      followUps.push({
        id: 'ms_fu1_' + Math.random().toString(36).substring(2, 7),
        title: 'How has it changed?',
        type: 'Long Answer',
        typeIcon: '💬',
        conditionText: `If ${activeSlideTemplate.title} is Yes`,
        showSlideBadge: true
      });
    } else {
      followUps.push({
        id: 'ms_fu1_' + Math.random().toString(36).substring(2, 7),
        title: 'Can you share any additional details?',
        type: 'Long Answer',
        typeIcon: '💬',
        conditionText: `If ${activeSlideTemplate.title} is answered`,
        showSlideBadge: true
      });
    }

    setManagedSlides(prev => {
      const thankYouIndex = prev.findIndex(s => s.type === 'Promo Code' || s.title.toLowerCase().includes('thanks'));
      if (thankYouIndex !== -1) {
        const copy = [...prev];
        copy.splice(thankYouIndex, 0, mainSlide, ...followUps);
        return copy;
      }
      return [...prev, mainSlide, ...followUps];
    });
    setActiveManagedSlideId(mainSlide.id);
    setQuestionViewMode('management');
  };

  const filteredSlideTemplates = useMemo(() => {
    let list = customSlideTemplates;
    if (selectedCategories.length < ALL_FILTER_CATEGORIES.length) {
      list = list.filter(t => 
        t.pairedWith.some(p => selectedCategories.includes(p)) ||
        selectedCategories.some(c => t.title.toLowerCase().includes(c.toLowerCase()))
      );
    }
    if (slideSearchQuery.trim()) {
      const q = slideSearchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.type.toLowerCase().includes(q) || 
        t.pairedWith.some(p => p.toLowerCase().includes(q))
      );
    }
    return list;
  }, [slideSearchQuery, customSlideTemplates, selectedCategories, ALL_FILTER_CATEGORIES]);

  const activeSlideTemplate = useMemo(() => {
    return customSlideTemplates.find(t => t.id === selectedSlideId) || customSlideTemplates[0];
  }, [selectedSlideId, customSlideTemplates]);

  // AI Strategy selections
  const [whenToAppear, setWhenToAppear] = useState<string>('Let AI Decide (Recommended)');
  const [whoToSee, setWhoToSee] = useState<string>('AI Chooses Audience (Recommended)');
  const [rewardType, setRewardType] = useState<string>('AI Suggests Best Reward');

  // Interactive Editable Questions List
  const [surveyQuestions, setSurveyQuestions] = useState([
    { id: 'q1', type: 'Multiple Choice', title: 'What is the main reason you visited our store today?', choices: ['Looking for specific products', 'Just browsing around', 'Checking prices / discounts', 'Need customer support'] },
    { id: 'q2', type: 'Rating', title: 'How easy was it to find what you were looking for?', choices: ['1', '2', '3', '4', '5'] },
    { id: 'q3', type: 'Text Answer', title: 'Is there anything stopping you from making a purchase today?', choices: [] },
  ]);

  // Step 2 completion check: Completed if at least 1 question is configured or maxStepReached >= 3
  const isStep2Completed = useMemo(() => {
    return surveyQuestions.length > 0 || maxStepReached >= 3;
  }, [surveyQuestions.length, maxStepReached]);

  // Strict Navigation Control: Cannot go forward without completing current step, but CAN go back!
  const handleGoToStep = (targetStep: 1 | 2 | 3) => {
    if (targetStep === step) return;

    // GOING BACK: Always permitted!
    if (targetStep < step) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // GOING NEXT: Must complete current step before advancing
    if (step === 1 && targetStep >= 2) {
      if (!isStep1Completed) {
        if (websiteUrl && websiteUrl.trim().length > 0) {
          setWebsiteUrl(websiteUrl);
        } else {
          setWebsiteUrl('https://your-store.myshopify.com');
        }
      }
      setMaxStepReached(prev => Math.max(prev, 2) as 1 | 2 | 3);
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (step === 2 && targetStep === 3) {
      if (!isStep2Completed) {
        alert("Please select at least 1 survey question in Step 2 before proceeding to Step 3.");
        return;
      }
      setMaxStepReached(prev => Math.max(prev, 3) as 1 | 2 | 3);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetStep <= maxStepReached) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!isStep1Completed) {
        handleConnectShopifyDirect();
      } else {
        alert("Please complete the current step before advancing.");
      }
    }
  };

  // --- STEP 3 BEHAVIOR TOGGLES & SURVEY CREATION STATES ---
  const [allowEdits, setAllowEdits] = useState<boolean>(false);
  const [autoAdvanceSlides, setAutoAdvanceSlides] = useState<boolean>(true);
  const [allowResubmissions, setAllowResubmissions] = useState<boolean>(false);
  const [notifyOnResponse, setNotifyOnResponse] = useState<boolean>(true);

  // Survey Creation States for "Make one survey then another then another"
  const [newSurveyTitle, setNewSurveyTitle] = useState<string>('EXPERIENCE');
  const [createdSurveysList, setCreatedSurveysList] = useState<any[]>([]);
  const [showSurveyCreatedSuccessModal, setShowSurveyCreatedSuccessModal] = useState<boolean>(false);
  const [createdSurveyName, setCreatedSurveyName] = useState<string>('');

  const handleCreateSurvey = () => {
    const finalTitle = newSurveyTitle.trim() || 'EXPERIENCE';
    setCreatedSurveyName(finalTitle);

    const newSurveyItem = {
      id: 'survey_' + Math.random().toString(36).substring(2, 9),
      title: finalTitle,
      delivery: whenToAppear === 'Let AI Decide (Recommended)' ? 'Homepage Modal' : whenToAppear,
      questionsCount: managedSlides.length || 3,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active'
    };

    setCreatedSurveysList(prev => [newSurveyItem, ...prev]);
    setShowSurveyCreatedSuccessModal(true);
  };

  const handleCreateAnotherSurvey = () => {
    setShowSurveyCreatedSuccessModal(false);
    setNewSurveyTitle('');
    // Resets to Questions step so user can immediately make another survey!
    setStep(2);
    setStep2SubSection('questions');
    setQuestionViewMode('picker');
  };

  const activeTemplate = ZIGPOLL_TEMPLATES.find(t => t.id === selectedTemplateId) || ZIGPOLL_TEMPLATES[0];

  const handleSelectTemplate = (tpl: ZigpollTemplate) => {
    setSelectedTemplateId(tpl.id);
    setSurveyConfig(prev => ({
      ...prev,
      title: tpl.title,
      headline: tpl.previewTitle,
      questionText: tpl.previewTitle,
      options: tpl.options || prev.options,
      trigger: tpl.recommended[0] || prev.trigger
    }));
  };

  // --- STEP 2 STATE: DIVIDED INTO 3 CLEAR SECTIONS ---
  const [activeStep2Section, setActiveStep2Section] = useState<1 | 2 | 3>(1);

  // SECTION 1: AI Audit & Business Goal Prompt
  const [businessAim, setBusinessAim] = useState<string>('');
  const [selectedAimTags, setSelectedAimTags] = useState<string[]>([]);
  
  // AI Website Audit Suggestions (1 to 5 AI findings on the connected site)
  const [isScanningSite, setIsScanningSite] = useState(false);
  const [aiAuditSuggestions, setAiAuditSuggestions] = useState<Array<{ id: number; title: string; issue: string; impact: 'High' | 'Medium'; icon: string }>>([
    {
      id: 1,
      title: 'Cart Checkout Dropoff',
      issue: 'High cart drop-off detected on mobile — unexpected shipping costs cause hesitation.',
      impact: 'High',
      icon: '🛒'
    },
    {
      id: 2,
      title: 'Pricing Page Friction',
      issue: 'Pricing page visitors linger over 18s without selecting a plan — billing options lack instant clarity.',
      impact: 'High',
      icon: '🏷️'
    },
    {
      id: 3,
      title: 'Product Detail Hesitation',
      issue: 'High scroll depth (>70%) on product detail pages without add-to-cart clicks — missing instant Q&A help.',
      impact: 'Medium',
      icon: '🔍'
    },
    {
      id: 4,
      title: 'First-Time Traffic Bounce',
      issue: 'First-time visitors from Google Ads scroll up and down repeatedly searching for discount coupons.',
      impact: 'High',
      icon: '🎯'
    },
    {
      id: 5,
      title: 'Navigation Confusion',
      issue: 'Header navigation layout lacks clear value proposition CTA for mobile users.',
      impact: 'Medium',
      icon: '⚡'
    }
  ]);

  // SECTION 2: Behavioral AI Survey Studio & Customizer
  const FONT_OPTIONS = [
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Clean Modern Sans', family: "'Plus Jakarta Sans', sans-serif" },
    { id: 'Playfair Display', label: 'Playfair Display', category: 'Luxury High-Contrast Serif', family: "'Playfair Display', serif" },
    { id: 'Space Grotesk', label: 'Space Grotesk', category: 'Tech & Geometric', family: "'Space Grotesk', sans-serif" },
    { id: 'Outfit', label: 'Outfit', category: 'Clean E-Commerce', family: "'Outfit', sans-serif" },
    { id: 'Inter', label: 'Inter', category: 'Standard UI Minimalist', family: "'Inter', sans-serif" },
    { id: 'Poppins', label: 'Poppins', category: 'Friendly Geometry', family: "'Poppins', sans-serif" },
    { id: 'Fredoka', label: 'Fredoka', category: 'Soft Playful Rounded', family: "'Fredoka', sans-serif" },
    { id: 'Cinzel', label: 'Cinzel', category: 'Royal Classical Serif', family: "'Cinzel', serif" },
    { id: 'Lora', label: 'Lora', category: 'Editorial Reading Serif', family: "'Lora', serif" },
    { id: 'Roboto Mono', label: 'Roboto Mono', category: 'Monospace Code', family: "'Roboto Mono', monospace" },
    { id: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Tech Developer Monospace', family: "'JetBrains Mono', monospace" },
    { id: 'Cabinet Grotesk', label: 'Cabinet Grotesk', category: 'Bold Display Heading', family: "'Cabinet Grotesk', sans-serif" },
    { id: 'Syne', label: 'Syne', category: 'Avant-Garde Artistic', family: "'Syne', sans-serif" },
    { id: 'Oswald', label: 'Oswald', category: 'High-Impact Condensed', family: "'Oswald', sans-serif" },
    { id: 'Caveat', label: 'Caveat', category: 'Casual Cursive Handwriting', family: "'Caveat', cursive" },
    { id: 'Montserrat', label: 'Montserrat', category: 'Premium Geometric Sans', family: "'Montserrat', sans-serif" },
    { id: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'Boutique Fine Elegance', family: "'Cormorant Garamond', serif" }
  ];

  const [customizerTab, setCustomizerTab] = useState<'edit' | 'ai'>('edit');
  const [selectedFont, setSelectedFont] = useState<string>('Plus Jakarta Sans');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState<boolean>(false);
  const [doodleMotion, setDoodleMotion] = useState<'none' | 'bounce' | 'pulse' | 'spin' | 'wiggle' | 'float'>('bounce');
  
  const [surveyFontFamily, setSurveyFontFamily] = useState<'sans' | 'serif' | 'mono' | 'rounded' | 'display'>('sans');
  const [surveyShape, setSurveyShape] = useState<'rounded-2xl' | 'rounded-3xl' | 'rounded-xl' | 'rounded-md' | 'rounded-none'>('rounded-2xl');
  const [aiPromptInput, setAiPromptInput] = useState('Create a high conversion survey for exit intent shoppers with emerald accents, soft rounded shape, and 10% discount code.');
  const [isGeneratingAiPrompt, setIsGeneratingAiPrompt] = useState(false);

  const [surveyIncentive, setSurveyIncentive] = useState('');
  const [selectedBehavioralTrigger, setSelectedBehavioralTrigger] = useState<string>('Smart Exit Intent (only when appropriate)');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([
    'Smart Exit Intent (only when appropriate)',
    'Scroll Hesitation (scrolling >15s)'
  ]);
  const [surveyFormat, setSurveyFormat] = useState<'5-6 Question Slide' | 'AI Cart Box' | 'Page-Specific Trigger' | 'Conversational Popover'>('5-6 Question Slide');
  const [previewSlideStep, setPreviewSlideStep] = useState<number>(1);
  const [previewSelectedOption, setPreviewSelectedOption] = useState<number | null>(null);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);

  // Dropdown list toggles (expandable with down arrow) & Free space dimension controls
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState<boolean>(false);
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState<boolean>(false);
  const [isTriggerDropdownOpen, setIsTriggerDropdownOpen] = useState<boolean>(false);
  const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState<boolean>(true);

  // New Appearance Page State: Color Picker & Long Font Selector List
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
  const [isFontPickerOpen, setIsFontPickerOpen] = useState<boolean>(false);
  const [fontSearchQuery, setFontSearchQuery] = useState<string>('');

  // Add Question (Slide) Modal & Add AI Follow-Up Modal States
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState<boolean>(false);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState<boolean>(false);

  // Form State for Add Question Modal
  const [newQuestionTitle, setNewQuestionTitle] = useState<string>('');
  const [newQuestionType, setNewQuestionType] = useState<'Single Choice' | 'Multiple Choice' | 'Satisfaction' | 'Long Answer' | 'Short Answer' | 'Binary Choice' | 'Range'>('Single Choice');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [newOptionInput, setNewOptionInput] = useState<string>('');

  // Form State for Add AI Follow-up Modal
  const [followUpParentSlideId, setFollowUpParentSlideId] = useState<string>('');
  const [followUpConditionText, setFollowUpConditionText] = useState<string>('If customer gives unsatisfied rating or hesitates');
  const [followUpTitle, setFollowUpTitle] = useState<string>('How can we make this experience better for you?');
  const [followUpType, setFollowUpType] = useState<'Long Answer' | 'Short Answer' | 'Multiple Choice' | 'Satisfaction'>('Long Answer');

  const handleAddNewCustomQuestion = () => {
    if (!newQuestionTitle.trim()) return;

    const newSlideId = 'ms_' + Math.random().toString(36).substring(2, 7);
    const typeIconsMap: Record<string, string> = {
      'Single Choice': '🔘',
      'Multiple Choice': '☑️',
      'Satisfaction': '😍',
      'Long Answer': '💬',
      'Short Answer': '✏️',
      'Binary Choice': '⚖️',
      'Range': '📊'
    };

    const newSlide: ManagedSlideItem = {
      id: newSlideId,
      title: newQuestionTitle.trim(),
      type: newQuestionType as any,
      typeIcon: typeIconsMap[newQuestionType] || '❓',
      options: ['Single Choice', 'Multiple Choice', 'Binary Choice'].includes(newQuestionType) ? [...newQuestionOptions] : undefined
    };

    setManagedSlides(prev => {
      const thankYouIndex = prev.findIndex(s => s.type === 'Promo Code' || s.title.toLowerCase().includes('thanks'));
      if (thankYouIndex !== -1) {
        const copy = [...prev];
        copy.splice(thankYouIndex, 0, newSlide);
        return copy;
      }
      return [...prev, newSlide];
    });

    setActiveManagedSlideId(newSlideId);
    setNewQuestionTitle('');
    setNewQuestionOptions(['Option 1', 'Option 2', 'Option 3']);
    setIsAddQuestionModalOpen(false);
    setQuestionViewMode('management');
  };

  const handleAddNewAiFollowUp = () => {
    if (!followUpTitle.trim()) return;

    const targetParent = managedSlides.find(s => s.id === followUpParentSlideId) || managedSlides[0];
    const parentTitle = targetParent ? targetParent.title : 'question';

    const newFollowUpId = 'ms_fu_' + Math.random().toString(36).substring(2, 7);
    const newFollowUpSlide: ManagedSlideItem = {
      id: newFollowUpId,
      title: followUpTitle.trim(),
      type: followUpType as any,
      typeIcon: '🤖',
      conditionText: followUpConditionText.trim() ? followUpConditionText.trim() : `If ${parentTitle} triggers follow-up`,
      showSlideBadge: true
    };

    setManagedSlides(prev => {
      const parentIdx = prev.findIndex(s => s.id === (targetParent?.id || ''));
      if (parentIdx !== -1) {
        const copy = [...prev];
        copy.splice(parentIdx + 1, 0, newFollowUpSlide);
        return copy;
      }
      return [...prev, newFollowUpSlide];
    });

    setActiveManagedSlideId(newFollowUpId);
    setFollowUpTitle('How can we make this experience better for you?');
    setIsAddFollowUpModalOpen(false);
    setQuestionViewMode('management');
  };

  // Interactive Live Motion Preview State (Question -> AI Talking -> Thank You)
  const [interactiveStage, setInteractiveStage] = useState<'question' | 'ai_talking' | 'thank_you'>('question');
  const [selectedPreviewAnswer, setSelectedPreviewAnswer] = useState<string | null>(null);
  const [aiFollowUpAnswer, setAiFollowUpAnswer] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  const [widgetWidth, setWidgetWidth] = useState<number>(360);
  const [widgetAspect, setWidgetAspect] = useState<'auto' | 'square' | 'wide'>('auto');
  
  const [surveyConfig, setSurveyConfig] = useState<GeneratedSurveyConfig>({
    id: 'sv_shop_1',
    goalId: 'Reduce Cart Abandonment',
    goalLabel: 'Reduce Cart Abandonment',
    goalIcon: '🛍️',
    title: 'Smart Customer Intent Survey',
    trigger: 'Smart Exit Intent Algorithm',
    questionsCount: 4,
    completion: '15 seconds',
    rate: 'Very High (24%)',
    accentColor: '#008060', // Shopify Emerald Green accent
    bgColor: '#ffffff',
    bgImageUrl: '',
    logoDoodle: '', // Default doodle is NOT there
    logoUrl: '',
    sizePosition: 'Bottom Right Widget',
    headline: 'Before you fly away...',
    questionText: 'What is keeping you from completing your order today?',
    options: [
      'Unexpected shipping or taxes',
      'Comparing prices on other stores',
      'Payment method not available',
      'Just browsing for now'
    ],
    incentiveText: '🎁 Complete in 15s to unlock 10% OFF coupon code: LENS10',
    aiTone: 'Friendly & Casual',
    formatType: '5-6 Question Slide',
    isExpanded: true
  });

  const handleApplyAiPrompt = (overridePrompt?: string) => {
    const promptToUse = overridePrompt || aiPromptInput;
    if (!promptToUse.trim()) return;

    setIsGeneratingAiPrompt(true);

    setTimeout(() => {
      const lower = promptToUse.toLowerCase();

      let newAccent = '#008060';
      let newFont: 'sans' | 'serif' | 'mono' | 'rounded' | 'display' = 'sans';
      let newShape: 'rounded-2xl' | 'rounded-3xl' | 'rounded-xl' | 'rounded-md' | 'rounded-none' = 'rounded-2xl';
      let newTone: any = 'Friendly & Casual';
      let newDoodle = ''; // Default doodle is empty
      let newHeadline = 'Before you fly away...';
      let newQuestion = 'What is keeping you from completing your order today?';
      let newIncentive = '🎁 Complete in 15s to unlock 10% OFF coupon code: LENS10';

      if (lower.includes('luxury') || lower.includes('gold') || lower.includes('vip') || lower.includes('premium')) {
        newAccent = '#D4AF37';
        newFont = 'serif';
        newShape = 'rounded-2xl';
        newTone = 'Luxury & Exclusive';
        newDoodle = '👑';
        newHeadline = 'Exclusive VIP Offer';
        newQuestion = 'How can we tailor your boutique shopping experience today?';
        newIncentive = '💎 VIP Privilege: Save 15% on your order with code VIP15';
      } else if (lower.includes('red') || lower.includes('urgency') || lower.includes('flash') || lower.includes('bold')) {
        newAccent = '#E11D48';
        newFont = 'display';
        newShape = 'rounded-md';
        newTone = 'Professional & Direct';
        newDoodle = '🔥';
        newHeadline = 'Wait! Don’t miss your special deal!';
        newQuestion = 'What would make you complete your order right now?';
        newIncentive = '⚡ Flash Deal: 20% OFF if completed in 30 seconds!';
      } else if (lower.includes('green') || lower.includes('eco') || lower.includes('nature') || lower.includes('fresh')) {
        newAccent = '#059669';
        newFont = 'rounded';
        newShape = 'rounded-3xl';
        newTone = 'Empathetic & Helpful';
        newDoodle = '🌿';
        newHeadline = 'We value your opinion!';
        newQuestion = 'Is there anything we can help clarify before you leave?';
        newIncentive = '🍃 Unlocked: Free shipping on your next order!';
      } else if (lower.includes('blue') || lower.includes('tech') || lower.includes('corporate') || lower.includes('saas')) {
        newAccent = '#2563EB';
        newFont = 'mono';
        newShape = 'rounded-xl';
        newTone = 'Professional & Direct';
        newDoodle = '⚡';
        newHeadline = 'Quick 1-Minute Feedback';
        newQuestion = 'What feature or detail were you looking for today?';
        newIncentive = '📊 Instant Access: Unlock full store preview insights';
      } else if (lower.includes('pink') || lower.includes('playful') || lower.includes('fun')) {
        newAccent = '#EC4899';
        newFont = 'rounded';
        newShape = 'rounded-3xl';
        newTone = 'Playful & Fun';
        newDoodle = '✨';
        newHeadline = 'Hey friend! Quick question!';
        newQuestion = 'What stopped your shopping spree today?';
        newIncentive = '🎉 Mystery Discount: Unlock 15% OFF inside!';
      }

      setSurveyFontFamily(newFont);
      setSurveyShape(newShape);
      setSurveyConfig(prev => ({
        ...prev,
        accentColor: newAccent,
        logoDoodle: newDoodle,
        headline: newHeadline,
        questionText: newQuestion,
        incentiveText: newIncentive,
        aiTone: newTone
      }));

      setIsGeneratingAiPrompt(false);
    }, 500);
  };

  // SECTION 3: Insights & Analytics Delivery Preferences
  const [selectedInsightDelivery, setSelectedInsightDelivery] = useState<string[]>([
    'notifications',
    'chat',
    'charts',
    'sales_strategy'
  ]);

  // Notification Bulletin Schedule Settings Modal State
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);
  const [bulletinTime, setBulletinTime] = useState('21:00'); // Default Evening 9:00 PM
  const [selectedNotificationChannels, setSelectedNotificationChannels] = useState<string[]>([
    'Direct Notification from CustomerLens',
    'Gmail / Email'
  ]);
  const [notificationFrequencyDaysNum, setNotificationFrequencyDaysNum] = useState<number>(1);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'idle' | 'saved' | 'reset'>('idle');

  const handleResetBulletinSettings = () => {
    setBulletinTime('21:00');
    setSelectedNotificationChannels(['Direct Notification from CustomerLens', 'Gmail / Email']);
    setNotificationFrequencyDaysNum(1);
    setSettingsSaveStatus('reset');
    setTimeout(() => setSettingsSaveStatus('idle'), 3000);
  };

  const handleSaveBulletinSettings = () => {
    setSettingsSaveStatus('saved');
    setTimeout(() => {
      setSettingsSaveStatus('idle');
      setShowNotificationSettingsModal(false);
    }, 1000);
  };

  // Handle toggling delivery channels
  const toggleDeliveryChannel = (channelId: string) => {
    setSelectedInsightDelivery(prev => {
      if (prev.includes(channelId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };

  const handleSelectAllDeliveryChannels = () => {
    setSelectedInsightDelivery(['notifications', 'chat', 'charts', 'sales_strategy']);
  };

  // --- STEP 3 STATE ---
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishComplete, setPublishComplete] = useState(false);

  // Connection progress steps for Step 1
  const connectionProgressItems = [
    'Shopify / Website domain verified',
    'CustomerLens script embedded',
    'Website structure & catalog scanned',
    'AI behavioral triggers activated',
    'Survey studio synchronized',
    'CustomerLens AI workspace live'
  ];

  // Integration Platforms List
  const platforms = [
    { name: 'Shopify', icon: '🛍', defaultUrl: 'https://your-store.myshopify.com', type: 'Shopify' as BusinessType, highlight: true },
    { name: 'WooCommerce', icon: '🛒', defaultUrl: 'https://mywoocommerce-shop.com', type: 'WooCommerce' as BusinessType },
    { name: 'WordPress', icon: '🌐', defaultUrl: 'https://mywp-blog.org', type: 'Other' as BusinessType },
    { name: 'Wix', icon: '🟦', defaultUrl: 'https://mywix-site.wixsite.com', type: 'Other' as BusinessType },
    { name: 'Webflow', icon: '⚡', defaultUrl: 'https://mywebflow-showcase.io', type: 'Other' as BusinessType },
    { name: 'Framer', icon: '🎨', defaultUrl: 'https://myframer-portfolio.framer.app', type: 'Other' as BusinessType },
    { name: 'React', icon: '⚛', defaultUrl: 'https://myreact-app.dev', type: 'SaaS' as BusinessType },
    { name: 'Next.js', icon: '▲', defaultUrl: 'https://mynext-app.vercel.app', type: 'SaaS' as BusinessType },
    { name: 'Custom Website', icon: '💻', defaultUrl: 'https://yourwebsite.com', type: 'Other' as BusinessType }
  ];

  // Trigger verification flow animation
  const triggerVerificationFlow = () => {
    setIsVerifying(true);
    setProgressIndex(0);
  };

  useEffect(() => {
    if (isVerifying && progressIndex >= 0 && progressIndex < connectionProgressItems.length) {
      const timer = setTimeout(() => {
        setProgressIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (progressIndex === connectionProgressItems.length) {
      setIsVerifying(false);
    }
  }, [isVerifying, progressIndex]);

  // Handle Shopify App Approval & OAuth Integration with Backend
  const handleApproveShopifyInstallation = async () => {
    setIsInstallingShopify(true);
    setShopifyInstallStep('installing');

    const cleanShopDomain = shopifyDomainInput.includes('.') ? shopifyDomainInput : `${shopifyDomainInput}.myshopify.com`;
    const fullUrl = cleanShopDomain.startsWith('http') ? cleanShopDomain : `https://${cleanShopDomain}`;

    setWebsiteUrl(fullUrl);
    setActivePlatform('Shopify');

    // Direct merchant straight to official Shopify OAuth Permission Grant via Worker Install Route
    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(cleanShopDomain)}`;
  };

  // Handle Connecting Custom Website & automatically navigating to Step 2
  const handleConnectCustomWebsite = async (urlInput: string) => {
    if (!urlInput || !urlInput.trim()) return;
    const cleanDomain = urlInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    const fullUrl = cleanDomain.startsWith('http') ? cleanDomain : `https://${cleanDomain}`;

    setIsVerifying(true);
    try {
      const res = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain, method: 'snippet' })
      });
      await res.json();
    } catch (err) {
      console.error(err);
    } finally {
      setWebsiteUrl(fullUrl);
      setProgressIndex(connectionProgressItems.length);
      setIsVerifying(false);
      handleRescanWebsite(fullUrl);
      // AUTOMATICALLY navigate to Step 2
      setStep(2);
      setStep2SubSection('questions');
    }
  };

  // Re-run AI scan on website
  const handleRescanWebsite = async (urlToScan?: string) => {
    const targetUrl = urlToScan || websiteUrl;
    setIsScanningSite(true);
    
    try {
      const res = await fetch('/api/ai/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: targetUrl, businessType: activePlatform })
      });
      const data = await res.json();
      
      if (data && data.headline) {
        setSurveyConfig(prev => ({
          ...prev,
          headline: data.headline,
          questionText: data.suggestedQuestions?.[0]?.questionText || prev.questionText,
          options: data.suggestedQuestions?.[0]?.options || prev.options
        }));
      }
    } catch (err) {
      console.log('Using simulated audit scan');
    } finally {
      setIsScanningSite(false);
    }
  };

  const userSiteId = useMemo(() => {
    const seed = (userEmail || 'user') + (websiteUrl || 'store') + Date.now().toString(36);
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const cleanHash = Math.abs(hash).toString(36).toUpperCase();
    return `cl_live_${cleanHash}`;
  }, [userEmail, websiteUrl]);

  const handleCopyCode = () => {
    const code = `<script async src="${window.location.origin}/tracker.js" data-site-id="${userSiteId}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Final onboarding completion callback
  const handleGoToWorkspace = () => {
    const cleanDomain = websiteUrl ? websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 'My Shopify Store';
    
    const initialSurveyObj: Survey = {
      id: surveyConfig.id,
      title: surveyConfig.title,
      displayOption: 'In-Page Popup',
      headline: surveyConfig.headline,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          questionText: surveyConfig.questionText,
          options: surveyConfig.options
        },
        {
          id: 'q2',
          type: 'rating',
          questionText: 'How would you rate your experience browsing our store today?'
        },
        {
          id: 'q3',
          type: 'text',
          questionText: 'Is there anything specific we can improve on this page?'
        }
      ],
      colors: {
        background: surveyConfig.bgColor || '#ffffff',
        text: '#0f172a',
        accent: surveyConfig.accentColor || '#008060'
      },
      brandingEnabled: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    const workspaceObj: Workspace = {
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      name: cleanDomain,
      businessType: activePlatform === 'Shopify' ? 'Shopify' : 'Ecommerce',
      url: websiteUrl,
      goal: businessAim,
      whiteLabel: {
        primaryColor: surveyConfig.accentColor,
        removeBranding: false,
        logoUrl: surveyConfig.logoUrl || 'sparkle'
      }
    };

    onComplete(workspaceObj, initialSurveyObj);
  };

  return (
    <div id="onboarding_wizard_container" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row relative overflow-hidden pb-16">
      
      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-600 z-50 pointer-events-none" />

      {/* LEFT DARK NAVIGATION SIDEBAR (ZIGPOLL STYLE) */}
      <aside className="w-64 shrink-0 bg-[#0B1320] text-slate-300 font-sans border-r border-slate-800/80 flex flex-col justify-between p-3.5 select-none hidden md:flex min-h-screen z-20">
        <div className="space-y-4">
          {/* Brand Logo & Lite Badge */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                <span>👁️</span>
              </div>
              <span className="font-black text-white text-sm tracking-tight font-sans flex items-center gap-1">
                Customer<span className="text-emerald-400">Lens</span>
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded-full">
              AI
            </span>
          </div>

          {/* Home Button */}
          <button
            type="button"
            onClick={() => {
              if (onGoToLanding) onGoToLanding();
              else if (onBack) onBack();
              else window.location.href = '/';
            }}
            className="w-full px-3 py-2 bg-[#132238] hover:bg-[#1c304d] border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 shadow-xs group"
          >
            <Home size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </button>

          {/* Website Selector Dropdown */}
          <div className="bg-[#0f192a] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all">
            <span className="flex items-center gap-1.5 truncate">
              <span className="text-slate-400">←</span>
              <span>{connectedAppName}</span>
            </span>
          </div>

          {/* Nav Section 1: SURVEY SETUP */}
          <div className="space-y-1 pt-2">
            <div className="px-3 py-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              <span>SURVEY SETUP</span>
            </div>
            <div className="space-y-1">
              {/* Step 1 with Green Tick Mark */}
              <button
                type="button"
                onClick={() => handleGoToStep(1)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                  step === 1 ? 'bg-[#132238] text-white font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">1.</span>
                  <span>Connect Website</span>
                </span>
                {isStep1Completed && (
                  <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                )}
              </button>

              {/* Step 2: AI Survey Setup */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleGoToStep(2)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-black text-left flex items-center justify-between transition-all cursor-pointer ${
                    step === 2
                      ? 'bg-[#132238] text-white border-l-2 border-emerald-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">2.</span>
                    <span>AI Survey Setup</span>
                  </span>
                  {step > 2 && (
                    <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}
                </button>

                {/* Sub-options open when in step 2 */}
                {step === 2 && (
                  <div className="pl-5 space-y-0.5 py-1 border-l-2 border-slate-800/80 ml-3">
                    <button
                      type="button"
                      onClick={() => setStep2SubSection('questions')}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs font-semibold text-left flex items-center gap-2 transition-all cursor-pointer ${
                        step2SubSection === 'questions'
                          ? 'bg-emerald-500/15 text-emerald-300 font-black'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <span className="text-xs">📝</span>
                      <span>Questions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep2SubSection('appearance')}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs font-semibold text-left flex items-center gap-2 transition-all cursor-pointer ${
                        step2SubSection === 'appearance'
                          ? 'bg-emerald-500/15 text-emerald-300 font-black'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <span className="text-xs">🎨</span>
                      <span>Appearance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep2SubSection('aistrategy')}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs font-semibold text-left flex items-center gap-2 transition-all cursor-pointer ${
                        step2SubSection === 'aistrategy'
                          ? 'bg-emerald-500/15 text-emerald-300 font-black'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <span className="text-xs">🤖</span>
                      <span>AI Strategy</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Publish Workspace */}
              <button
                type="button"
                onClick={() => handleGoToStep(3)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                  step === 3 ? 'bg-[#132238] text-white font-bold border-l-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">3.</span>
                  <span>Publish Workspace</span>
                </span>
              </button>
            </div>
          </div>


        </div>

        {/* Footer link */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => handleGoToStep(1)}
            className="w-full text-left text-xs font-extrabold text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-900/60 cursor-pointer"
          >
            <span>←</span>
            <span>All Surveys</span>
          </button>
        </div>
      </aside>

      {/* MAIN RIGHT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-200 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Header Title */}
            {step !== 2 && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-[#008060] flex items-center justify-center text-white shadow-xs">
                  <ShoppingBag className="h-4 w-4 text-emerald-100" />
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-mono">
                    CUSTOMER<span className="text-[#008060]">LENS</span>
                    <span className="text-[10px] bg-emerald-50 text-[#008060] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">AI</span>
                  </h1>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: JOIN WEBSITE WITH CUSTOMERLENS AI */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto w-full"
              >
              {/* Connection Options Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-emerald-50 text-[#008060] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Step 1 of 3</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={10} /> Fast and Easy Setup
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">CONNECT CUSTOMER LENS AI TO YOUR WEBSITE</h2>
                  <p className="text-xs text-slate-500 mt-1">Connect your Shopify store or website to automatically start tracking visitor behavior and triggering AI surveys.</p>
                </div>

                {/* BOLD GREEN SHOPIFY CONNECT BUTTON */}
                <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 rounded-3xl text-white shadow-xl space-y-4 relative overflow-hidden border border-emerald-700/40">
                  <div className="absolute -top-4 -right-4 opacity-15 pointer-events-none">
                    <ShopifyLogo className="w-40 h-40" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-white rounded-full shadow-md shrink-0">
                      <ShopifyLogo className="w-10 h-10" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">Recommended Shopify Integration</span>
                      <h3 className="text-base font-extrabold text-white">Fast and Easy Shopify App Embed Installation</h3>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    Install CustomerLens AI directly on your Shopify store. Shopify authorizes permissions, approves the app, and automatically embeds the script.
                  </p>

                  <button
                    type="button"
                    onClick={handleConnectShopifyDirect}
                    className="w-full bg-[#008060] hover:bg-[#004c3f] text-white font-extrabold text-sm py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 cursor-pointer border border-emerald-400/30 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <ShopifyLogo className="w-7 h-7 shrink-0" />
                    <span className="text-sm font-black">Connect with Shopify</span>
                    <ArrowRight className="h-5 w-5 text-emerald-200 ml-auto" />
                  </button>
                </div>


              </div>
            </motion.div>
          )}

          {/* STEP 2: CUSTOMER LENS AI SURVEY SETUP */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* SECTION 1 — QUESTIONS & SLIDE MANAGEMENT */}
              {(step2SubSection === 'all' || step2SubSection === 'questions') && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  {/* Title & Subheading */}
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Select Your Survey Questions
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                      Run one survey at a time to collect clear, focused customer insights.
                    </p>
                  </div>

                  {/* Header Bar with Questions Search + Filter Categories Dropdown + Use Prompt + Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      {questionViewMode === 'picker' ? (
                        <>
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                              type="text"
                              value={slideSearchQuery}
                              onChange={(e) => setSlideSearchQuery(e.target.value)}
                              placeholder="Filter question templates"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                            />
                          </div>

                          {/* Filter Categories Dropdown Matching Screenshot */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsFilterCategoriesOpen(!isFilterCategoriesOpen)}
                              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#0266c8] text-[#0266c8] rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Filter Categories</span>
                              <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterCategoriesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isFilterCategoriesOpen && (
                              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-300 rounded-2xl shadow-xl p-3.5 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                                <div className="mb-2">
                                  <input
                                    type="text"
                                    value={categoryFilterSearch}
                                    onChange={(e) => setCategoryFilterSearch(e.target.value)}
                                    placeholder="Type to filter"
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                                  />
                                </div>

                                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 px-1">
                                  CATEGORIES
                                </div>

                                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                                  {ALL_FILTER_CATEGORIES.filter(cat => cat.toLowerCase().includes(categoryFilterSearch.toLowerCase())).map((cat) => {
                                    const isChecked = selectedCategories.includes(cat);
                                    return (
                                      <label
                                        key={cat}
                                        onClick={() => {
                                          if (isChecked) {
                                            setSelectedCategories(prev => prev.filter(c => c !== cat));
                                          } else {
                                            setSelectedCategories(prev => [...prev, cat]);
                                          }
                                        }}
                                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-800 transition-colors"
                                      >
                                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                          isChecked ? 'bg-[#0266c8] border-[#0266c8] text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                          {isChecked && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span>{cat}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reward / Incentive Templates Dropdown Matching Screenshot Format */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setIsRewardDropdownOpen(!isRewardDropdownOpen);
                                if (isFilterCategoriesOpen) setIsFilterCategoriesOpen(false);
                              }}
                              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#0266c8] text-[#0266c8] rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Gift size={13} className="text-[#0266c8]" />
                              <span>{surveyIncentive ? 'Reward: ' + (surveyIncentive.length > 18 ? surveyIncentive.substring(0, 16) + '...' : surveyIncentive) : 'Reward Attraction (Optional)'}</span>
                              <ChevronDown size={14} className={`transition-transform duration-200 ${isRewardDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isRewardDropdownOpen && (
                              <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-300 rounded-2xl shadow-xl p-3.5 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                                <div className="mb-2">
                                  <input
                                    type="text"
                                    value={rewardSearchText}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setRewardSearchText(val);
                                      setSurveyIncentive(val);
                                    }}
                                    placeholder="Type to filter or write reward..."
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0266c8] font-medium"
                                  />
                                </div>

                                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                                  <span>REWARDS</span>
                                  {surveyIncentive && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSurveyIncentive('');
                                        setRewardSearchText('');
                                      }}
                                      className="text-rose-500 hover:underline text-[10px] font-bold cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                                  {REWARD_ATTRACTION_TEMPLATES.filter(tpl =>
                                    !rewardSearchText ||
                                    tpl.label.toLowerCase().includes(rewardSearchText.toLowerCase()) ||
                                    tpl.text.toLowerCase().includes(rewardSearchText.toLowerCase())
                                  ).map((tpl) => {
                                    const isSelected = surveyIncentive === tpl.text;
                                    return (
                                      <label
                                        key={tpl.id}
                                        onClick={() => {
                                          if (isSelected) {
                                            setSurveyIncentive('');
                                            setRewardSearchText('');
                                          } else {
                                            setSurveyIncentive(tpl.text);
                                            setRewardSearchText(tpl.label);
                                          }
                                        }}
                                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-800 transition-colors"
                                      >
                                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                          isSelected ? 'bg-[#0266c8] border-[#0266c8] text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                          {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span className="leading-snug">{tpl.label}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2.5 px-1 font-medium border-t border-slate-100 pt-2">
                                  💡 Optional: Offering a reward can boost response rates by up to 3x.
                                </p>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsUsePromptOpen(true)}
                            className="px-3.5 py-2 bg-[#6b52ae] hover:bg-[#584196] text-white rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Sparkles size={13} />
                            <span>Use a Prompt</span>
                          </button>

                          {/* ACTION BUTTON 1: ADD QUESTION (SLIDE) */}
                          <button
                            type="button"
                            onClick={() => setIsAddQuestionModalOpen(true)}
                            className="px-3.5 py-2 bg-[#0266c8] hover:bg-[#0252a3] text-white rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <PlusCircle size={14} />
                            <span>+ Add Question (Slide)</span>
                          </button>

                          {/* ACTION BUTTON 2: ADD AI FOLLOW-UP */}
                          <button
                            type="button"
                            onClick={() => {
                              if (managedSlides.length > 0) {
                                setFollowUpParentSlideId(managedSlides[0].id);
                              }
                              setIsAddFollowUpModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Sparkles size={14} />
                            <span>+ Add AI Follow-Up</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuestionViewMode('picker')}
                            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>← Back to Question Templates</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsAddQuestionModalOpen(true)}
                            className="px-3.5 py-2 bg-[#0266c8] hover:bg-[#0252a3] text-white rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <PlusCircle size={14} />
                            <span>+ Add Question (Slide)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (managedSlides.length > 0) {
                                setFollowUpParentSlideId(managedSlides[0].id);
                              }
                              setIsAddFollowUpModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles size={14} />
                            <span>+ Add AI Follow-Up</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MODE 1: SLIDE MANAGEMENT VIEW */}
                  {questionViewMode === 'management' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Section Header Row matching Screenshot */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-slate-100 pb-3">
                        <div className="lg:col-span-7 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                              <span>Slide Management</span>
                              <span className="text-slate-400 font-normal hover:text-slate-600 cursor-pointer text-xs" title="Drag and drop slides to reorder">ℹ️</span>
                            </h3>
                            <p className="text-xs text-slate-500">Drag and drop to adjust the order.</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsAddQuestionModalOpen(true)}
                              className="px-3 py-1.5 bg-[#0266c8] hover:bg-[#0252a3] text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <PlusCircle size={13} />
                              <span>+ Add Question (Slide)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (managedSlides.length > 0) {
                                  setFollowUpParentSlideId(managedSlides[0].id);
                                }
                                setIsAddFollowUpModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Sparkles size={13} />
                              <span>+ Add AI Follow-Up</span>
                            </button>
                          </div>
                        </div>

                        <div className="lg:col-span-5 flex items-center justify-between">
                          <h3 className="font-extrabold text-slate-900 text-base">Survey Preview</h3>
                          <button
                            type="button"
                            onClick={() => setIsFullPreviewOpen(true)}
                            className="text-xs font-bold text-slate-600 underline hover:text-slate-900 cursor-pointer"
                          >
                            Click here for a full preview.
                          </button>
                        </div>
                      </div>

                      {/* Split Layout: Left Slide Cards List | Right Survey Preview Frame */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                        
                        {/* LEFT COLUMN: MANAGED SLIDE CARDS (7 Cols) */}
                        <div className="lg:col-span-7 space-y-3.5 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                          {managedSlides.map((slide, index) => {
                            const isSelected = activeManagedSlideId === slide.id;
                            return (
                              <div
                                key={slide.id}
                                onClick={() => setActiveManagedSlideId(slide.id)}
                                className={`p-4 bg-white rounded-2xl border text-left transition-all cursor-pointer relative shadow-2xs ${
                                  isSelected
                                    ? 'border-2 border-[#0266c8] ring-2 ring-blue-500/10 shadow-sm'
                                    : 'border-slate-200/90 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Slide Number Badge */}
                                  <div className="h-6 w-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 space-y-1.5 min-w-0 pr-6">
                                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug break-words">
                                      {slide.title}
                                    </h4>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                      <span>{slide.typeIcon}</span>
                                      <span>{slide.type}</span>
                                    </div>

                                    {/* AI Follow Up Condition Block (Green Box) */}
                                    {slide.conditionText && (
                                      <div className="bg-[#eef8f3] border border-[#d2edd8] rounded-xl p-3 mt-2 text-xs text-slate-800 space-y-2">
                                        <div className="font-semibold leading-relaxed text-[#1b5e39]">
                                          {slide.conditionText}
                                        </div>
                                        <div className="flex items-center gap-2 pt-0.5">
                                          <span className="text-[#2e7d52] font-bold text-[11px]">↪ Then</span>
                                          <span className="bg-white border border-[#c3e3cb] text-[#1b5e39] text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-2xs">
                                            show this slide
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Delete slide dustbin button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (managedSlides.length > 1) {
                                        setManagedSlides(prev => prev.filter(s => s.id !== slide.id));
                                      }
                                    }}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 font-bold p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete slide"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* RIGHT COLUMN: SURVEY PREVIEW CANVAS (5 Cols) */}
                        <div className="lg:col-span-5 bg-[#f4f5f7] border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between relative min-h-[480px] shadow-inner">
                          
                          {/* Floating Interactive Motion Popup Box */}
                          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                            <AnimatePresence mode="wait">
                              {isPreviewThankYou ? (
                                <motion.div
                                  key="thankyou-card"
                                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                                  transition={{ duration: 0.25 }}
                                  className="bg-white border border-slate-300/90 rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4 text-slate-900 relative text-center"
                                >
                                  {/* Close Button Top Right */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsPreviewThankYou(false);
                                      setPreviewSlideIndex(0);
                                      if (managedSlides.length > 0) {
                                        setActiveManagedSlideId(managedSlides[0].id);
                                      }
                                    }}
                                    className="absolute top-3.5 right-3.5 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
                                    title="Close preview"
                                  >
                                    ✕
                                  </button>

                                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-black shadow-2xs">
                                    <CheckCircle2 size={32} />
                                  </div>

                                  <div>
                                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                                      THANK YOU!
                                    </h3>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsPreviewThankYou(false);
                                      setPreviewSlideIndex(0);
                                      if (managedSlides.length > 0) {
                                        setActiveManagedSlideId(managedSlides[0].id);
                                      }
                                    }}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                                  >
                                    <X size={15} />
                                    <span>Close</span>
                                  </button>
                                </motion.div>
                              ) : activeManagedSlide ? (
                                <motion.div
                                  key={activeManagedSlide.id}
                                  initial={{ opacity: 0, x: 25 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -25 }}
                                  transition={{ duration: 0.22 }}
                                  className="bg-white border border-slate-300/80 rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4 text-slate-900 relative"
                                >
                                  {/* Header Row: Spinner */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[#0266c8] border-t-transparent animate-spin" />
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                        Question {managedSlides.findIndex(s => s.id === activeManagedSlide.id) + 1} of {managedSlides.length}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                                    {activeManagedSlide.title}
                                  </h3>

                                  {/* Interactive Option Choices */}
                                  {(activeManagedSlide.type === 'Binary Choice') && (
                                    <div className="grid grid-cols-2 gap-2.5">
                                      {(activeManagedSlide.options || ['Yes', 'No']).map((opt) => {
                                        const isSelected = previewSelectedChoice === opt;
                                        return (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                              setPreviewSelectedChoice(opt);
                                              setTimeout(() => {
                                                setPreviewSelectedChoice(null);
                                                const currIdx = managedSlides.findIndex(s => s.id === activeManagedSlide.id);
                                                if (currIdx >= 0 && currIdx + 1 < managedSlides.length) {
                                                  setActiveManagedSlideId(managedSlides[currIdx + 1].id);
                                                } else {
                                                  setIsPreviewThankYou(true);
                                                }
                                              }, 350);
                                            }}
                                            className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center border ${
                                              isSelected
                                                ? 'bg-[#0266c8] text-white border-[#0266c8] shadow-md scale-98'
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {(activeManagedSlide.type === 'Satisfaction') && (
                                    <div className="grid grid-cols-5 gap-1.5 text-center">
                                      {['😠', '🙁', '😐', '🙂', '😍'].map((emoji, idx) => {
                                        const isSelected = previewSelectedChoice === emoji;
                                        return (
                                          <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                              setPreviewSelectedChoice(emoji);
                                              setTimeout(() => {
                                                setPreviewSelectedChoice(null);
                                                const currIdx = managedSlides.findIndex(s => s.id === activeManagedSlide.id);
                                                if (currIdx >= 0 && currIdx + 1 < managedSlides.length) {
                                                  setActiveManagedSlideId(managedSlides[currIdx + 1].id);
                                                } else {
                                                  setIsPreviewThankYou(true);
                                                }
                                              }, 350);
                                            }}
                                            className={`py-2.5 rounded-xl text-xl cursor-pointer transition-all border ${
                                              isSelected
                                                ? 'bg-blue-100 border-blue-500 scale-110 shadow-sm'
                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                            }`}
                                          >
                                            {emoji}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {(activeManagedSlide.type === 'Long Answer' || activeManagedSlide.type === 'Short Answer') && (
                                    <textarea
                                      placeholder="Type your response here..."
                                      className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
                                    />
                                  )}

                                  {(activeManagedSlide.type === 'Promo Code') && (
                                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-1">
                                      <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Your Discount Code</span>
                                      <div className="font-mono font-black text-emerald-800 text-lg tracking-wider">
                                        {activeManagedSlide.options?.[0] || 'THANKYOU10'}
                                      </div>
                                    </div>
                                  )}

                                  {(activeManagedSlide.type === 'Single Choice' || activeManagedSlide.type === 'Multiple Choice') && (
                                    <div className="space-y-2.5">
                                      {(activeManagedSlide.options || ['Option 1', 'Option 2', 'Option 3']).map((option, idx) => {
                                        const isSelected = previewSelectedChoice === option;
                                        return (
                                          <div
                                            key={idx}
                                            onClick={() => {
                                              setPreviewSelectedChoice(option);
                                              setTimeout(() => {
                                                setPreviewSelectedChoice(null);
                                                const currIdx = managedSlides.findIndex(s => s.id === activeManagedSlide.id);
                                                if (currIdx >= 0 && currIdx + 1 < managedSlides.length) {
                                                  setActiveManagedSlideId(managedSlides[currIdx + 1].id);
                                                } else {
                                                  setIsPreviewThankYou(true);
                                                }
                                              }, 350);
                                            }}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-xs font-bold border ${
                                              isSelected
                                                ? 'bg-blue-50 border-[#0266c8] text-[#0266c8] shadow-2xs'
                                                : 'bg-white border-slate-200/90 hover:border-slate-400 text-slate-800'
                                            }`}
                                          >
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                                              isSelected ? 'border-[#0266c8] bg-[#0266c8]' : 'border-slate-400 bg-white'
                                            }`}>
                                              {isSelected ? <Check size={10} className="text-white" strokeWidth={3} /> : <div className="h-1.5 w-1.5 rounded-full bg-transparent" />}
                                            </div>
                                            <span>{option}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Next / Submit Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currIdx = managedSlides.findIndex(s => s.id === activeManagedSlide.id);
                                      if (currIdx >= 0 && currIdx + 1 < managedSlides.length) {
                                        setActiveManagedSlideId(managedSlides[currIdx + 1].id);
                                      } else {
                                        setIsPreviewThankYou(true);
                                      }
                                    }}
                                    className="w-full py-3 bg-[#232f3e] hover:bg-[#1a232e] text-white rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <span>Next Step</span>
                                    <span>➔</span>
                                  </button>
                                </motion.div>
                              ) : (
                                <div className="text-center text-slate-400 text-xs font-bold">
                                  Select a slide to preview.
                                </div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* BLUE NOTICE BANNER AT BOTTOM */}
                          <div className="bg-[#ebf5ff] border border-[#b8daff] text-[#1e4265] text-xs p-3.5 rounded-xl flex items-start gap-2.5 shadow-2xs mt-4">
                            <span className="text-blue-600 font-extrabold text-sm shrink-0 leading-none">⬆</span>
                            <p className="font-semibold leading-relaxed">
                              A preview of this survey is printed in the box above. Click any option to test choices and watch the motion transition to Thank You!
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE 2: PICK QUESTION TEMPLATE VIEW */}
                  {questionViewMode === 'picker' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* SPLIT LAYOUT: LEFT SCROLLABLE TEMPLATES | RIGHT LIVE PREVIEW */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                        
                        {/* LEFT COLUMN: SCROLLABLE TEMPLATE CARDS (7 Cols) */}
                        <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                          {filteredSlideTemplates.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                              <p className="text-xs font-bold text-slate-500">No matching question templates found.</p>
                              <button
                                type="button"
                                onClick={() => setSlideSearchQuery('')}
                                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                              >
                                Clear filter
                              </button>
                            </div>
                          ) : (
                            filteredSlideTemplates.map((template) => {
                              const isSelected = selectedSlideId === template.id;
                              return (
                                <div
                                  key={template.id}
                                  onClick={() => setSelectedSlideId(template.id)}
                                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative bg-white ${
                                    isSelected
                                      ? 'border-2 border-[#0266c8] shadow-sm ring-2 ring-blue-500/10'
                                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                                  }`}
                                >
                                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                    {template.title}
                                  </h4>

                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {/* Type indicator badge */}
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                                      <span>{template.typeIcon}</span>
                                      <span>{template.type}</span>
                                    </span>

                                    {/* Pair with tags */}
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                                      <span className="text-slate-400 font-normal">🔗 Pair with:</span>
                                      {template.pairedWith.map((pw, idx) => (
                                        <span key={pw} className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-2">
                                          {pw}{idx < template.pairedWith.length - 1 ? ',' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW WIDGET (5 Cols) */}
                        <div className="lg:col-span-5 bg-[#f4f5f7] border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[460px] shadow-inner">
                          {activeSlideTemplate ? (
                            <div className="bg-white border border-slate-300/80 rounded-2xl shadow-xl max-w-sm w-full text-slate-900 relative overflow-hidden">
                              {/* Reward Attraction Banner as full-width top header matching screenshot */}
                              {surveyIncentive && (
                                <div className="bg-[#5839EE] text-white text-[11px] md:text-xs font-bold text-center py-2.5 px-3 flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap overflow-hidden">
                                  <span className="truncate">{surveyIncentive}</span>
                                  <span className="text-xs shrink-0">🎁</span>
                                </div>
                              )}

                              <div className="p-6 space-y-4 relative">
                                {/* Close button at top right of modal */}
                                <button
                                  type="button"
                                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer transition-colors"
                                >
                                  ✕
                                </button>

                                {/* Question Title */}
                                <h3 className="font-extrabold text-slate-900 text-base leading-snug pr-6">
                                  {activeSlideTemplate.title}
                                </h3>

                              {/* Dynamic Inputs Based on Question Type */}
                              {(activeSlideTemplate.type === 'Single Choice' || activeSlideTemplate.type === 'Multiple Choice') && (
                                <div className="space-y-2.5">
                                  {(activeSlideTemplate.options || ['Less than a day', 'Less than a week', 'Less than a month', '1 - 3 months', '3 - 12 months', 'Over 12 months']).map((option, idx) => (
                                    <label
                                      key={idx}
                                      className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 hover:border-slate-400 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs"
                                    >
                                      <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                                      <span>{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {(activeSlideTemplate.type === 'Long Answer' || activeSlideTemplate.type === 'Short Answer') && (
                                <div className="space-y-2">
                                  <textarea
                                    readOnly
                                    placeholder=""
                                    className="w-full h-24 p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none resize-none cursor-default"
                                  />
                                </div>
                              )}

                              {activeSlideTemplate.type === 'Range' && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                      <button
                                        key={num}
                                        type="button"
                                        className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer text-center"
                                      >
                                        {num}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                                    <span>{activeSlideTemplate.minLabel || 'Not Important'}</span>
                                    <span>{activeSlideTemplate.maxLabel || 'Very Important'}</span>
                                  </div>
                                </div>
                              )}

                              {activeSlideTemplate.type === 'Binary Choice' && (
                                <div className="grid grid-cols-2 gap-2">
                                  {(activeSlideTemplate.options || ['Yes', 'No']).map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 transition-all cursor-pointer text-center"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Emojis for satisfaction rating */}
                              {activeSlideTemplate.type === 'Satisfaction' && (
                                <div className="grid grid-cols-5 gap-1.5 text-center">
                                  {['😠', '🙁', '😐', '🙂', '😍'].map((emoji, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xl cursor-pointer transition-all"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-slate-400 text-xs font-bold">
                              Select a question template on the left to preview.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* NEW DESIGN & LIVE MOTION PREVIEW PAGE (BETWEEN QUESTION SELECTION & DELIVERY) */}
              {(step2SubSection === 'all' || step2SubSection === 'appearance') && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
                  {/* Page Title & Subheading */}
                  <div className="border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎨</span>
                      <h3 className="font-bold text-slate-900 text-xl md:text-2xl tracking-tight">
                        Customise your survey color and font
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                      We recommend simple look of survey so that user answer and it dont feel complicated but smart.
                    </p>
                  </div>

                  {/* 1. LIVE INTERACTIVE SURVEY MOTION PREVIEW CONTAINER */}
                  <div className="space-y-3">
                    {/* OUTER MODAL CONTAINER FRAME MATCHING USER SCREENSHOT */}
                    <div className="border border-slate-200 rounded-3xl p-6 md:p-12 bg-slate-50/70 shadow-inner min-h-[420px] flex items-center justify-center relative overflow-hidden">
                      
                      {/* INSET SURVEY POPUP CARD */}
                      <motion.div
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md rounded-2xl shadow-xl border border-slate-300/80 relative overflow-hidden"
                        style={{
                          backgroundColor: surveyBg,
                          fontFamily: FONT_OPTIONS.find((f) => f.id === selectedFont)?.family || 'sans-serif'
                        }}
                      >
                        {/* Reward Attraction Banner as full-width top header matching screenshot */}
                        {surveyIncentive && (
                          <div className="bg-[#5839EE] text-white text-[11px] md:text-xs font-bold text-center py-2.5 px-3 flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap overflow-hidden">
                            <span className="truncate">{surveyIncentive}</span>
                            <span className="text-xs shrink-0">🎁</span>
                          </div>
                        )}

                        <div className="p-6 md:p-8 relative">
                          {/* Top Close X Button matching screenshot */}
                          <button
                            type="button"
                            onClick={() => {
                              setInteractiveStage('question');
                              setSelectedPreviewAnswer(null);
                              setAiFollowUpAnswer(null);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Close preview"
                          >
                            <X size={18} />
                          </button>

                          {/* STAGE 1: AI PROCESSING / THINKING LOADING STATE */}
                          {isAiProcessing ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="py-10 text-center space-y-4"
                            >
                              <div className="relative inline-flex items-center justify-center">
                                <div
                                  className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse"
                                  style={{ backgroundColor: surveyThemeColor }}
                                >
                                  <Sparkles className="animate-spin text-white" size={28} />
                                </div>
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  CustomerLens AI is Thinking...
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                                  <span>Analyzing response</span>
                                  <span className="inline-flex gap-0.5">
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                                  </span>
                                </p>
                              </div>
                            </motion.div>
                          ) : interactiveStage === 'question' ? (
                            /* STAGE 2: CHOSEN QUESTION SLIDE */
                            <motion.div
                              key="question_stage"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="space-y-4"
                            >
                              <div>
                                <h3 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight leading-snug">
                                  {activeSlideTemplate?.title || activeManagedSlide?.title || surveyConfig.questionText || 'Example Slide'}
                                </h3>
                              </div>

                            {/* Options Buttons List */}
                            <div className="space-y-2.5 pt-1">
                              {(activeSlideTemplate?.options || [
                                'Search engine (Google, Bing)',
                                'Social media (TikTok, Instagram)',
                                'Friend or family recommendation',
                                'Podcast or YouTube video',
                                'Other'
                              ]).map((optText, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPreviewAnswer(optText);
                                    setIsAiProcessing(true);
                                    setTimeout(() => {
                                      setIsAiProcessing(false);
                                      if (activeSlideTemplate?.followUp || surveyConfig?.enableAiFollowUp) {
                                        setInteractiveStage('ai_talking');
                                      } else {
                                        setInteractiveStage('thank_you');
                                      }
                                    }, 400);
                                  }}
                                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 text-left text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer hover:shadow-xs"
                                  style={{
                                    borderColor: selectedPreviewAnswer === optText ? surveyThemeColor : undefined
                                  }}
                                >
                                  <span>{optText}</span>
                                  <span
                                    className="h-5 w-5 rounded-full border border-slate-300 group-hover:border-slate-500 flex items-center justify-center text-[10px]"
                                    style={{
                                      backgroundColor: selectedPreviewAnswer === optText ? surveyThemeColor : undefined,
                                      color: selectedPreviewAnswer === optText ? '#FFFFFF' : undefined
                                    }}
                                  >
                                    {selectedPreviewAnswer === optText ? '✓' : ''}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        ) : interactiveStage === 'ai_talking' ? (
                          /* STAGE 3: AI TALKING / FOLLOW-UP ANIMATION */
                          <motion.div
                            key="ai_talking_stage"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-md space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🤖</span>
                                <span className="text-[10px] font-mono uppercase font-black tracking-wider text-purple-300">
                                  AI Follow-up Question
                                </span>
                              </div>
                              <p className="text-xs font-medium text-purple-100 leading-relaxed">
                                {activeSlideTemplate?.followUp || `Thanks for selecting "${selectedPreviewAnswer}"! Could you share a brief reason for your answer?`}
                              </p>
                            </div>

                            {/* Clean Text Input For Follow-up */}
                            <div className="pt-1">
                              <input
                                type="text"
                                placeholder="Type your answer here (optional, press Enter to submit)..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setInteractiveStage('thank_you');
                                  }
                                }}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-800 shadow-2xs"
                              />
                            </div>
                          </motion.div>
                        ) : (
                          /* STAGE 4: THANK YOU COMPLETION ANIMATION */
                          <motion.div
                            key="thank_you_stage"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6 space-y-4"
                          >
                            <div className="inline-flex h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center shadow-md mx-auto">
                              <CheckCircle2 size={36} />
                            </div>

                            <div>
                              <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">
                                THANK YOU!
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setInteractiveStage('question');
                                setSelectedPreviewAnswer(null);
                                setAiFollowUpAnswer(null);
                              }}
                              className="w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs transition-all shadow-md cursor-pointer block mt-3"
                              style={{ backgroundColor: surveyThemeColor }}
                            >
                              <span>Close</span>
                            </button>
                          </motion.div>
                        )}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* 2. BELOW: FILTER-STYLE DROPDOWN BUTTONS FOR 'COLOUR' AND 'FONT' */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase font-mono block">
                      STYLE & TYPOGRAPHY CUSTOMIZATION
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* FILTER BUTTON 1: COLOUR */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsColorPickerOpen(!isColorPickerOpen);
                            setIsFontPickerOpen(false);
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs ${
                            isColorPickerOpen
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Palette size={16} className="text-emerald-600" />
                          <span>Colour</span>
                          <div className="flex items-center gap-1 ml-1">
                            <span className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: surveyBg }} title="Background" />
                            <span className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: surveyThemeColor }} title="Accent" />
                          </div>
                          <ChevronDown
                            size={15}
                            className={`text-slate-400 transition-transform ${isColorPickerOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>

                      {/* FILTER BUTTON 2: FONT */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFontPickerOpen(!isFontPickerOpen);
                            setIsColorPickerOpen(false);
                          }}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs ${
                            isFontPickerOpen
                              ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-600/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Type size={16} className="text-blue-600" />
                          <span>Font</span>
                          <span className="text-[10px] font-mono font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                            {selectedFont}
                          </span>
                          <ChevronDown
                            size={15}
                            className={`text-slate-400 transition-transform ${isFontPickerOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE COLOR PICKER DROPDOWN PANEL */}
                    {isColorPickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                          <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-2">
                            <Pipette size={15} className="text-emerald-600" />
                            <span>Select Survey Colors & Color Schemes</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsColorPickerOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Native Droppers & Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">
                              🖌️ Background Color (Dropper)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={surveyBg}
                                onChange={(e) => setSurveyBg(e.target.value)}
                                className="h-9 w-12 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                              />
                              <input
                                type="text"
                                value={surveyBg}
                                onChange={(e) => setSurveyBg(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">
                              🎨 Accent & Button Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={surveyThemeColor}
                                onChange={(e) => setSurveyThemeColor(e.target.value)}
                                className="h-9 w-12 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                              />
                              <input
                                type="text"
                                value={surveyThemeColor}
                                onChange={(e) => setSurveyThemeColor(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick Palette Swatches */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
                            POPULAR COLOR SCHEMES
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { name: 'Shopify Emerald', bg: '#FFFFFF', accent: '#008060' },
                              { name: 'Royal Blue', bg: '#FFFFFF', accent: '#0266C8' },
                              { name: 'Luxury Gold', bg: '#1E293B', accent: '#D4AF37' },
                              { name: 'Midnight Navy', bg: '#0F172A', accent: '#38BDF8' },
                              { name: 'Vibrant Rose', bg: '#FFF1F2', accent: '#E11D48' },
                              { name: 'Sunset Coral', bg: '#FFF7ED', accent: '#F97316' },
                              { name: 'Purple Violet', bg: '#FAF5FF', accent: '#8B5CF6' },
                              { name: 'Pure Minimal', bg: '#FFFFFF', accent: '#000000' }
                            ].map((swatch) => (
                              <button
                                key={swatch.name}
                                type="button"
                                onClick={() => {
                                  setSurveyBg(swatch.bg);
                                  setSurveyThemeColor(swatch.accent);
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:scale-[1.02]"
                              >
                                <span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: swatch.accent }} />
                                <span>{swatch.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* EXPANDABLE FONT SELECTOR DROPDOWN PANEL */}
                    {isFontPickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-slate-50/90 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                          <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-2">
                            <Type size={15} className="text-blue-600" />
                            <span>Select Survey Typography Font</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsFontPickerOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Search Input for Fonts */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            type="text"
                            value={fontSearchQuery}
                            onChange={(e) => setFontSearchQuery(e.target.value)}
                            placeholder="Search 18+ typography fonts..."
                            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        {/* Scrollable Long Font List */}
                        <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5 rounded-xl border border-slate-200 p-2 bg-white">
                          {FONT_OPTIONS.filter((f) =>
                            !fontSearchQuery ||
                            f.label.toLowerCase().includes(fontSearchQuery.toLowerCase()) ||
                            f.category.toLowerCase().includes(fontSearchQuery.toLowerCase())
                          ).map((font) => {
                            const isSelected = selectedFont === font.id;
                            return (
                              <button
                                key={font.id}
                                type="button"
                                onClick={() => setSelectedFont(font.id)}
                                className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-900 font-extrabold shadow-2xs'
                                    : 'hover:bg-slate-50 border border-transparent text-slate-800'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs" style={{ fontFamily: font.family }}>
                                      {font.label}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                                      {font.category}
                                    </span>
                                  </div>
                                  <p
                                    className="text-[11px] text-slate-500 mt-0.5 font-normal truncate max-w-xs"
                                    style={{ fontFamily: font.family }}
                                  >
                                    Sample: How did you feel about our checkout process today?
                                  </p>
                                </div>

                                {isSelected && <Check size={16} className="text-blue-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 3 — PLACEMENT / DELIVERY METHOD (MATCHING SCREENSHOTS) */}
              {(step2SubSection === 'all' || step2SubSection === 'aistrategy') && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  {/* Header Row */}
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="font-extrabold text-slate-900 text-xl md:text-2xl tracking-tight">
                      How do you want to deliver your survey?
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">
                      You can present a survey on-site, a link, or email / SMS.
                    </p>
                  </div>

                  {/* Filter & Search Bar matching Image 2 */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={templateSearchFilter}
                        onChange={(e) => setTemplateSearchFilter(e.target.value)}
                        placeholder="Filter templates"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                      />
                    </div>

                    {/* Filter Categories Dropdown */}
                    <div className="relative w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsFilterCategoriesOpen(!isFilterCategoriesOpen)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-[#0266c8] text-slate-900 rounded-xl text-xs font-bold flex items-center justify-between sm:justify-start gap-2 shadow-2xs cursor-pointer hover:bg-slate-50 transition-all"
                      >
                        <span>Filter Categories</span>
                        <ChevronDown size={14} className={`transition-transform ${isFilterCategoriesOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isFilterCategoriesOpen && (
                        <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-30 space-y-2 animate-in fade-in duration-100">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block px-1">
                            CATEGORIES
                          </span>
                          {['Let AI Decide', 'General', 'Manual', 'Ecommerce', 'Email & SMS'].map((cat) => {
                            const isChecked = selectedCategories.includes(cat);
                            return (
                              <label
                                key={cat}
                                className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedCategories(prev => prev.filter(c => c !== cat));
                                    } else {
                                      setSelectedCategories(prev => [...prev, cat]);
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                                <span>{cat}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Cards List grouped by Category matching Screenshots with vertical scrollbar */}
                  <div className="space-y-6 pt-2 max-h-[380px] overflow-y-auto pr-3 pl-1 pb-2 rounded-2xl border border-slate-100 bg-slate-50/40 p-2 shadow-inner">
                    {(() => {
                      const ALL_DELIVERY_OPTIONS = [
                        {
                          category: 'Let AI Decide',
                          id: 'Let AI Decide',
                          title: 'Let AI Decide',
                          description: 'AI automatically deduces where this question must be asked to whom and when based on their behavior.',
                          isAi: true
                        },
                        {
                          category: 'General',
                          id: 'Link Only',
                          title: 'Link Only',
                          description: 'Access this survey via a public URL only. Commonly used for one-off campaigns.'
                        },
                        {
                          category: 'General',
                          id: 'Every Page',
                          title: 'Every Page',
                          description: 'Show this survey on every page of your website.'
                        },
                        {
                          category: 'General',
                          id: 'Homepage Only',
                          title: 'Homepage Only',
                          description: 'Show this survey on your homepage only.'
                        },
                        {
                          category: 'General',
                          id: 'Feedback',
                          title: 'Feedback',
                          description: 'Unobtrusive survey on every page prompting feedback.'
                        },
                        {
                          category: 'General',
                          id: 'Homepage Pop Up',
                          title: 'Homepage Pop Up',
                          description: 'Show this survey as a modal when the user lands on your homepage.'
                        },
                        {
                          category: 'Manual',
                          id: 'API Only',
                          title: 'API Only',
                          description: 'Make this survey available to be triggered using our JS API only.'
                        },
                        {
                          category: 'Manual',
                          id: 'Embed Code Snippet',
                          title: 'Embed Code Snippet',
                          description: 'Embed this survey anywhere with a simple code snippet.'
                        },
                        {
                          category: 'Manual',
                          id: 'Configure Manually',
                          title: 'Configure Manually',
                          description: 'Display the survey only on the page or pages that you specify.'
                        },
                        {
                          category: 'Manual',
                          id: 'Synthetic Research',
                          title: 'Synthetic Research',
                          description: 'Generate synthetic survey responses from configurable audience profiles.',
                          isAi: true
                        },
                        {
                          category: 'Ecommerce',
                          id: 'Exit Intent',
                          title: 'Exit Intent',
                          description: 'Show when the user intends to exit your website.'
                        },
                        {
                          category: 'Ecommerce',
                          id: 'Product Pages',
                          title: 'Product Pages',
                          description: 'Show this survey on all of your product pages.'
                        },
                        {
                          category: 'Email & SMS',
                          id: 'Email Campaign',
                          title: 'Email Campaign',
                          description: 'Email this survey out to your customers.'
                        }
                      ];

                      const searchQuery = templateSearchFilter.toLowerCase().trim();
                      const filteredDeliveryOptions = ALL_DELIVERY_OPTIONS.filter((opt) => {
                        const inCategory = selectedCategories.includes(opt.category);
                        const matchesText = !searchQuery || 
                          opt.title.toLowerCase().includes(searchQuery) || 
                          opt.description.toLowerCase().includes(searchQuery) ||
                          opt.category.toLowerCase().includes(searchQuery);
                        return inCategory && matchesText;
                      });

                      const categoriesOrder = ['Let AI Decide', 'General', 'Manual', 'Ecommerce', 'Email & SMS'];
                      const activeCategories = categoriesOrder.filter(cat => 
                        filteredDeliveryOptions.some(opt => opt.category === cat)
                      );

                      if (filteredDeliveryOptions.length === 0) {
                        return (
                          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                            <p className="text-xs font-bold text-slate-500">No delivery options match your search filters.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setTemplateSearchFilter('');
                                setSelectedCategories(['Let AI Decide', 'General', 'Manual', 'Ecommerce', 'Email & SMS']);
                              }}
                              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Reset filters
                            </button>
                          </div>
                        );
                      }

                      return activeCategories.map((cat) => {
                        const catOptions = filteredDeliveryOptions.filter(opt => opt.category === cat);
                        return (
                          <div key={cat} className="space-y-3">
                            <span className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase block font-mono">
                              {cat}
                            </span>

                            <div className="space-y-3">
                              {catOptions.map((opt) => {
                                const isSelected = whenToAppear === opt.id;
                                return (
                                  <div
                                    key={opt.id}
                                    onClick={() => setWhenToAppear(opt.id)}
                                    className={`w-full p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                                      isSelected
                                        ? 'bg-white border-2 border-[#0066cc] shadow-sm'
                                        : 'bg-white border border-slate-200 hover:border-slate-300 shadow-2xs'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base">
                                          {opt.title}
                                        </h4>
                                        {opt.isAi && opt.id === 'Let AI Decide' && (
                                          <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                            <Sparkles size={11} />
                                            AI Powered
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-600 mt-1">
                                        {opt.description}
                                      </p>
                                    </div>

                                    {opt.isAi && (
                                      <div className="text-purple-600 p-1 shrink-0">
                                        <Sparkles size={20} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* SECTION 4 — SURVEY BEHAVIOR OPTIONS (MATCHING SCREENSHOT) */}
              {(step2SubSection === 'all' || step2SubSection === 'behavior') && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  {/* Header Row */}
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="font-extrabold text-slate-900 text-xl md:text-2xl tracking-tight">
                      How should this survey behave?
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                      Adjust how this survey runs and where it appears on your target page.
                    </p>
                  </div>

                  {/* CHOICE LIST 1: SURVEY PAGE PLACEMENT */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase font-mono">
                        WHERE SHOULD WE PLACE IT ON THE PAGE?
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Selected: <strong className="text-[#008060]">{surveyLayout}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'Center of Page',
                          title: 'Center of Page',
                          desc: 'Centered modal overlay with dark page backdrop',
                          icon: '🎯'
                        },
                        {
                          id: 'Bottom Right',
                          title: 'Bottom Right',
                          desc: 'Floating corner card on the bottom-right',
                          icon: '↘️'
                        },
                        {
                          id: 'Bottom Left',
                          title: 'Bottom Left',
                          desc: 'Floating corner card on the bottom-left',
                          icon: '↙️'
                        },
                        {
                          id: 'Bottom Center',
                          title: 'Bottom Center',
                          desc: 'Sticky bottom banner docked at screen bottom',
                          icon: '⬇️'
                        },
                        {
                          id: 'AI Adaptive Placement',
                          title: 'AI Adaptive Placement',
                          desc: 'AI chooses optimal layout based on user behavior',
                          icon: '✨',
                          isAi: true
                        }
                      ].map((pos) => {
                        const isSelected = surveyLayout === pos.id;
                        return (
                          <div
                            key={pos.id}
                            onClick={() => setSurveyLayout(pos.id)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between gap-2.5 relative ${
                              isSelected
                                ? 'bg-emerald-50/50 border-[#008060] ring-2 ring-[#008060]/20 shadow-xs'
                                : 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{pos.icon}</span>
                                <h4 className="font-extrabold text-slate-900 text-xs md:text-sm">
                                  {pos.title}
                                </h4>
                              </div>
                              <input
                                type="radio"
                                name="surveyPlacement"
                                checked={isSelected}
                                onChange={() => setSurveyLayout(pos.id)}
                                className="mt-0.5 accent-[#008060] h-4 w-4 shrink-0 cursor-pointer"
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              {pos.desc}
                            </p>
                            {pos.isAi && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles size={10} />
                                  Smart Positioning
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <span className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase block font-mono mb-3">
                      SURVEY BEHAVIOR TOGGLES
                    </span>
                  </div>

                  {/* Behavior Options List */}
                  <div className="space-y-3.5">
                    {/* OPTION 1: ALLOW EDITS */}
                    <div
                      onClick={() => setAllowEdits(!allowEdits)}
                      className="w-full p-4 md:p-5 bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase block font-mono">
                          ALLOW EDITS
                        </span>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Let respondents go back and change their answers before submitting.
                        </p>
                      </div>

                      {/* iOS Style Pill Toggle Switch */}
                      <button
                        type="button"
                        aria-pressed={allowEdits}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAllowEdits(!allowEdits);
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          allowEdits ? 'bg-[#008060]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            allowEdits ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* OPTION 2: AUTOMATICALLY ADVANCE SLIDES */}
                    <div
                      onClick={() => setAutoAdvanceSlides(!autoAdvanceSlides)}
                      className="w-full p-4 md:p-5 bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase block font-mono">
                          AUTOMATICALLY ADVANCE SLIDES
                        </span>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Automatically move to the next slide on selection.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-pressed={autoAdvanceSlides}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoAdvanceSlides(!autoAdvanceSlides);
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          autoAdvanceSlides ? 'bg-[#008060]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            autoAdvanceSlides ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* OPTION 3: ALLOW RESUBMISSIONS */}
                    <div
                      onClick={() => setAllowResubmissions(!allowResubmissions)}
                      className="w-full p-4 md:p-5 bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase block font-mono">
                          ALLOW RESUBMISSIONS
                        </span>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Let the same participant submit this survey more than once.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-pressed={allowResubmissions}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAllowResubmissions(!allowResubmissions);
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          allowResubmissions ? 'bg-[#008060]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            allowResubmissions ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* OPTION 4: NOTIFY ME ON RESPONSE */}
                    <div
                      onClick={() => setNotifyOnResponse(!notifyOnResponse)}
                      className="w-full p-4 md:p-5 bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold tracking-wider text-slate-800 uppercase block font-mono">
                          NOTIFY ME ON RESPONSE
                        </span>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Send an email to your team whenever someone responds.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-pressed={notifyOnResponse}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifyOnResponse(!notifyOnResponse);
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifyOnResponse ? 'bg-[#008060]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            notifyOnResponse ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* OPTION 5: AI DYNAMIC ADAPTATION (USER REQUEST) */}
                    <div
                      onClick={() => setAiAdaptiveOptions(!aiAdaptiveOptions)}
                      className="w-full p-4 md:p-5 bg-purple-50/40 border border-purple-200 hover:border-purple-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold tracking-wider text-purple-900 uppercase font-mono flex items-center gap-1.5">
                            <Sparkles size={13} className="text-purple-600" />
                            AI DYNAMIC ADAPTATION & QUESTION STYLING
                          </span>
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={11} />
                            AI Powered
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                          AI makes different options for different user behavior and different question style on the same chosen page and question.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-pressed={aiAdaptiveOptions}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiAdaptiveOptions(!aiAdaptiveOptions);
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          aiAdaptiveOptions ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            aiAdaptiveOptions ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Next Step Bar */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (step2SubSection === 'behavior') {
                      setStep2SubSection('aistrategy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (step2SubSection === 'aistrategy') {
                      setStep2SubSection('appearance');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (step2SubSection === 'appearance') {
                      setStep2SubSection('questions');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      handleGoToStep(1);
                    }
                  }}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (step2SubSection === 'questions') {
                      setStep2SubSection('appearance');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (step2SubSection === 'appearance') {
                      setStep2SubSection('aistrategy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (step2SubSection === 'aistrategy') {
                      setStep2SubSection('behavior');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      handleGoToStep(3);
                    }
                  }}
                  className="px-8 py-3 bg-[#0266c8] hover:bg-[#0052a3] text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: INSIGHT DELIVERY CHANNELS & MAKE YOUR SURVEY LIVE */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* INSIGHT DELIVERY CHANNELS CARD (MATCHING USER SCREENSHOT EXACTLY) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Insight Delivery Channels
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">
                      Choose how you want CustomerLens AI to report customer insights and strategy recommendations to you.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllDeliveryChannels}
                    className="self-start sm:self-auto text-xs md:text-sm font-extrabold text-[#008060] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
                  >
                    <span>✓ Select All Delivery Methods</span>
                  </button>
                </div>

                {/* 2x2 Grid of Delivery Channel Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {/* CARD 1: AI INSTANT NOTIFICATIONS */}
                  <div
                    onClick={() => toggleDeliveryChannel('notifications')}
                    role="button"
                    tabIndex={0}
                    className={`p-5 md:p-6 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                      selectedInsightDelivery.includes('notifications')
                        ? 'border-[#008060] bg-emerald-50/20 text-emerald-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        {/* Icon Container */}
                        <div className="h-12 w-12 rounded-2xl bg-amber-100/90 text-amber-800 flex items-center justify-center text-xl shrink-0">
                          <Bell size={22} className="text-amber-700" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                            AI Instant Notifications
                          </h3>
                          <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            EMAIL & DASHBOARD ALERTS
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotificationSettingsModal(true);
                          }}
                          title="Configure Notification Bulletin Settings"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100/80 text-slate-600 hover:text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
                        >
                          <Settings size={13} />
                          <span>Settings</span>
                        </button>

                        <div
                          className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            selectedInsightDelivery.includes('notifications')
                              ? 'bg-[#008060] border-[#008060] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selectedInsightDelivery.includes('notifications') && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                      Get instant alerts when visitors specify major exit reasons (e.g. shipping cost issues, payment errors, pricing friction).
                    </p>
                  </div>

                  {/* CARD 2: CONVERSATIONAL AI ASSISTANT */}
                  <div
                    onClick={() => toggleDeliveryChannel('chat')}
                    role="button"
                    tabIndex={0}
                    className={`p-5 md:p-6 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                      selectedInsightDelivery.includes('chat')
                        ? 'border-[#008060] bg-emerald-50/20 text-emerald-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-100/90 text-indigo-800 flex items-center justify-center text-xl shrink-0">
                          <MessageSquare size={22} className="text-indigo-700" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                            Conversational AI Assistant
                          </h3>
                          <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            ASK & CHAT WITH AI
                          </span>
                        </div>
                      </div>

                      <div
                        className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          selectedInsightDelivery.includes('chat')
                            ? 'bg-[#008060] border-[#008060] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedInsightDelivery.includes('chat') && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                      Chat directly with CustomerLens AI in your dashboard to ask questions like <em className="text-slate-800 font-semibold">"What is our top drop-off reason this week?"</em>
                    </p>
                  </div>

                  {/* CARD 3: PIE CHARTS & INTERACTIVE GRAPHS */}
                  <div
                    onClick={() => toggleDeliveryChannel('charts')}
                    role="button"
                    tabIndex={0}
                    className={`p-5 md:p-6 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                      selectedInsightDelivery.includes('charts')
                        ? 'border-[#008060] bg-emerald-50/20 text-emerald-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-purple-100/90 text-purple-800 flex items-center justify-center text-xl shrink-0">
                          <BarChart3 size={22} className="text-purple-700" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                            Pie Charts & Interactive Graphs
                          </h3>
                          <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            VISUAL ANALYTICS DASHBOARD
                          </span>
                        </div>
                      </div>

                      <div
                        className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          selectedInsightDelivery.includes('charts')
                            ? 'bg-[#008060] border-[#008060] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedInsightDelivery.includes('charts') && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                      Visual breakdown charts displaying conversion impact, customer satisfaction scores, and exit reason percentages.
                    </p>
                  </div>

                  {/* CARD 4: AI SALES STRATEGY & RECOMMENDATIONS */}
                  <div
                    onClick={() => toggleDeliveryChannel('sales_strategy')}
                    role="button"
                    tabIndex={0}
                    className={`p-5 md:p-6 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                      selectedInsightDelivery.includes('sales_strategy')
                        ? 'border-[#008060] bg-emerald-50/20 text-emerald-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                          <Lightbulb size={22} className="text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                            AI Sales Strategy & Recommendations
                          </h3>
                          <span className="text-[10px] md:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            PROACTIVE REVENUE GROWTH
                          </span>
                        </div>
                      </div>

                      <div
                        className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          selectedInsightDelivery.includes('sales_strategy')
                            ? 'bg-[#008060] border-[#008060] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedInsightDelivery.includes('sales_strategy') && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                      Proactive actionable strategy steps from AI telling you how to adjust pricing, copy, or coupons to increase store revenue.
                    </p>
                  </div>
                </div>
              </div>

              {/* BAR / PROMPT CARD ASKING FOR NOTE FOR CUSTOMERLENS AI */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base md:text-lg">
                      Note for CustomerLens AI
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">
                      Tell CustomerLens AI what you want us to deliver — either related to your survey questions/goals, or how you would like your analytics & AI recommendations generated.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <textarea
                    rows={3}
                    value={businessAim}
                    onChange={(e) => setBusinessAim(e.target.value)}
                    placeholder="e.g., Focus on discovering why customers leave at checkout, send weekly analytics reports on Mondays, and give proactive pricing & coupon recommendations..."
                    className="w-full p-4 bg-slate-50 border border-slate-200/90 focus:border-[#008060] focus:bg-white rounded-2xl text-xs md:text-sm font-semibold transition-all outline-none leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-inner"
                  />
                  <p className="text-[11px] text-slate-400 font-mono">
                    CustomerLens AI will customize its intelligence engine based on your notes above.
                  </p>
                </div>
              </div>

              {/* BOTTOM ACTION BAR WITH 'MAKE YOUR SURVEY LIVE' BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 border border-slate-300 hover:bg-slate-100 rounded-2xl text-xs md:text-sm font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Step 2
                </button>

                <button
                  type="button"
                  onClick={handleGoToWorkspace}
                  className="w-full sm:w-auto px-10 py-4 bg-[#008060] hover:bg-[#005e46] text-white font-extrabold text-sm md:text-base rounded-2xl transition-all shadow-lg hover:shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles size={18} />
                  <span>Make Your Survey Live</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* SHOPIFY.COM ADMIN OAUTH AUTHORIZATION PERMISSION MODAL */}
      <AnimatePresence>
        {showShopifyModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-100 border border-slate-300 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative my-6 text-slate-900"
            >
              {/* Simulated Shopify Admin Address Bar */}
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[11px] text-slate-400 ml-2 font-mono flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                    <span className="text-emerald-400">🔒 https://</span>admin.shopify.com/store/{shopifyDomainInput ? shopifyDomainInput.replace('.myshopify.com', '') : 'your-store'}/oauth/authorize?app=CustomerLens+AI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShopifyModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Shopify Admin Top Navigation Header */}
              <div className="bg-[#1a1a1a] px-6 py-3 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <ShopifyLogo className="w-7 h-7 shrink-0 text-[#95bf47]" />
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-tight text-white font-sans">Shopify Admin</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono font-semibold">Store Dashboard</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {shopifyDomainInput || 'your-store.myshopify.com'}
                </div>
              </div>

              {/* Shopify App Permission Card */}
              <div className="p-6 md:p-8 space-y-6">
                {shopifyInstallStep === 'prompt' && (
                  <div className="space-y-6">
                    {/* Grant Permission Banner */}
                    <div className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl shrink-0">
                        <ShopifyLogo className="w-9 h-9" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">Official App Store Request</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          Install & Authorize CustomerLens AI
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          CustomerLens AI is requesting permission to access your Shopify store dashboard and theme assets to enable automated AI surveys and analytics.
                        </p>
                      </div>
                    </div>

                    {/* Store Domain Input Field */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                        Target Shopify Store Domain
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={shopifyDomainInput}
                          onChange={(e) => setShopifyDomainInput(e.target.value)}
                          placeholder="your-store.myshopify.com"
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#008060] focus:bg-white rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Permissions Requested Breakdown */}
                    <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-2xs">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center justify-between border-b border-slate-100 pb-2">
                        <span>Permissions Requested by CustomerLens AI</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Verified Safe</span>
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-[#008060] shrink-0 mt-0.5" />
                          <span><strong>Theme Integration:</strong> Automatically insert CustomerLens AI survey widget script into store theme</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-[#008060] shrink-0 mt-0.5" />
                          <span><strong>Customer Analytics:</strong> Track cart abandonment, scroll hesitation, and checkout exit triggers</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-[#008060] shrink-0 mt-0.5" />
                          <span><strong>Promotions & Rewards:</strong> Generate and display single-use discount codes to survey respondents</span>
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons: Grant Permission on Shopify */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowShopifyModal(false)}
                        className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApproveShopifyInstallation}
                        className="w-2/3 bg-[#008060] hover:bg-[#004c3f] text-white font-extrabold text-sm py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30"
                      >
                        <ShopifyLogo className="w-5 h-5 shrink-0" />
                        <span>Grant Permission & Install App</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {shopifyInstallStep === 'installing' && (
                  <div className="py-12 text-center space-y-4">
                    <RefreshCw className="h-10 w-10 text-[#008060] animate-spin mx-auto" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">Granting Permission on Shopify Admin...</h4>
                      <p className="text-xs text-slate-600 font-medium mt-1">Connecting {shopifyDomainInput || 'your Shopify store'} and redirecting to CustomerLens AI Step 2...</p>
                    </div>
                  </div>
                )}

                {shopifyInstallStep === 'success' && (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-14 w-14 bg-[#008060] text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">Permission Granted on Shopify!</h4>
                      <p className="text-xs text-emerald-800 font-bold mt-1">Redirecting you to Step 2: Select Your Survey Questions...</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION BULLETINS TIMING SETTINGS MODAL */}
      <AnimatePresence>
        {showNotificationSettingsModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl text-xl flex items-center justify-center">
                    <Settings size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Notification Schedule & Channel Settings</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationSettingsModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {settingsSaveStatus === 'reset' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <RotateCcw size={16} className="text-amber-600 shrink-0" />
                  <span>Reset to default: Direct CustomerLens Notification & 1 Day frequency!</span>
                </div>
              )}

              {settingsSaveStatus === 'saved' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#008060] shrink-0" />
                  <span>Notification settings saved successfully!</span>
                </div>
              )}

              <div className="space-y-5">
                {/* 1. Delivery Channel Choice (Select One or Both) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">
                      Notification Delivery Channels
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Choose One or Both</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: 'Direct Notification from CustomerLens',
                        title: 'Direct Notification from CustomerLens',
                        desc: 'Alerts & digests delivered directly inside your CustomerLens dashboard & app bar',
                        badge: 'CustomerLens'
                      },
                      {
                        id: 'Gmail / Email',
                        title: 'Email Notification (Gmail / Inbox)',
                        desc: 'Direct email notifications sent to your connected email inbox',
                        badge: 'Email'
                      }
                    ].map((ch) => {
                      const isSelected = selectedNotificationChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (selectedNotificationChannels.length > 1) {
                                setSelectedNotificationChannels(selectedNotificationChannels.filter(c => c !== ch.id));
                              }
                            } else {
                              setSelectedNotificationChannels([...selectedNotificationChannels, ch.id]);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                            isSelected 
                              ? 'border-[#008060] bg-emerald-50/60 text-slate-900 font-bold shadow-sm' 
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900">{ch.title}</p>
                              {ch.badge && (
                                <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                                  isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {ch.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-slate-500 leading-normal">{ch.desc}</p>
                          </div>
                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isSelected ? 'bg-[#008060] border-[#008060] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Frequency in Days (Digit Selector) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">
                      Notification Frequency (In Days)
                    </label>
                    <span className="text-[10px] font-mono font-extrabold text-[#008060] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Every {notificationFrequencyDaysNum} {notificationFrequencyDaysNum === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNotificationFrequencyDaysNum(prev => Math.max(1, prev - 1))}
                        className="h-10 w-12 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-800 shadow-sm transition-all cursor-pointer"
                        title="Decrease Days"
                      >
                        <Minus size={16} />
                      </button>

                      <div className="relative flex-1">
                        <input 
                          type="number"
                          min={1}
                          max={90}
                          value={notificationFrequencyDaysNum}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              setNotificationFrequencyDaysNum(Math.max(1, Math.min(90, val)));
                            } else {
                              setNotificationFrequencyDaysNum(1);
                            }
                          }}
                          className="w-full text-center py-2.5 px-3 bg-white border border-slate-200 focus:border-[#008060] rounded-xl text-sm font-extrabold text-slate-900 outline-none shadow-sm font-mono"
                          placeholder="1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setNotificationFrequencyDaysNum(prev => Math.min(90, prev + 1))}
                        className="h-10 w-12 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-800 shadow-sm transition-all cursor-pointer"
                        title="Increase Days"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono text-center">
                      Enter any digit (e.g., 1 for daily, 2 for every 2 days, 7 for weekly)
                    </p>
                  </div>
                </div>

                {/* 3. Delivery Time */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-600" />
                      Delivery Time (Local Time Zone)
                    </label>
                  </div>

                  <input 
                    type="time"
                    value={bulletinTime}
                    onChange={(e) => setBulletinTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#008060] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveBulletinSettings}
                  className="w-full sm:w-auto px-8 py-3 bg-[#008060] hover:bg-[#004c3f] text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save Notification Schedule</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: ADD QUESTION TYPES SELECTOR */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Select Question Type</h3>
              <button
                type="button"
                onClick={() => setIsAddQuestionOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {[
                { name: 'Multiple Choice', icon: '🔘' },
                { name: 'Rating', icon: '⭐' },
                { name: 'Text Answer', icon: '✏️' },
                { name: 'Yes / No', icon: '👍' },
                { name: 'NPS', icon: '📊' },
                { name: 'Email', icon: '✉️' },
                { name: 'Opinion Scale', icon: '🔢' },
                { name: 'Dropdown', icon: '🔽' },
                { name: 'Image Choice', icon: '🖼️' },
                { name: 'File Upload', icon: '📁' }
              ].map((qType) => (
                <button
                  key={qType.name}
                  type="button"
                  onClick={() => {
                    setSurveyQuestions(prev => [
                      ...prev,
                      {
                        id: 'q_' + Math.random().toString(36).substring(2, 6),
                        type: qType.name,
                        title: `New ${qType.name} Question`,
                        choices: qType.name === 'Multiple Choice' ? ['Option 1', 'Option 2'] : []
                      }
                    ]);
                    setIsAddQuestionOpen(false);
                  }}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 text-left transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="text-base">{qType.icon}</span>
                  <span>{qType.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIDE PANEL DRAWER: CUSTOMIZE SURVEY */}
      {isCustomizeDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <h3 className="font-extrabold text-slate-900 text-lg">Customize Survey</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomizeDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                {[
                  { id: 'theme', label: '🎨 Theme' },
                  { id: 'branding', label: '🖼 Branding' },
                  { id: 'layout', label: '📱 Layout' },
                  { id: 'animation', label: '✨ Animation' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCustomizeTab(tab.id as any)}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                      customizeTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: THEME */}
              {customizeTab === 'theme' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Colors</label>
                    <div className="flex items-center gap-3">
                      {['#008060', '#4F46E5', '#2563EB', '#D97706', '#DC2626', '#09090B'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSurveyThemeColor(color)}
                          className={`h-8 w-8 rounded-full border-2 cursor-pointer transition-transform ${
                            surveyThemeColor === color ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Fonts</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Sans-Serif', 'Serif', 'Mono', 'Display'].map((font) => (
                        <button
                          key={font}
                          type="button"
                          onClick={() => setSurveyFont(font)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                            surveyFont === font ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Buttons</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Rounded', 'Pill', 'Sharp'].map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => setSurveyButtonShape(shape)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                            surveyButtonShape === shape ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Border Radius</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['0px', '8px', '16px', '24px'].map((radius) => (
                        <button
                          key={radius}
                          type="button"
                          onClick={() => setSurveyBorderRadius(radius)}
                          className={`p-2 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                            surveyBorderRadius === radius ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          {radius}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANDING */}
              {customizeTab === 'branding' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Logo</label>
                    <input
                      type="text"
                      value={surveyLogo}
                      onChange={(e) => setSurveyLogo(e.target.value)}
                      placeholder="Store logo URL or name"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Background</label>
                    <div className="flex items-center gap-3">
                      {['#FFFFFF', '#F8FAFC', '#F0FDF4', '#FFFBEB', '#0F172A'].map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setSurveyBg(bg)}
                          className={`h-8 w-8 rounded-full border-2 cursor-pointer transition-transform ${
                            surveyBg === bg ? 'border-slate-900 scale-110' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: bg }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Doodles / Illustrations</label>
                    <button
                      type="button"
                      onClick={() => setSurveyDoodles(!surveyDoodles)}
                      className={`w-full p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between cursor-pointer transition-all ${
                        surveyDoodles ? 'bg-emerald-50 border-emerald-600 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>Enable Playful Doodles</span>
                      <span>{surveyDoodles ? '✓ ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: LAYOUT */}
              {customizeTab === 'layout' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700">Survey Position & Layout</label>
                  <div className="space-y-2">
                    {['Center Popup', 'Bottom Right', 'Slide In', 'Fullscreen', 'Embedded'].map((layout) => (
                      <button
                        key={layout}
                        type="button"
                        onClick={() => setSurveyLayout(layout)}
                        className={`w-full p-3 rounded-2xl border text-xs font-extrabold text-left transition-all cursor-pointer flex items-center justify-between ${
                          surveyLayout === layout ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>{layout}</span>
                        {surveyLayout === layout && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ANIMATION */}
              {customizeTab === 'animation' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700">Entry Transition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Fade', 'Slide', 'Scale'].map((anim) => (
                      <button
                        key={anim}
                        type="button"
                        onClick={() => setSurveyAnimation(anim)}
                        className={`p-3 rounded-2xl border text-xs font-extrabold text-center transition-all cursor-pointer ${
                          surveyAnimation === anim ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCustomizeDrawerOpen(false)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Save Customization
            </button>
          </div>
        </div>
      )}

      {/* GENERATE A SLIDE AI MODAL (MATCHING SCREENSHOT) */}
      {isUsePromptOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            
            {/* Header: Centered Title + Top Right Close */}
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between relative bg-white">
              <h3 className="font-extrabold text-slate-900 text-lg mx-auto text-center">
                Generate a Slide
              </h3>
              <button
                type="button"
                onClick={() => setIsUsePromptOpen(false)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold p-1 text-base cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Split Content Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
              
              {/* LEFT COLUMN: PROMPT INPUT & IDEAS */}
              <div className="md:col-span-7 p-6 md:p-8 space-y-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80">
                
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Describe the question you want to add and let AI create it for you. Be specific about what you want to learn and the type of answers you expect.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase">
                      I WANT TO ASK ABOUT...
                    </label>
                    <textarea
                      value={customPromptText}
                      onChange={(e) => setCustomPromptText(e.target.value)}
                      placeholder=""
                      className="w-full h-28 p-3.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none shadow-2xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!customPromptText.trim()) return;
                      const newId = 'ai_' + Math.random().toString(36).substring(2, 7);
                      const newSlide: ManagedSlideItem = {
                        id: newId,
                        title: customPromptText,
                        type: 'Single Choice',
                        typeIcon: '🤖',
                        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied']
                      };
                      setManagedSlides(prev => {
                        const thankYouIndex = prev.findIndex(s => s.type === 'Promo Code' || s.title.toLowerCase().includes('thanks'));
                        if (thankYouIndex !== -1) {
                          const copy = [...prev];
                          copy.splice(thankYouIndex, 0, newSlide);
                          return copy;
                        }
                        return [...prev, newSlide];
                      });
                      setActiveManagedSlideId(newId);
                      setIsUsePromptOpen(false);
                      setQuestionViewMode('management');
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                      customPromptText.trim()
                        ? 'bg-[#6b52ae] hover:bg-[#584196] text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={15} />
                    <span>Generate slide</span>
                  </button>
                </div>

                {/* Lower Section: IDEAS FOR YOU */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase">
                    IDEAS FOR YOU:
                  </span>
                  
                  <div className="flex flex-col gap-2">
                    {[
                      'Ask customers how satisfied they are with their purchase',
                      'Ask how likely they are to recommend us to a friend',
                      'Ask what we could do to improve their experience',
                      'Ask how customers heard about us'
                    ].map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setCustomPromptText(idea)}
                        className="text-left px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300/80 rounded-xl text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs hover:border-slate-400"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: SLIDE PREVIEW BOX */}
              <div className="md:col-span-5 p-6 md:p-8 flex flex-col items-center justify-center bg-white">
                {customPromptText.trim() ? (
                  <div className="w-full bg-white border border-slate-300 rounded-2xl p-6 shadow-lg space-y-4 text-slate-900 animate-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md">
                      AI Generated Preview
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {customPromptText}
                    </h4>
                    <div className="space-y-1.5">
                      {['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'].map((opt) => (
                        <div key={opt} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                          {opt}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = 'ai_' + Math.random().toString(36).substring(2, 7);
                        const newSlide: ManagedSlideItem = {
                          id: newId,
                          title: customPromptText,
                          type: 'Single Choice',
                          typeIcon: '🤖',
                          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied']
                        };
                        setManagedSlides(prev => {
                          const thankYouIndex = prev.findIndex(s => s.type === 'Promo Code' || s.title.toLowerCase().includes('thanks'));
                          if (thankYouIndex !== -1) {
                            const copy = [...prev];
                            copy.splice(thankYouIndex, 0, newSlide);
                            return copy;
                          }
                          return [...prev, newSlide];
                        });
                        setActiveManagedSlideId(newId);
                        setIsUsePromptOpen(false);
                        setQuestionViewMode('management');
                      }}
                      className="w-full py-2.5 bg-[#008060] hover:bg-[#006e52] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
                    >
                      Add Slide to Survey
                    </button>
                  </div>
                ) : (
                  <div className="w-full border-2 border-slate-200 rounded-2xl p-8 text-center space-y-2 flex flex-col items-center justify-center min-h-[220px]">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      Slide Preview
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      Describe what you want to ask and generate a slide to preview it.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* FULL SURVEY PREVIEW MODAL */}
      {isFullPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsFullPreviewOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold p-1 text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                👁️
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Full Survey Live Preview</h3>
                <p className="text-xs text-slate-500">Previewing all {managedSlides.length} slides with active AI follow-up logic.</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
              {managedSlides.map((slide, idx) => (
                <div key={slide.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      Slide {idx + 1} • {slide.type}
                    </span>
                    {slide.conditionText && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Conditional AI Follow-Up
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{slide.title}</h4>
                  {slide.conditionText && (
                    <p className="text-xs text-emerald-700 bg-emerald-50/80 border border-emerald-200 p-2 rounded-xl font-medium">
                      {slide.conditionText}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsFullPreviewOpen(false)}
                className="px-6 py-2.5 bg-[#232f3e] hover:bg-[#1a232e] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW QUESTION (SLIDE) MODAL */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsAddQuestionModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold p-1 text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-[#0266c8] flex items-center justify-center font-bold text-lg">
                <PlusCircle size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Add New Question (Slide)</h3>
                <p className="text-xs text-slate-500">Create a custom slide question to add to your survey flow.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Question Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                  QUESTION / SLIDE TITLE
                </label>
                <input
                  type="text"
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="e.g. How satisfied are you with our delivery time?"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0266c8] shadow-2xs"
                />
              </div>

              {/* Question Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                  QUESTION TYPE
                </label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0266c8] cursor-pointer shadow-2xs"
                >
                  <option value="Single Choice">🔘 Single Choice (Radio Buttons)</option>
                  <option value="Multiple Choice">☑️ Multiple Choice (Checkboxes)</option>
                  <option value="Satisfaction">😍 Satisfaction Rating (1-5 Emojis)</option>
                  <option value="Long Answer">💬 Long Answer (Text Area)</option>
                  <option value="Short Answer">✏️ Short Answer (Single Line)</option>
                  <option value="Binary Choice">⚖️ Binary Choice (Yes / No)</option>
                  <option value="Range">📊 Range Scale (1 - 5)</option>
                </select>
              </div>

              {/* Options List for Choice questions */}
              {['Single Choice', 'Multiple Choice', 'Binary Choice'].includes(newQuestionType) && (
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                    ANSWER OPTIONS
                  </label>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {newQuestionOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newQuestionOptions];
                            updated[idx] = e.target.value;
                            setNewQuestionOptions(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setNewQuestionOptions(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      placeholder="Add another option..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newOptionInput.trim()) {
                          e.preventDefault();
                          setNewQuestionOptions(prev => [...prev, newOptionInput.trim()]);
                          setNewOptionInput('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newOptionInput.trim()) {
                          setNewQuestionOptions(prev => [...prev, newOptionInput.trim()]);
                          setNewOptionInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewCustomQuestion}
                disabled={!newQuestionTitle.trim()}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer ${
                  newQuestionTitle.trim()
                    ? 'bg-[#0266c8] hover:bg-[#0252a3] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                + Add Question to Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD AI FOLLOW-UP MODAL */}
      {isAddFollowUpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsAddFollowUpModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold p-1 text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Add Smart AI Follow-Up</h3>
                <p className="text-xs text-slate-500">Attach an intelligent AI follow-up branch based on customer responses.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Target Parent Question */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                  FOLLOW UP AFTER QUESTION
                </label>
                <select
                  value={followUpParentSlideId}
                  onChange={(e) => setFollowUpParentSlideId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                >
                  {managedSlides.map((slide, idx) => (
                    <option key={slide.id} value={slide.id}>
                      Slide {idx + 1}: {slide.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger Condition */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                  TRIGGER CONDITION (IF CUSTOMER SAYS...)
                </label>
                <input
                  type="text"
                  value={followUpConditionText}
                  onChange={(e) => setFollowUpConditionText(e.target.value)}
                  placeholder="e.g. If customer gives negative rating or hesitates"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'If answer is Unsatisfied',
                    'If rating is lower than 3',
                    'If answer is Yes',
                    'Always follow up with AI'
                  ].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFollowUpConditionText(cond)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200 cursor-pointer"
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Follow-Up Question Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                  AI FOLLOW-UP QUESTION
                </label>
                <input
                  type="text"
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  placeholder="e.g. What specific issues did you encounter?"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>

              {/* Follow-up Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block font-mono">
                  RESPONSE TYPE
                </label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                >
                  <option value="Long Answer">💬 Long Answer (Text Area)</option>
                  <option value="Short Answer">✏️ Short Answer (Single Line)</option>
                  <option value="Multiple Choice">☑️ Multiple Choice Options</option>
                  <option value="Satisfaction">😍 Satisfaction Rating</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsAddFollowUpModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewAiFollowUp}
                disabled={!followUpTitle.trim()}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 ${
                  followUpTitle.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles size={14} />
                <span>+ Attach AI Follow-Up</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
