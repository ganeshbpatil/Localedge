import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses/:businessId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Param('businessId') businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platform') platform?: string,
    @Query('status') status?: string,
    @Query('minRating') minRating?: string,
    @Query('maxRating') maxRating?: string,
  ) {
    return this.reviewService.findAll(businessId, user.tenantId, {
      page: Number(page ?? 1),
      limit: Number(limit ?? 20),
      platform,
      status,
      minRating: minRating !== undefined ? Number(minRating) : undefined,
      maxRating: maxRating !== undefined ? Number(maxRating) : undefined,
    });
  }

  @Get('analytics')
  getAnalytics(@Param('businessId') businessId: string) {
    return this.reviewService.getAnalytics(businessId);
  }

  @Get(':id')
  findOne(@Param('businessId') businessId: string, @Param('id') id: string) {
    return this.reviewService.findOne(id, businessId);
  }

  @Put(':id/reply')
  reply(
    @CurrentUser() user: CurrentUserData,
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Body() body: { reply: string },
  ) {
    return this.reviewService.replyToReview(id, businessId, user.tenantId, body.reply);
  }

  @Post(':id/ai-reply')
  generateAIReply(
    @CurrentUser() user: CurrentUserData,
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Body() body: { tone?: string; language?: string },
  ) {
    return this.reviewService.generateAIReply(id, businessId, user.tenantId, body.tone, body.language);
  }

  @Post(':id/analyze-sentiment')
  analyzeSentiment(
    @CurrentUser() user: CurrentUserData,
    @Param('businessId') businessId: string,
    @Param('id') id: string,
  ) {
    return this.reviewService.analyzeSentiment(id, businessId, user.tenantId);
  }
}
