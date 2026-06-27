import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WhatsAppController } from './whatsapp.controller.js';
import { WhatsAppService } from './whatsapp.service.js';
import { WhatsAppCampaignProcessor } from './whatsapp-campaign.processor.js';
import { WhatsAppProviderFactory } from '../../providers/whatsapp/whatsapp-provider.factory.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.WA_CAMPAIGN }, { name: QUEUE_NAMES.WA_MESSAGE })],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppCampaignProcessor, WhatsAppProviderFactory, EncryptionService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
