import type {
  TenantPlan,
  UserRole,
  UserStatus,
  BusinessStatus,
  BusinessCategory,
  ReviewPlatform,
  ReviewStatus,
  SentimentType,
  WhatsAppProviderName,
  AIProviderName,
  PaymentProviderName,
  ProviderType,
  WAConversationStatus,
  WAMessageDirection,
  WAMessageStatus,
  WACampaignStatus,
  WATemplateStatus,
  WATemplateCategory,
  DiscountType,
  OfferStatus,
  LoyaltyTransactionType,
  QRCodeType,
  PaymentStatus,
  SubscriptionStatus,
  VerificationType,
  VerificationStatus,
  FlowStatus,
  PromotionType,
  CrossPromotionStatus,
  ReviewCampaignTriggerType,
} from '../enums/index.js';

// ============================================================
// BASE TYPES
// ============================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================
// TENANT & USER
// ============================================================

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  plan: TenantPlan;
  settings: Record<string, unknown>;
}

export interface User extends BaseEntity {
  tenantId: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  metadata: Record<string, unknown>;
}

// ============================================================
// BUSINESS
// ============================================================

export interface Business extends BaseEntity {
  tenantId: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  gstin?: string | null;
  pan?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  status: BusinessStatus;
  gbpLocationId?: string | null;
  gbpSyncEnabled: boolean;
  settings: Record<string, unknown>;
}

export interface Branch extends BaseEntity {
  businessId: string;
  name: string;
  address: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  managerId?: string | null;
  isActive: boolean;
  settings: Record<string, unknown>;
}

export interface Staff extends BaseEntity {
  businessId: string;
  userId: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

// ============================================================
// CUSTOMER
// ============================================================

export interface Customer extends BaseEntity {
  businessId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  loyaltyPoints: number;
  totalSpend: number;
  visitCount: number;
  lastVisitAt?: Date | null;
  isBlocked: boolean;
  waId?: string | null;
}

// ============================================================
// REVIEWS
// ============================================================

export interface Review extends BaseEntity {
  businessId: string;
  platform: ReviewPlatform;
  externalId?: string | null;
  authorName: string;
  authorPhoto?: string | null;
  rating: number;
  content?: string | null;
  reply?: string | null;
  repliedAt?: Date | null;
  sentiment?: SentimentType | null;
  aiReplyDraft?: string | null;
  status: ReviewStatus;
  reviewedAt: Date;
}

export interface ReviewCampaign extends BaseEntity {
  businessId: string;
  name: string;
  triggerType: ReviewCampaignTriggerType;
  messageTemplate: string;
  isActive: boolean;
  stats: ReviewCampaignStats;
}

export interface ReviewCampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  reviews: number;
}

// ============================================================
// WHATSAPP
// ============================================================

export interface WhatsAppConfig extends BaseEntity {
  tenantId: string;
  provider: WhatsAppProviderName;
  providerConfig: Record<string, unknown>; // encrypted
  phoneNumber: string;
  displayName?: string | null;
  status: string;
  isDefault: boolean;
}

export interface WhatsAppTemplate extends BaseEntity {
  businessId: string;
  name: string;
  category: WATemplateCategory;
  language: string;
  components: WATemplateComponent[];
  status: WATemplateStatus;
  providerTemplateId?: string | null;
  rejectionReason?: string | null;
}

export interface WATemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: WATemplateButton[];
  example?: {
    header_text?: string[];
    body_text?: string[][];
  };
}

export interface WATemplateButton {
  type: 'QUICK_REPLY' | 'CALL_TO_ACTION';
  text: string;
  phone_number?: string;
  url?: string;
}

export interface WhatsAppConversation extends BaseEntity {
  businessId: string;
  customerId?: string | null;
  waId: string;
  status: WAConversationStatus;
  lastMessageAt?: Date | null;
  assignedTo?: string | null;
  metadata: Record<string, unknown>;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  direction: WAMessageDirection;
  content: WAMessageContent;
  status: WAMessageStatus;
  waMessageId?: string | null;
  sentAt?: Date | null;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  createdAt: Date;
}

export interface WAMessageContent {
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template' | 'interactive' | 'location';
  text?: string;
  mediaUrl?: string;
  caption?: string;
  templateName?: string;
  templateParams?: Record<string, unknown>;
  interactive?: Record<string, unknown>;
  location?: { lat: number; lng: number; name?: string };
}

export interface WhatsAppCampaign extends BaseEntity {
  businessId: string;
  name: string;
  templateId: string;
  audienceFilter: CustomerFilter;
  status: WACampaignStatus;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  stats: WACampaignStats;
}

