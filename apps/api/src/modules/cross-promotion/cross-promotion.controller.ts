import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrossPromotionService } from './cross-promotion.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('cross-promotion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cross-promotions')
export class CrossPromotionController {
  constructor(private readonly crossPromotionService: CrossPromotionService) {}

  @Post()
  create(@Body() body: { businessId: string; partnerBusinessId: string; type: string; content?: Record<string, unknown> }) {
    return this.crossPromotionService.create(body.businessId, body);
  }

  @Get(':businessId')
  findAll(@Param('businessId') businessId: string) {
    return this.crossPromotionService.findAll(businessId);
  }

  @Get('nearby')
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string, @Query('category') category?: string) {
    return this.crossPromotionService.findNearbyBusinesses(Number(lat), Number(lng), Number(radius ?? 5), category);
  }
}
