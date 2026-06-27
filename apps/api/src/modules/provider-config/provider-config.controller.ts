import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProviderConfigService } from './provider-config.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';
import { UserRole, AIProviderName } from '@localedge/shared';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/provider-config')
export class ProviderConfigController {
  constructor(private readonly providerConfigService: ProviderConfigService) {}

  // WhatsApp
  @Post('whatsapp')
  setWhatsAppProvider(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.providerConfigService.setWhatsAppProvider(user.tenantId, body as Parameters<ProviderConfigService['setWhatsAppProvider']>[1]);
  }

  @Get('whatsapp')
  getWhatsAppProviders(@CurrentUser() user: CurrentUserData) {
    return this.providerConfigService.getWhatsAppProviders(user.tenantId);
  }

  // AI
  @Post('ai')
  setAIProvider(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.providerConfigService.setAIProvider(user.tenantId, body as Parameters<ProviderConfigService['setAIProvider']>[1]);
  }

  @Get('ai')
  getAIProviders(@CurrentUser() user: CurrentUserData) {
    return this.providerConfigService.getAIProviders(user.tenantId);
  }

  @Post('ai/routing')
  setAIRoutingRule(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.providerConfigService.setAIRoutingRule(user.tenantId, body as Parameters<ProviderConfigService['setAIRoutingRule']>[1]);
  }

  @Get('ai/routing')
  getAIRoutingRules(@CurrentUser() user: CurrentUserData) {
    return this.providerConfigService.getAIRoutingRules(user.tenantId);
  }

  // Payment
  @Post('payment')
  setPaymentProvider(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.providerConfigService.setPaymentProvider(user.tenantId, body as Parameters<ProviderConfigService['setPaymentProvider']>[1]);
  }

  @Get('payment')
  getPaymentProviders(@CurrentUser() user: CurrentUserData) {
    return this.providerConfigService.getPaymentProviders(user.tenantId);
  }

  // Generic
  @Post('generic')
  setGenericProvider(@CurrentUser() user: CurrentUserData, @Body() body: Record<string, unknown>) {
    return this.providerConfigService.setGenericProvider(user.tenantId, body as Parameters<ProviderConfigService['setGenericProvider']>[1]);
  }

  @Get('generic')
  getGenericProviders(@CurrentUser() user: CurrentUserData, @Query('type') type?: string) {
    return this.providerConfigService.getGenericProviders(user.tenantId, type);
  }
}
