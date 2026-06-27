import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import type {
  IPaymentProvider,
  CreateOrderOptions,
  PaymentOrder,
  PaymentVerification,
  RefundOptions,
  RefundResult,
  PaymentProviderConfig,
  PaymentWebhookEvent,
} from './payment-provider.interface.js';

interface RazorpayConfig extends PaymentProviderConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

@Injectable()
export class RazorpayProvider implements IPaymentProvider {
  readonly providerName = 'RAZORPAY';
  private readonly logger = new Logger(RazorpayProvider.name);
  private readonly baseUrl = 'https://api.razorpay.com/v1';

  private getAuthHeader(cfg: RazorpayConfig): string {
    return `Basic ${Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString('base64')}`;
  }

  private async request(
    method: string,
    path: string,
    config: RazorpayConfig,
    body?: unknown,
  ): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.getAuthHeader(config),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Razorpay error ${response.status}: ${error}`);
    }

    return response.json();
  }

  async createOrder(options: CreateOrderOptions, config: PaymentProviderConfig): Promise<PaymentOrder> {
    const cfg = config as RazorpayConfig;
    try {
      const result = await this.request('POST', '/orders', cfg, {
        amount: options.amount, // in paisa
        currency: options.currency,
        receipt: options.customerId ?? `order_${Date.now()}`,
        notes: options.metadata ?? {},
      }) as { id: string; amount: number; currency: string; status: string };

      return {
        orderId: result.id,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        metadata: { keyId: cfg.keyId },
      };
    } catch (error) {
      this.logger.error('Razorpay createOrder failed', error);
      throw error;
    }
  }

  async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
    config: PaymentProviderConfig,
  ): Promise<PaymentVerification> {
    const cfg = config as RazorpayConfig;

    const expectedSignature = crypto
      .createHmac('sha256', cfg.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return {
        success: false,
        paymentId,
        orderId,
        amount: 0,
        currency: 'INR',
        status: 'failed',
        metadata: { error: 'Invalid signature' },
      };
    }

    try {
      const payment = await this.request('GET', `/payments/${paymentId}`, cfg) as {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
      };

      return {
        success: payment.status === 'captured',
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status === 'captured' ? 'success' : 'failed',
        metadata: {},
      };
    } catch (error) {
      this.logger.error('Razorpay verifyPayment failed', error);
      throw error;
    }
  }

  async refund(options: RefundOptions, config: PaymentProviderConfig): Promise<RefundResult> {
    const cfg = config as RazorpayConfig;
    try {
      const body: Record<string, unknown> = {};
      if (options.amount) body['amount'] = options.amount;
      if (options.reason) body['notes'] = { reason: options.reason };

      const result = await this.request('POST', `/payments/${options.paymentId}/refund`, cfg, body) as {
        id: string;
        amount: number;
        status: string;
      };

      return {
        refundId: result.id,
        amount: result.amount,
        status: result.status === 'processed' ? 'success' : 'pending',
      };
    } catch (error) {
      this.logger.error('Razorpay refund failed', error);
      throw error;
    }
  }

  validateWebhookSignature(rawBody: string, signature: string, config: PaymentProviderConfig): boolean {
    const cfg = config as RazorpayConfig;
    const expected = crypto
      .createHmac('sha256', cfg.webhookSecret)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }

  parseWebhookEvent(payload: unknown, _config: PaymentProviderConfig): PaymentWebhookEvent {
    const data = payload as {
      event?: string;
      payload?: {
        payment?: { entity?: { id: string; order_id: string; amount: number; status: string } };
        refund?: { entity?: { id: string; payment_id: string; amount: number; status: string } };
      };
    };

    const event = data.event ?? '';
    const entity = data.payload?.payment?.entity;
    const refundEntity = data.payload?.refund?.entity;

    if (event === 'payment.captured' && entity) {
      return {
        eventType: 'payment.success',
        paymentId: entity.id,
        orderId: entity.order_id,
        amount: entity.amount,
        status: entity.status,
        rawPayload: payload,
      };
    }

    if (event === 'payment.failed' && entity) {
      return {
        eventType: 'payment.failed',
        paymentId: entity.id,
        orderId: entity.order_id,
        amount: entity.amount,
        status: entity.status,
        rawPayload: payload,
      };
    }

    if (event.startsWith('refund.') && refundEntity) {
      return {
        eventType: event === 'refund.processed' ? 'refund.success' : 'refund.failed',
        paymentId: refundEntity.payment_id,
        orderId: '',
        amount: refundEntity.amount,
        status: refundEntity.status,
        rawPayload: payload,
      };
    }

    return { eventType: 'unknown', paymentId: '', orderId: '', status: '', rawPayload: payload };
  }
}
