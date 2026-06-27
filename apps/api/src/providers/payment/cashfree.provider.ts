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

interface CashfreeConfig extends PaymentProviderConfig {
  appId: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
}

@Injectable()
export class CashfreeProvider implements IPaymentProvider {
  readonly providerName = 'CASHFREE';
  private readonly logger = new Logger(CashfreeProvider.name);

  private getBaseUrl(cfg: CashfreeConfig): string {
    return cfg.environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  private async request(method: string, path: string, cfg: CashfreeConfig, body?: unknown): Promise<unknown> {
    const response = await fetch(`${this.getBaseUrl(cfg)}${path}`, {
      method,
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': cfg.appId,
        'x-client-secret': cfg.secretKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cashfree error ${response.status}: ${error}`);
    }

    return response.json();
  }

  async createOrder(options: CreateOrderOptions, config: PaymentProviderConfig): Promise<PaymentOrder> {
    const cfg = config as CashfreeConfig;
    try {
      const orderId = `LE_${Date.now()}`;
      const result = await this.request('POST', '/orders', cfg, {
        order_id: orderId,
        order_amount: options.amount / 100, // Cashfree uses rupees
        order_currency: options.currency,
        customer_details: {
          customer_id: options.customerId ?? orderId,
          customer_phone: '0000000000', // Required by Cashfree
        },
        order_meta: { notify_url: '' },
      }) as {
        order_id: string;
        payment_session_id: string;
        order_status: string;
      };

      return {
        orderId: result.order_id,
        amount: options.amount,
        currency: options.currency,
        status: result.order_status,
        metadata: { paymentSessionId: result.payment_session_id },
      };
    } catch (error) {
      this.logger.error('Cashfree createOrder failed', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, orderId: string, _signature: string, config: PaymentProviderConfig): Promise<PaymentVerification> {
    const cfg = config as CashfreeConfig;
    try {
      const result = await this.request('GET', `/orders/${orderId}/payments/${paymentId}`, cfg) as {
        payment_id: string;
        order_id: string;
        payment_amount: number;
        payment_currency: string;
        payment_status: string;
      };

      return {
        success: result.payment_status === 'SUCCESS',
        paymentId: result.payment_id,
        orderId: result.order_id,
        amount: result.payment_amount * 100,
        currency: result.payment_currency,
        status: result.payment_status === 'SUCCESS' ? 'success' : 'failed',
        metadata: {},
      };
    } catch (error) {
      this.logger.error('Cashfree verifyPayment failed', error);
      throw error;
    }
  }

  async refund(options: RefundOptions, config: PaymentProviderConfig): Promise<RefundResult> {
    const cfg = config as CashfreeConfig;
    try {
      const result = await this.request('POST', `/orders/${options.paymentId}/refunds`, cfg, {
        refund_amount: options.amount ? options.amount / 100 : undefined,
        refund_id: `REF_${Date.now()}`,
        refund_note: options.reason,
      }) as { refund_id: string; refund_amount: number; refund_status: string };

      return {
        refundId: result.refund_id,
        amount: result.refund_amount * 100,
        status: result.refund_status === 'SUCCESS' ? 'success' : 'pending',
      };
    } catch (error) {
      this.logger.error('Cashfree refund failed', error);
      throw error;
    }
  }

  validateWebhookSignature(rawBody: string, signature: string, config: PaymentProviderConfig): boolean {
    const cfg = config as CashfreeConfig;
    const expected = crypto.createHmac('sha256', cfg.secretKey).update(rawBody).digest('base64');
    return expected === signature;
  }

  parseWebhookEvent(payload: unknown, _config: PaymentProviderConfig): PaymentWebhookEvent {
    const data = payload as { data?: { payment?: { payment_id: string; order_id: string; payment_amount: number; payment_status: string } }; type?: string };
    const payment = data.data?.payment;
    const eventType = data.type ?? '';

    if (!payment) return { eventType: 'unknown', paymentId: '', orderId: '', status: '', rawPayload: payload };

    return {
      eventType: payment.payment_status === 'SUCCESS' ? 'payment.success' : 'payment.failed',
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      amount: payment.payment_amount * 100,
      status: payment.payment_status,
      rawPayload: payload,
    };
  }
}
