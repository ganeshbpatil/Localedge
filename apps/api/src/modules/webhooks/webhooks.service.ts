import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.WEBHOOK_DELIVERY) private readonly deliveryQueue: Queue,
  ) {}

  async create(tenantId: string, url: string, events: string[]) {
    const secret = crypto.randomBytes(32).toString('hex');
    return this.prisma.webhook.create({ data: { tenantId, url, events, secret } });
  }

  async findAll(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      select: { id: true, url: true, events: true, isActive: true, createdAt: true },
    });
  }

  async dispatch(tenantId: string, eventType: string, payload: Record<string, unknown>) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { tenantId, isActive: true },
    });

    for (const webhook of webhooks) {
      const events = webhook.events as string[];
      if (events.includes(eventType) || events.includes('*')) {
        await this.deliveryQueue.add('deliver', {
          webhookId: webhook.id,
          url: webhook.url,
          secret: webhook.secret,
          eventType,
          payload,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        });
      }
    }
  }
}
