import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service.js';
import { WhatsAppProviderFactory } from '../../providers/whatsapp/whatsapp-provider.factory.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Processor(QUEUE_NAMES.WA_CAMPAIGN)
export class WhatsAppCampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsAppCampaignProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: WhatsAppProviderFactory,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { campaignId, businessId, tenantId, templateId, audienceFilter } = job.data as {
      campaignId: string;
      businessId: string;
      tenantId: string;
      templateId: string;
      audienceFilter: Record<string, unknown>;
    };

    this.logger.log(`Processing campaign ${campaignId}`);

    try {
      const template = await this.prisma.whatsAppTemplate.findUnique({ where: { id: templateId } });
      if (!template) throw new Error('Template not found');

      // Build audience query from filter
      const customers = await this.prisma.customer.findMany({
        where: {
          businessId,
          isBlocked: false,
          phone: { not: null },
          // Apply audience filter conditions
          ...(audienceFilter['tags'] && {
            tags: { array_contains: audienceFilter['tags'] },
          }),
          ...(audienceFilter['minLoyaltyPoints'] && {
            loyaltyPoints: { gte: audienceFilter['minLoyaltyPoints'] as number },
          }),
        },
        take: 10000, // safety limit
      });

      const { provider, config } = await this.providerFactory.getProviderForTenant(tenantId);

      let sent = 0;
      let failed = 0;

      for (const customer of customers) {
        if (!customer.phone) continue;

        try {
          await provider.sendTemplateMessage(
            customer.phone,
            template.name,
            template.language,
            [], // template components (would be parameterized in production)
            config,
          );
          sent++;
          await job.updateProgress(Math.floor((sent / customers.length) * 100));
        } catch (err) {
          failed++;
          this.logger.warn(`Failed to send to ${customer.phone}: ${String(err)}`);
        }

        // Rate limiting: 80 messages per second max
        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      // Update campaign stats
      await this.prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          stats: { total: customers.length, sent, failed, delivered: 0, read: 0, replied: 0 },
        },
      });

      this.logger.log(`Campaign ${campaignId} completed: ${sent} sent, ${failed} failed`);
    } catch (error) {
      await this.prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}
