import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() body: { url: string; events: string[] }) {
    return this.webhooksService.create(user.tenantId, body.url, body.events);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.webhooksService.findAll(user.tenantId);
  }
}
