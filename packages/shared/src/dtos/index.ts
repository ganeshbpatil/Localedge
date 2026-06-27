import type {
  BusinessCategory,
  ReviewPlatform,
  DiscountType,
  QRCodeType,
  WATemplateCategory,
  CustomerFilter,
} from '../types/index.js';

// ============================================================
// AUTH DTOs
// ============================================================

export interface SendOtpDto {
  phone: string;
  tenantSlug?: string;
}

export interface VerifyOtpDto {
  phone: string;
  otp: string;
  tenantSlug?: string;
}

export interface LoginDto {
  email?: string;
  phone?: string;
  password?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    tenantId: string;
  };
}

// ============================================================
// BUSINESS DTOs
// ============================================================

export interface CreateBusinessDto {
  name: string;
  category: BusinessCategory;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
}

export interface UpdateBusinessDto extends Partial<CreateBusinessDto> {
  gbpSyncEnabled?: boolean;
  settings?: Record<string, unknown>;
}

// ============================================================
// CUSTOMER DTOs
// ============================================================

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  isBlocked?: boolean;
}

// ============================================================
// REVIEW DTOs
// ============================================================

export interface ReplyToReviewDto {
  reply: string;
}

export interface GenerateAIReplyDto {
  reviewId: string;
  tone?: 'professional' | 'friendly' | 'apologetic' | 'thankful';
  language?: string;
}

export interface CreateReviewDto {
  platform: ReviewPlatform;
  externalId?: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  content?: string;
  reviewedAt: Date;
}

// ============================================================
// WHATSAPP DTOs
// ============================================================

export interface SendTextMessageDto {
  to: string;
  text: string;
  businessId: string;
}

export interface SendTemplateMessageDto {
  to: string;
  templateName: string;
  templateParams: Record<string, unknown>;
  businessId: string;
  language?: string;
}

export interface CreateWACampaignDto {
  name: string;
  templateId: string;
  audienceFilter: CustomerFilter;
  scheduledAt?: Date;
}

export interface CreateWATemplateDto {
  name: string;
  category: WATemplateCategory;
  language?: string;
  components: Record<string, unknown>[];
}

// ============================================================
// OFFER DTOs
// ============================================================

export interface CreateOfferDto {
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  maxUses?: number;
  validFrom: Date;
  validTo: Date;
  terms?: string;
}

export interface UpdateOfferDto extends Partial<CreateOfferDto> {
  status?: string;
}

// ============================================================
// QR CODE DTOs
// ============================================================

export interface CreateQRCodeDto {
  name: string;
  type: QRCodeType;
  targetUrl?: string;
  settings?: Record<string, unknown>;
}

// ============================================================
// PROVIDER CONFIG DTOs
// ============================================================

export interface SetWhatsAppProviderDto {
  provider: string;
  config: Record<string, unknown>; // provider-specific config
  phoneNumber: string;
  displayName?: string;
}

export interface SetAIProviderDto {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  modelDefaults?: Record<string, unknown>;
  priority?: number;
}

export interface SetPaymentProviderDto {
  provider: string;
  config: Record<string, unknown>;
  isDefault?: boolean;
}

export interface SetRoutingRuleDto {
  useCase: string;
  provider: string;
  model: string;
  fallbackProvider?: string;
  fallbackModel?: string;
}

// ============================================================
// ANALYTICS DTOs
// ============================================================

export interface AnalyticsQueryDto {
  businessId: string;
  startDate: Date;
  endDate: Date;
  metrics: string[];
}

export interface DashboardMetrics {
  reviewsReceived: number;
  averageRating: number;
  pendingReplies: number;
  totalCustomers: number;
  waMessagesSent: number;
  revenue: number;
  loyaltyPointsIssued: number;
}

// ============================================================
// LOYALTY DTOs
// ============================================================

export interface SetupLoyaltyProgramDto {
  name: string;
  pointsPerRupee: number;
  redemptionRate: number;
  minRedemption?: number;
  maxRedemptionPct?: number;
  tiers?: {
    name: string;
    minPoints: number;
    benefits: string[];
  }[];
}

export interface AwardPointsDto {
  customerId: string;
  points: number;
  type: string;
  referenceId?: string;
  description?: string;
}

// ============================================================
// PAGINATION DTOs
// ============================================================

export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchDto extends PaginationDto {
  q?: string;
}
