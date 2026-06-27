import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses/:businessId/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Param('businessId') businessId: string, @Body() body: Record<string, unknown>) {
    return this.offersService.create(businessId, body);
  }

  @Get()
  findAll(@Param('businessId') businessId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.offersService.findAll(businessId, Number(page ?? 1), Number(limit ?? 20));
  }

  @Get(':id')
  findOne(@Param('businessId') businessId: string, @Param('id') id: string) {
    return this.offersService.findOne(id, businessId);
  }

  @Put(':id')
  update(@Param('businessId') businessId: string, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.offersService.update(id, businessId, body);
  }

  @Post(':id/coupon')
  generateCoupon(
    @Param('businessId') businessId: string,
    @Param('id') offerId: string,
    @Body() body: { customerId?: string },
  ) {
    return this.offersService.generateCoupon(offerId, businessId, body.customerId);
  }
}
