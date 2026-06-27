import { Module } from '@nestjs/common';
import { QRController } from './qr.controller.js';
import { QRService } from './qr.service.js';

@Module({
  controllers: [QRController],
  providers: [QRService],
  exports: [QRService],
})
export class QRModule {}
