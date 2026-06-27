import { Controller, Get, Post, Body, Param, Query, UseGuards, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';
import type { Request } from 'express';

@ApiTags('whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Post('send/text')
  sendText(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { businessId: string; to: string; text: string },
  ) {
    return this.whatsAppService.sendTextMessage(user.tenantId, body.businessId, body.to, body.text);
  }

  @Post('send/template')
  sendTemplate(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { businessId: string; to: string; templateName: string; language: string; components: unknown[] },
  ) {
    return this.whatsAppService.sendTemplateMessage(
      user.tenantId,
      body.businessId,
      body.to,
      body.templateName,
      body.language,
      body.components as Parameters<WhatsAppService['sendTemplateMessage']>[5],
    );
  }

  @Get('conversations')
  getConversations(
    @CurrentUser() user: CurrentUserData,
    @Query('businessId') businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.whatsAppService.getConversations(businessId, Number(page ?? 1), Number(limit ?? 20));
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.whatsAppService.getMessages(conversationId, Number(page ?? 1), Number(limit ?? 50));
  }

  @Post('campaigns/:id/launch')
  launchCampaign(
    @CurrentUser() user: CurrentUserData,
    @Param('id') campaignId: string,
    @Body() body: { businessId: string },
  ) {
    return this.whatsAppService.launchCampaign(body.businessId, user.tenantId, campaignId);
  }

  @Public()
  @Post('webhook/:tenantId')
  handleWebhook(
    @Param('tenantId') tenantId: string,
    @Body() body: unknown,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    return this.whatsAppService.handleWebhook(tenantId, body, signature, rawBody);
  }
}
