import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('complete')
  complete(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { messages: Array<{ role: string; content: string }>; useCase?: string; model?: string },
  ) {
    return this.aiService.complete({
      tenantId: user.tenantId,
      useCase: body.useCase ?? 'chat',
      messages: body.messages as Parameters<AIService['complete']>[0]['messages'],
      model: body.model,
    });
  }

  @Get('usage')
  getUsageStats(
    @CurrentUser() user: CurrentUserData,
    @Query('days') days?: string,
  ) {
    return this.aiService.getUsageStats(user.tenantId, Number(days ?? 30));
  }
}
