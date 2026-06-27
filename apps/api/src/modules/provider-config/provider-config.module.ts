import { Module } from '@nestjs/common';
import { ProviderConfigController } from './provider-config.controller.js';
import { ProviderConfigService } from './provider-config.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import { WhatsAppProviderFactory } from '../../providers/whatsapp/whatsapp-provider.factory.js';
import { PaymentProviderFactory } from '../../providers/payment/payment-provider.factory.js';

@Module({
  controllers: [ProviderConfigController],
  providers: [ProviderConfigService, EncryptionService, WhatsAppProviderFactory, PaymentProviderFactory],
  exports: [ProviderConfigService, WhatsAppProviderFactory, PaymentProviderFactory],
})
export class ProviderConfigModule {}
