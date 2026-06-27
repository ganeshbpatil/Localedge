import { Module } from '@nestjs/common';
import { CrossPromotionController } from './cross-promotion.controller.js';
import { CrossPromotionService } from './cross-promotion.service.js';

@Module({
  controllers: [CrossPromotionController],
  providers: [CrossPromotionService],
  exports: [CrossPromotionService],
})
export class CrossPromotionModule {}
