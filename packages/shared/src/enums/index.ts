// ============================================================
// LocalEdge - Shared Enums
// ============================================================

export enum TenantPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export enum BusinessCategory {
  RESTAURANT = 'RESTAURANT',
  RETAIL = 'RETAIL',
  SALON = 'SALON',
  GYM = 'GYM',
  CLINIC = 'CLINIC',
  PHARMACY = 'PHARMACY',
  GROCERY = 'GROCERY',
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  JEWELLERY = 'JEWELLERY',
  REAL_ESTATE = 'REAL_ESTATE',
  EDUCATION = 'EDUCATION',
  HOTEL = 'HOTEL',
  TRAVEL = 'TRAVEL',
  AUTOMOTIVE = 'AUTOMOTIVE',
  FINANCE = 'FINANCE',
  LEGAL = 'LEGAL',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SERVICES = 'SERVICES',
  OTHER = 'OTHER',
}

export enum ReviewPlatform {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  ZOMATO = 'ZOMATO',
  SWIGGY = 'SWIGGY',
  JUSTDIAL = 'JUSTDIAL',
  SULEKHA = 'SULEKHA',
  YELP = 'YELP',
  TRIPADVISOR = 'TRIPADVISOR',
  INTERNAL = 'INTERNAL',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  REPLIED = 'REPLIED',
  IGNORED = 'IGNORED',
  FLAGGED = 'FLAGGED',
}

export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

// WhatsApp Providers - all supported providers
export enum WhatsAppProviderName {
  META_CLOUD = 'META_CLOUD',
  TWILIO = 'TWILIO',
  GUPSHUP = 'GUPSHUP',
  INTERAKT = 'INTERAKT',
  AISENSY = 'AISENSY',
  DIALOG360 = 'DIALOG360',
}

// AI/LLM Providers - all supported providers
export enum AIProviderName {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GEMINI = 'GEMINI',
  GROQ = 'GROQ',
  DEEPSEEK = 'DEEPSEEK',
  MISTRAL = 'MISTRAL',
  OLLAMA = 'OLLAMA',
  AZURE_OPENAI = 'AZURE_OPENAI',
  COHERE = 'COHERE',
}

// Payment Providers
export enum PaymentProviderName {
  RAZORPAY = 'RAZORPAY',
  CASHFREE = 'CASHFREE',
  PHONEPE = 'PHONEPE',
  STRIPE = 'STRIPE',
  PAYTM = 'PAYTM',
}

// SMS Providers
export enum SMSProviderName {
  MSG91 = 'MSG91',
  TWILIO = 'TWILIO',
  FAST2SMS = 'FAST2SMS',
  EXOTEL = 'EXOTEL',
}

// Email Providers
export enum EmailProviderName {
  RESEND = 'RESEND',
  MAILGUN = 'MAILGUN',
  SENDGRID = 'SENDGRID',
  SES = 'SES',
  POSTMARK = 'POSTMARK',
}

// Storage Providers
export enum StorageProviderName {
  CLOUDFLARE_R2 = 'CLOUDFLARE_R2',
  AWS_S3 = 'AWS_S3',
  GCS = 'GCS',
  BACKBLAZE = 'BACKBLAZE',
}

// Maps Providers
export enum MapsProviderName {
  GOOGLE_MAPS = 'GOOGLE_MAPS',
  MAPBOX = 'MAPBOX',
  OPENSTREETMAP = 'OPENSTREETMAP',
}

// Push Notification Providers
export enum PushProviderName {
  FIREBASE = 'FIREBASE',
  ONESIGNAL = 'ONESIGNAL',
}

export enum ProviderType {
  WHATSAPP = 'WHATSAPP',
  AI = 'AI',
  PAYMENT = 'PAYMENT',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  MAPS = 'MAPS',
  STORAGE = 'STORAGE',
  PUSH = 'PUSH',
}

export enum WAConversationStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  PENDING = 'PENDING',
  BOT = 'BOT',
}

export enum WAMessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum WAMessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum WACampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum WATemplateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum WATemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  FREE_ITEM = 'FREE_ITEM',
}

export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  DRAFT = 'DRAFT',
}

export enum LoyaltyTransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  EXPIRE = 'EXPIRE',
  ADJUST = 'ADJUST',
  BONUS = 'BONUS',
}

export enum QRCodeType {
  REVIEW = 'REVIEW',
  WHATSAPP = 'WHATSAPP',
  PAYMENT = 'PAYMENT',
  MENU = 'MENU',
  OFFER = 'OFFER',
  LOYALTY = 'LOYALTY',
  WIFI = 'WIFI',
  CUSTOM = 'CUSTOM',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  EXPIRED = 'EXPIRED',
}

export enum VerificationType {
  GST = 'GST',
  PAN = 'PAN',
  AADHAAR = 'AADHAAR',
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  FSSAI = 'FSSAI',
  GBP = 'GBP',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum FlowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export enum PromotionType {
  CROSS_SELL = 'CROSS_SELL',
  REFERRAL = 'REFERRAL',
  JOINT_OFFER = 'JOINT_OFFER',
  AREA_PROMOTION = 'AREA_PROMOTION',
}

export enum CrossPromotionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum ReviewCampaignTriggerType {
  AFTER_PAYMENT = 'AFTER_PAYMENT',
  AFTER_VISIT = 'AFTER_VISIT',
  AFTER_ORDER = 'AFTER_ORDER',
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
}

export enum WebhookEventType {
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  REVIEW_REPLIED = 'REVIEW_REPLIED',
  WHATSAPP_MESSAGE_RECEIVED = 'WHATSAPP_MESSAGE_RECEIVED',
  WHATSAPP_CAMPAIGN_COMPLETED = 'WHATSAPP_CAMPAIGN_COMPLETED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  OFFER_REDEEMED = 'OFFER_REDEEMED',
  LOYALTY_POINTS_EARNED = 'LOYALTY_POINTS_EARNED',
  QR_SCANNED = 'QR_SCANNED',
  BUSINESS_CREATED = 'BUSINESS_CREATED',
  SUBSCRIPTION_CHANGED = 'SUBSCRIPTION_CHANGED',
}

// AI use cases for routing
export enum AIUseCase {
  REVIEW_REPLY = 'review_reply',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  CHAT = 'chat',
  CONTENT_GENERATION = 'content_generation',
  OFFER_SUGGESTION = 'offer_suggestion',
  CUSTOMER_INSIGHT = 'customer_insight',
  WHATSAPP_FLOW = 'whatsapp_flow',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
}
