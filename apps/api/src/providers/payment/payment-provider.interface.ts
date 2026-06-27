// ============================================================
// Payment Provider Interface
// ============================================================

export interface CreateOrderOptions {
  amount: number; // in paisa/cents
  currency: string;
  description?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl?: string;
  metadata: Record<string, unknown>;
}

export interface PaymentVerification {
  success: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  metadata: Record<string, unknown>;
}

export interface RefundOptions {
  paymentId: string;
  amount?: number; // partial refund; omit for full refund
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
}

export interface PaymentProviderConfig {
  [key: string]: unknown;
}

export interface IPaymentProvider {
  readonly providerName: string;

  /**
   * Create a payment order
   */
  createOrder(options: CreateOrderOptions, config: PaymentProviderConfig): Promise<PaymentOrder>;

  /**
   * Verify a payment after the user completes it
   */
  verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
    config: PaymentProviderConfig,
  ): Promise<PaymentVerification>;

  /**
   * Process a refund
   */
  refund(options: RefundOptions, config: PaymentProviderConfig): Promise<RefundResult>;

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(
    rawBody: string,
    signature: string,
    config: PaymentProviderConfig,
  ): boolean;

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: unknown, config: PaymentProviderConfig): PaymentWebhookEvent;
}

export interface PaymentWebhookEvent {
  eventType: 'payment.success' | 'payment.failed' | 'refund.success' | 'refund.failed' | 'unknown';
  paymentId: string;
  orderId: string;
  amount?: number;
  status: string;
  rawPayload: unknown;
}
