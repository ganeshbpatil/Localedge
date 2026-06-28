import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '@localedge/shared';
import { PrismaService } from '../../database/prisma.service.js';
import { WhatsAppProviderFactory } from '../../providers/whatsapp/whatsapp-provider.factory.js';
import { PaymentTriggersService } from './payment-triggers.service.js';

interface TriggerJobData {
  businessId: string;
  tenantId: string;
  customerPhone: string;
  paymentId: string;
  amount: number;
  provider: string;
  triggerRecordId: string;
  businessName: string;
  reviewLink: string;
  templateName: string;
  delayMinutes: number;
}

@Processor(QUEUE_NAMES.PAYMENT_TRIGGER)
export class PaymentTriggerProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentTriggerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waFactory: WhatsAppProviderFactory,
    private readonly triggersService: PaymentTriggersService,
  ) {
    super();
  }

  async process(job: Job<TriggerJobData>): Promise<void> {
    const { businessId, tenantId, customerPhone, businessName, reviewLink, templateName, triggerRecordId, amount } = job.data;

    this.logger.log(`Processing payment trigger for ${customerPhone} at ${businessName}`);

    try {
      // Get WhatsApp provider for this tenant
      const { provider, config } = await this.waFactory.getProviderForTenant(job.data.tenantId);

      // Send WhatsApp UTILITY template
      // Template: "Thank you for visiting {{1}}. Share your experience in 30 seconds: {{2}}"
      const result = await provider.sendTemplateMessage(
        customerPhone,
        templateName,
        [businessName, reviewLink],
        config,
      );

      await this.triggersService.updateTriggerStatus(triggerRecordId, 'SENT', result.messageId);

      this.logger.log(`Review request sent to ${customerPhone} via ${waConfig.provider}, msgId: ${result.messageId}`);

      // Record event for analytics
      await this.prisma.event.create({
        data: {
          businessId,
          eventType: 'PAYMENT_TRIGGER_SENT',
          metadata: {
            customerPhone,
            paymentId: job.data.paymentId,
            amount,
            provider: job.data.provider,
            waMessageId: result.messageId,
          },
        },
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Payment trigger failed for ${customerPhone}: ${errMsg}`);
      await this.triggersService.updateTriggerStatus(triggerRecordId, 'FAILED', undefined, errMsg);
      throw error; // re-throw so BullMQ can retry
    }
  }
}
