import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses/:businessId/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Param('businessId') businessId: string) {
    return this.analyticsService.getDashboard(businessId);
  }

  @Get('metrics')
  getMetrics(
    @Param('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('metrics') metrics: string,
  ) {
    return this.analyticsService.getMetrics(
      businessId,
      new Date(startDate),
      new Date(endDate),
      metrics.split(','),
    );
  }
}
