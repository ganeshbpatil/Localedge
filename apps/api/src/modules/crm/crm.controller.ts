import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CRMService } from './crm.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('crm')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses/:businessId/customers')
export class CRMController {
  constructor(private readonly crmService: CRMService) {}

  @Post()
  create(@Param('businessId') businessId: string, @Body() body: Record<string, unknown>) {
    return this.crmService.createCustomer(businessId, body as Parameters<CRMService['createCustomer']>[1]);
  }

  @Get()
  findAll(@Param('businessId') businessId: string, @Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    return this.crmService.findAll(businessId, { page: Number(page ?? 1), limit: Number(limit ?? 20), q });
  }

  @Get(':id')
  findOne(@Param('businessId') businessId: string, @Param('id') id: string) {
    return this.crmService.findOne(id, businessId);
  }

  @Put(':id')
  update(@Param('businessId') businessId: string, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.crmService.update(id, businessId, body);
  }

  @Post(':id/loyalty/award')
  awardPoints(
    @Param('businessId') businessId: string,
    @Param('id') customerId: string,
    @Body() body: { points: number; type: string; referenceId?: string; description?: string },
  ) {
    return this.crmService.awardLoyaltyPoints(customerId, businessId, body.points, body.type, body.referenceId, body.description);
  }

  @Get(':id/loyalty/history')
  getLoyaltyHistory(@Param('businessId') businessId: string, @Param('id') customerId: string) {
    return this.crmService.getLoyaltyHistory(customerId, businessId);
  }
}
