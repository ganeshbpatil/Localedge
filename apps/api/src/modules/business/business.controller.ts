import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('business')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.businessService.create(user.tenantId, body as Parameters<BusinessService['create']>[1]);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.businessService.findAll(user.tenantId, Number(page ?? 1), Number(limit ?? 20));
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.businessService.findOne(user.tenantId, id);
  }

  @Put(':id')
  update(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.businessService.update(user.tenantId, id, body as Parameters<BusinessService['update']>[2]);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.businessService.remove(user.tenantId, id);
  }

  @Get(':id/stats')
  getDashboardStats(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.businessService.getDashboardStats(id, user.tenantId);
  }
}