export interface WACampaignStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  replied: number;
}

export interface CustomerFilter {
  tags?: string[];
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
  minSpend?: number;
  maxSpend?: number;
  lastVisitDaysAgo?: number;
  cities?: string[];
  customQuery?: Record<string, unknown>;
}

// ============================================================
// OFFERS & LOYALTY
// ============================================================

export interface Offer extends BaseEntity {
  businessId: string;
  title: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
  maxUses?: number | null;
  usesCount: number;
  validFrom: Date;
  validTo: Date;
  terms?: string | null;
  imageUrl?: string | null;
  status: OfferStatus;
}

export interface Coupon {
  id: string;
  offerId: string;
  code: string;
  uses: number;
  maxUses: number;
  customerId?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

export interface LoyaltyProgram extends BaseEntity {
  businessId: string;
  name: string;
  pointsPerRupee: number;
  redemptionRate: number;
  minRedemption: number;
  maxRedemptionPct: number;
  tiers: LoyaltyTier[];
  isActive: boolean;
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  badgeUrl?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  businessId: string;
  points: number;
  type: LoyaltyTransactionType;
  referenceId?: string | null;
  description?: string | null;
  createdAt: Date;
}

// ============================================================
// AI
// ============================================================

export interface AIProviderConfig extends BaseEntity {
  tenantId: string;
  provider: AIProviderName;
  apiKeyEncrypted: string;
  baseUrl?: string | null;
  modelDefaults: Record<string, unknown>;
  isActive: boolean;
  priority: number;
}

export interface AIRoutingRule extends BaseEntity {
  tenantId: string;
  useCase: string;
  provider: AIProviderName;
  model: string;
  fallbackProvider?: AIProviderName | null;
  fallbackModel?: string | null;
  maxCostPerToken?: number | null;
  isActive: boolean;
}

export interface AIUsageLog {
  id: string;
  tenantId: string;
  businessId?: string | null;
  provider: AIProviderName;
  model: string;
  useCase: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  errorMsg?: string | null;
  createdAt: Date;
}

// ============================================================
// PROVIDER CONFIG (generic)
// ============================================================

export interface ProviderConfig extends BaseEntity {
  tenantId: string;
  providerType: ProviderType;
  providerName: string;
  config: Record<string, unknown>;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
}

// ============================================================
// PAYMENTS
// ============================================================

export interface Payment extends BaseEntity {
  businessId: string;
  customerId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProviderName;
  providerPaymentId?: string | null;
  providerOrderId?: string | null;
  description?: string | null;
  metadata: Record<string, unknown>;
}

// ============================================================
// QR CODES
// ============================================================

export interface QRCode extends BaseEntity {
  businessId: string;
  name: string;
  type: QRCodeType;
  targetUrl: string;
  qrImageUrl?: string | null;
  scanCount: number;
  settings: Record<string, unknown>;
  isActive: boolean;
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export interface Plan extends BaseEntity {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: PlanLimits;
  isActive: boolean;
}

export interface PlanLimits {
  businesses: number;
  branches: number;
  customers: number;
  waMessages: number;
  aiRequests: number;
  storage: number; // GB
}

export interface Subscription extends BaseEntity {
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentProviderSubId?: string | null;
  metadata: Record<string, unknown>;
}

// ============================================================
// VERIFICATIONS
// ============================================================

export interface BusinessVerification extends BaseEntity {
  businessId: string;
  type: VerificationType;
  status: VerificationStatus;
  verifiedData: Record<string, unknown>;
  documents: string[];
  verifiedAt?: Date | null;
  expiresAt?: Date | null;
}

// ============================================================
// WEBHOOKS
// ============================================================

export interface Webhook extends BaseEntity {
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
}

// ============================================================
// CROSS PROMOTIONS
// ============================================================

export interface CrossPromotion extends BaseEntity {
  businessId: string;
  partnerBusinessId: string;
  type: PromotionType;
  content: Record<string, unknown>;
  status: CrossPromotionStatus;
  validFrom?: Date | null;
  validTo?: Date | null;
}

// ============================================================
// ANALYTICS
// ============================================================

export interface BusinessAnalytic {
  id: string;
  businessId: string;
  date: Date;
  metricType: string;
  value: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export type MetricType =
  | 'reviews_received'
  | 'reviews_replied'
  | 'average_rating'
  | 'wa_messages_sent'
  | 'wa_messages_received'
  | 'wa_campaign_sent'
  | 'customers_added'
  | 'payments_received'
  | 'revenue'
  | 'loyalty_points_issued'
  | 'loyalty_points_redeemed'
  | 'qr_scans'
  | 'offers_redeemed'
  | 'ai_requests';
