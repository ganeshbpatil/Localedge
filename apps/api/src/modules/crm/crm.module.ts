import { Module } from '@nestjs/common';
import { CRMController } from './crm.controller.js';
import { CRMService } from './crm.service.js';

@Module({
  controllers: [CRMController],
  providers: [CRMService],
  exports: [CRMService],
})
export class CRMModule {}
