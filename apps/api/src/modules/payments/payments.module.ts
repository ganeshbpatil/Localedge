import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { PaymentProviderFactory } from '../../providers/payment/payment-provider.factory.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.PAYMENT_TRIGGER })],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentProviderFactory, EncryptionService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
