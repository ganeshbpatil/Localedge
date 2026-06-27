import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('tenant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findOne(@CurrentUser() user: CurrentUserData) {
    return this.tenantService.findOne(user.tenantId);
  }

  @Put()
  update(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.tenantService.update(user.tenantId, body as { name?: string; settings?: Record<string, unknown> });
  }
}
