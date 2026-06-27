import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service.js';
import { WhatsAppProviderFactory } from '../../providers/whatsapp/whatsapp-provider.factory.js';
import { QUEUE_NAMES } from '@localedge/shared';
import type { WATemplateComponent } from '../../providers/whatsapp/whatsapp-provider.interface.js';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: WhatsAppProviderFactory,
    @InjectQueue(QUEUE_NAMES.WA_MESSAGE) private readonly messageQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WA_CAMPAIGN) private readonly campaignQueue: Queue,
  ) {}

  async sendTextMessage(tenantId: string, businessId: string, to: string, text: string) {
    const { provider, config, phoneNumber } = await this.providerFactory.getProviderForTenant(tenantId);

    // Get or create conversation
    const conversation = await this.getOrCreateConversation(businessId, to);

    // Queue the message for reliable delivery
    const job = await this.messageQueue.add('send-text', {
      tenantId,
      businessId,
      conversationId: conversation.id,
      to,
      text,
      provider: provider.providerName,
    });

    // Also send immediately for real-time UX
    const result = await provider.sendTextMessage(to, text, config);

    // Record message
    await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        direction: 'OUTBOUND',
        content: { type: 'text', text },
        status: result.status === 'sent' ? 'SENT' : 'FAILED',
        waMessageId: result.messageId,
        sentAt: new Date(),
      },
    });

    return result;
  }

  async sendTemplateMessage(
    tenantId: string,
    businessId: string,
    to: string,
    templateName: string,
    language: string,
    components: WATemplateComponent[],
  ) {
    const { provider, config } = await this.providerFactory.getProviderForTenant(tenantId);
    const conversation = await this.getOrCreateConversation(businessId, to);

    const result = await provider.sendTemplateMessage(to, templateName, language, components, config);

    await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        direction: 'OUTBOUND',
        content: { type: 'template', templateName, components },
        status: result.status === 'sent' ? 'SENT' : 'QUEUED',
        waMessageId: result.messageId,
        sentAt: new Date(),
      },
    });

    return result;
  }

  async handleWebhook(tenantId: string, payload: unknown, signature: string, rawBody: string) {
    const { provider, config } = await this.providerFactory.getProviderForTenant(tenantId);

    if (!provider.validateWebhookSignature(rawBody, signature, config)) {
      throw new Error('Invalid webhook signature');
    }

    const incomingMessage = await provider.handleWebhook(payload, config);
    if (!incomingMessage) return { received: true };

    // Find or create conversation
    const conversation = await this.getOrCreateConversation(
      '', // businessId from phone number lookup
      incomingMessage.from,
    );

    // Record incoming message
    await this.prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        direction: 'INBOUND',
        content: {
          type: incomingMessage.type,
          text: incomingMessage.text,
          mediaUrl: incomingMessage.mediaUrl,
        },
        status: 'DELIVERED',
        waMessageId: incomingMessage.messageId,
      },
    });

    // Update conversation last_message_at
    await this.prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date(), status: 'OPEN' },
    });

    return { received: true, messageId: incomingMessage.messageId };
  }

  async launchCampaign(businessId: string, tenantId: string, campaignId: string) {
    const campaign = await this.prisma.whatsAppCampaign.findFirst({
      where: { id: campaignId, businessId },
      include: { template: true },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    // Update campaign status
    await this.prisma.whatsAppCampaign.update({
      where: { id: campaignId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    // Queue campaign job
    await this.campaignQueue.add('launch-campaign', {
      campaignId,
      businessId,
      tenantId,
      templateId: campaign.templateId,
      audienceFilter: campaign.audienceFilter,
    });

    return { message: 'Campaign launched', campaignId };
  }

  async getConversations(businessId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.whatsAppConversation.findMany({
        where: { businessId },
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.whatsAppConversation.count({ where: { businessId } }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.whatsAppMessage.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.whatsAppMessage.count({ where: { conversationId } }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async getOrCreateConversation(businessId: string, waId: string) {
    const existing = await this.prisma.whatsAppConversation.findFirst({
      where: { businessId, waId },
    });

    if (existing) return existing;

    return this.prisma.whatsAppConversation.create({
      data: { businessId, waId, status: 'OPEN' },
    });
  }
}
