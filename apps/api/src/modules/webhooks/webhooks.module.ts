import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.WEBHOOK_DELIVERY })],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
