import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service.js';
import { PaymentProviderFactory } from '../../providers/payment/payment-provider.factory.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: PaymentProviderFactory,
    @InjectQueue(QUEUE_NAMES.PAYMENT_TRIGGER) private readonly triggerQueue: Queue,
  ) {}

  async createOrder(tenantId: string, businessId: string, opts: { amount: number; currency?: string; customerId?: string; description?: string }) {
    const { provider, config } = await this.providerFactory.getDefaultProviderForTenant(tenantId);
    
    const order = await provider.createOrder({
      amount: opts.amount,
      currency: opts.currency ?? 'INR',
      customerId: opts.customerId,
      description: opts.description,
    }, config);

    await this.prisma.payment.create({
      data: {
        businessId,
        customerId: opts.customerId,
        amount: opts.amount / 100,
        currency: (opts.currency ?? 'INR') as 'INR' | 'USD',
        status: 'PENDING',
        provider: provider.providerName as 'RAZORPAY',
        providerOrderId: order.orderId,
        metadata: order.metadata,
      },
    });

    return order;
  }

  async verifyPayment(tenantId: string, businessId: string, paymentId: string, orderId: string, signature: string) {
    const { provider, config } = await this.providerFactory.getDefaultProviderForTenant(tenantId);
    const result = await provider.verifyPayment(paymentId, orderId, signature, config);

    if (result.success) {
      await this.prisma.payment.updateMany({
        where: { providerOrderId: orderId },
        data: { status: 'SUCCESS', providerPaymentId: paymentId },
      });

      // Trigger post-payment automations
      await this.triggerQueue.add('process-triggers', {
        eventType: 'payment.success',
        businessId,
        paymentId,
        amount: result.amount,
      });
    }

    return result;
  }

  async handleWebhook(tenantId: string, payload: unknown, signature: string, rawBody: string) {
    const { provider, config } = await this.providerFactory.getDefaultProviderForTenant(tenantId);

    if (!provider.validateWebhookSignature(rawBody, signature, config)) {
      throw new Error('Invalid webhook signature');
    }

    const event = provider.parseWebhookEvent(payload, config);
    this.logger.log(`Payment webhook: ${event.eventType} for ${event.paymentId}`);

    if (event.eventType === 'payment.success') {
      await this.prisma.payment.updateMany({
        where: { providerPaymentId: event.paymentId },
        data: { status: 'SUCCESS' },
      });
    }

    return { received: true, eventType: event.eventType };
  }
}
