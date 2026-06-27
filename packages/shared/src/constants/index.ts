// ============================================================
// LocalEdge - Shared Constants
// ============================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const AI_USE_CASES = {
  REVIEW_REPLY: 'review_reply',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
  CHAT: 'chat',
  CONTENT_GENERATION: 'content_generation',
  OFFER_SUGGESTION: 'offer_suggestion',
  CUSTOMER_INSIGHT: 'customer_insight',
  WHATSAPP_FLOW: 'whatsapp_flow',
  TRANSLATION: 'translation',
  SUMMARIZATION: 'summarization',
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

export const QUEUE_NAMES = {
  REVIEW_REPLY: 'review-reply',
  WA_CAMPAIGN: 'whatsapp-campaign',
  WA_MESSAGE: 'whatsapp-message',
  ANALYTICS: 'analytics',
  WEBHOOK_DELIVERY: 'webhook-delivery',
  PAYMENT_TRIGGER: 'payment-trigger',
  EMAIL: 'email',
  SMS: 'sms',
  GBP_SYNC: 'gbp-sync',
} as const;

export const PLAN_LIMITS = {
  FREE: {
    businesses: 1,
    branches: 1,
    customers: 100,
    waMessages: 100,
    aiRequests: 50,
    storage: 0.5, // GB
  },
  STARTER: {
    businesses: 1,
    branches: 3,
    customers: 1000,
    waMessages: 1000,
    aiRequests: 500,
    storage: 5,
  },
  GROWTH: {
    businesses: 5,
    branches: 10,
    customers: 10000,
    waMessages: 10000,
    aiRequests: 5000,
    storage: 50,
  },
  ENTERPRISE: {
    businesses: -1, // unlimited
    branches: -1,
    customers: -1,
    waMessages: -1,
    aiRequests: -1,
    storage: 500,
  },
} as const;

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const ENCRYPTION_KEY_LENGTH = 32;

export const JWT_HEADER = 'Authorization';
export const JWT_PREFIX = 'Bearer';

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

export const REVIEW_PLATFORMS_CONFIG: Record<string, { name: string; ratingMax: number; icon: string }> = {
  GOOGLE: { name: 'Google', ratingMax: 5, icon: 'google' },
  FACEBOOK: { name: 'Facebook', ratingMax: 5, icon: 'facebook' },
  ZOMATO: { name: 'Zomato', ratingMax: 5, icon: 'zomato' },
  SWIGGY: { name: 'Swiggy', ratingMax: 5, icon: 'swiggy' },
  JUSTDIAL: { name: 'JustDial', ratingMax: 5, icon: 'justdial' },
  SULEKHA: { name: 'Sulekha', ratingMax: 5, icon: 'sulekha' },
  YELP: { name: 'Yelp', ratingMax: 5, icon: 'yelp' },
  TRIPADVISOR: { name: 'TripAdvisor', ratingMax: 5, icon: 'tripadvisor' },
  INTERNAL: { name: 'Internal', ratingMax: 5, icon: 'star' },
};

export const WHATSAPP_WINDOW_HOURS = 24;
export const WHATSAPP_MAX_TEMPLATE_PARAMS = 10;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
] as const;
