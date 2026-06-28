import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentTriggersController } from './payment-triggers.controller.js';
import { PaymentTriggersService } from './payment-triggers.service.js';
import { PaymentTriggerProcessor } from './payment-trigger.processor.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import { WhatsAppProviderFactory } from '../../providers/whatsapp/whatsapp-provider.factory.js';
import { MetaCloudProvider } from '../../providers/whatsapp/meta-cloud.provider.js';
import { GupshupProvider } from '../../providers/whatsapp/gupshup.provider.js';
import { TwilioProvider } from '../../providers/whatsapp/twilio.provider.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.PAYMENT_TRIGGER })],
  controllers: [PaymentTriggersController],
  providers: [
    PaymentTriggersService,
    PaymentTriggerProcessor,
    EncryptionService,
    WhatsAppProviderFactory,
    MetaCloudProvider,
    GupshupProvider,
    TwilioProvider,
  ],
  exports: [PaymentTriggersService],
})
export class PaymentTriggersModule {}
