import { Module } from '@nestjs/common';
import { AIController } from './ai.controller.js';
import { AIService } from './ai.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';

@Module({
  controllers: [AIController],
  providers: [AIService, EncryptionService],
  exports: [AIService],
})
export class AIModule {}
