import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import { QUEUE_NAMES } from '@localedge/shared';
import type { RazorpayWebhookPayload } from './dto/razorpay-webhook.dto.js';
import type { CashfreeWebhookPayload } from './dto/cashfree-webhook.dto.js';
import * as crypto from 'crypto';

export interface PaymentTriggerJobData {
  businessId: string;
  tenantId: string;
  customerPhone: string;
  customerName?: string;
  paymentId: string;
  amount: number; // rupees
  provider: 'RAZORPAY' | 'CASHFREE';
  delayMinutes: number;
}

@Injectable()
export class PaymentTriggersService {
  private readonly logger = new Logger(PaymentTriggersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    @InjectQueue(QUEUE_NAMES.PAYMENT_TRIGGER) private readonly triggerQueue: Queue,
  ) {}

  // ─── Razorpay ───────────────────────────────────────────────────────────────

  validateRazorpaySignature(rawBody: string, signature: string, webhookSecret: string): boolean {
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    return expected === signature;
  }

  async handleRazorpayWebhook(businessId: string, rawBody: string, payload: RazorpayWebhookPayload): Promise<void> {
    if (payload.event !== 'payment.captured') return;

    const entity = payload.payload?.payment?.entity;
    if (!entity) return;

    // Extract phone: Razorpay sends contact field with +91 prefix
    const rawPhone = entity.contact ?? entity.notes?.['customer_phone'];
    if (!rawPhone) {
      this.logger.warn(`Razorpay webhook: no phone for payment ${entity.id}`);
      return;
    }

    const phone = this.normalizePhone(rawPhone);
    await this.enqueueTrigger(businessId, 'RAZORPAY', entity.id, phone, entity.amount / 100);
  }

  // ─── Cashfree ───────────────────────────────────────────────────────────────

  validateCashfreeSignature(rawBody: string, timestamp: string, signature: string, secretKey: string): boolean {
    // Cashfree v2023-08-01: HMAC-SHA256 of timestamp + rawBody
    const expected = crypto.createHmac('sha256', secretKey).update(timestamp + rawBody).digest('base64');
    return expected === signature;
  }

  async handleCashfreeWebhook(businessId: string, payload: CashfreeWebhookPayload): Promise<void> {
    if (payload.type !== 'PAYMENT_SUCCESS_WEBHOOK') return;

    const payment = payload.data?.payment;
    if (!payment) return;

    const customerDetails = payload.data?.customer_details ?? payload.data?.payment?.customer_details;
    const rawPhone = customerDetails?.customer_phone;

    if (!rawPhone) {
      this.logger.warn(`Cashfree webhook: no phone for payment ${payment.payment_id}`);
      return;
    }

    const phone = this.normalizePhone(rawPhone);
    await this.enqueueTrigger(businessId, 'CASHFREE', payment.payment_id, phone, payment.payment_amount);
  }

  // ─── Core enqueue logic ─────────────────────────────────────────────────────

  private async enqueueTrigger(
    businessId: string,
    provider: 'RAZORPAY' | 'CASHFREE',
    paymentId: string,
    phone: string,
    amountRupees: number,
  ): Promise<void> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { tenant: true },
    });

    if (!business) {
      this.logger.error(`Business ${businessId} not found`);
      return;
    }

    // Check if payment trigger feature is enabled for this business
    const triggerConfig = await this.getPaymentTriggerConfig(businessId);
    if (!triggerConfig?.enabled) {
      this.logger.log(`Payment triggers disabled for business ${businessId}`);
      return;
    }

    // Cooldown check: don't spam same customer
    const cooldownHours = triggerConfig.cooldownHours ?? 24;
    const recentTrigger = await this.prisma.paymentTriggerLog.findFirst({
      where: {
        businessId,
        customerPhone: phone,
        createdAt: { gte: new Date(Date.now() - cooldownHours * 3600_000) },
        status: { in: ['SENT', 'PENDING'] },
      },
    });

    if (recentTrigger) {
      this.logger.log(`Cooldown active for ${phone} at business ${businessId}, skipping`);
      return;
    }

    // Log the trigger attempt
    const triggerRecord = await this.prisma.paymentTriggerLog.create({
      data: {
        businessId,
        customerPhone: phone,
        paymentId,
        provider,
        amountRupees,
        status: 'PENDING',
        scheduledFor: new Date(Date.now() + (triggerConfig.delayMinutes ?? 5) * 60_000),
      },
    });

    const delayMs = (triggerConfig.delayMinutes ?? 5) * 60_000;

    await this.triggerQueue.add(
      'send-review-request',
      {
        businessId,
        tenantId: business.tenantId,
        customerPhone: phone,
        paymentId,
        amount: amountRupees,
        provider,
        triggerRecordId: triggerRecord.id,
        businessName: business.name,
        reviewLink: triggerConfig.reviewLink ?? (business.gbpLocationId ? `https://g.page/r/${business.gbpLocationId}` : `https://search.google.com/local/writereview?placeid=${businessId}`),
        templateName: triggerConfig.templateName ?? 'review_request_v1',
        delayMinutes: triggerConfig.delayMinutes ?? 5,
      } satisfies PaymentTriggerJobData & {
        triggerRecordId: string;
        businessName: string;
        reviewLink: string;
        templateName: string;
      },
      {
        delay: delayMs,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        jobId: `pt-${triggerRecord.id}`,
      },
    );

    this.logger.log(`Payment trigger queued for ${phone} at business ${businessId}, delay: ${triggerConfig.delayMinutes}min`);
  }

  // ─── Config helper ──────────────────────────────────────────────────────────

  private async getPaymentTriggerConfig(businessId: string): Promise<{
    enabled: boolean;
    delayMinutes: number;
    cooldownHours: number;
    reviewLink?: string;
    templateName?: string;
  } | null> {
    const record = await this.prisma.paymentConfig.findFirst({
      where: { businessId, isActive: true },
    });

    if (!record) return { enabled: true, delayMinutes: 5, cooldownHours: 24 };

    const meta = record.metadata as Record<string, unknown> | null;
    return {
      enabled: (meta?.['triggerEnabled'] as boolean) ?? true,
      delayMinutes: (meta?.['triggerDelayMinutes'] as number) ?? 5,
      cooldownHours: (meta?.['cooldownHours'] as number) ?? 24,
      reviewLink: meta?.['reviewLink'] as string | undefined,
      templateName: meta?.['reviewTemplateName'] as string | undefined,
    };
  }

  // ─── Webhook secret lookup ───────────────────────────────────────────────────

  async getWebhookSecret(businessId: string, provider: 'RAZORPAY' | 'CASHFREE'): Promise<string | null> {
    const config = await this.prisma.paymentConfig.findFirst({
      where: { businessId, provider },
    });
    if (!config?.webhookSecret) return null;
    try {
      return this.encryption.decrypt(config.webhookSecret);
    } catch {
      return null;
    }
  }

  // ─── Phone normalization ─────────────────────────────────────────────────────

  private normalizePhone(raw: string): string {
    // Strip non-digit chars, ensure E.164 with +91
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    if (digits.length === 13 && digits.startsWith('091')) return `+91${digits.slice(3)}`;
    return digits.startsWith('+') ? raw : `+${digits}`;
  }

  // ─── Status update (called by processor) ─────────────────────────────────────

  async updateTriggerStatus(triggerRecordId: string, status: 'SENT' | 'FAILED', waMessageId?: string, error?: string): Promise<void> {
    await this.prisma.paymentTriggerLog.update({
      where: { id: triggerRecordId },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : undefined,
        waMessageId,
        errorMessage: error,
      },
    });
  }
}
