import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { AIService } from '../ai/ai.service.js';
import { AIUseCase } from '@localedge/shared';
import type { ReviewPlatform, ReviewStatus, SentimentType } from '@localedge/shared';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async findAll(businessId: string, tenantId: string, opts: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
    minRating?: number;
    maxRating?: number;
  }) {
    const { page = 1, limit = 20, platform, status, minRating, maxRating } = opts;
    const skip = (page - 1) * limit;

    const where = {
      businessId,
      ...(platform && { platform: platform as ReviewPlatform }),
      ...(status && { status: status as ReviewStatus }),
      ...(minRating !== undefined && { rating: { gte: minRating } }),
      ...(maxRating !== undefined && { rating: { lte: maxRating } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({ where, skip, take: limit, orderBy: { reviewedAt: 'desc' } }),
      this.prisma.review.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, businessId: string) {
    const review = await this.prisma.review.findFirst({ where: { id, businessId } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async replyToReview(id: string, businessId: string, tenantId: string, reply: string) {
    await this.findOne(id, businessId);

    return this.prisma.review.update({
      where: { id },
      data: { reply, repliedAt: new Date(), status: 'REPLIED' },
    });
  }

  async generateAIReply(
    id: string,
    businessId: string,
    tenantId: string,
    tone: string = 'professional',
    language: string = 'en',
  ) {
    const review = await this.findOne(id, businessId);
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });

    const systemPrompt = `You are a professional business response writer for "${business?.name ?? 'our business'}".
Write a ${tone} reply to a customer review.
Rules:
- Be genuine and personalized
- Address the specific points in the review
- Keep it concise (2-4 sentences)
- Language: ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}
- Don't be defensive for negative reviews
- End with an invitation to return or contact`;

    const userPrompt = `Customer review (${review.rating}/5 stars):
${review.content ?? 'No written review'}

Author: ${review.authorName}
Platform: ${review.platform}`;

    const aiResponse = await this.aiService.complete({
      tenantId,
      businessId,
      useCase: AIUseCase.REVIEW_REPLY,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    // Save AI draft
    await this.prisma.review.update({
      where: { id },
      data: { aiReplyDraft: aiResponse.content },
    });

    return { draft: aiResponse.content, model: aiResponse.model, provider: aiResponse.provider };
  }

  async analyzeSentiment(id: string, businessId: string, tenantId: string) {
    const review = await this.findOne(id, businessId);

    if (!review.content) {
      const sentiment: SentimentType = review.rating >= 4 ? 'POSITIVE' : review.rating <= 2 ? 'NEGATIVE' : 'NEUTRAL';
      await this.prisma.review.update({ where: { id }, data: { sentiment } });
      return { sentiment };
    }

    const aiResponse = await this.aiService.complete({
      tenantId,
      businessId,
      useCase: AIUseCase.SENTIMENT_ANALYSIS,
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the review. Respond with exactly one word: POSITIVE, NEUTRAL, or NEGATIVE.',
        },
        {
          role: 'user',
          content: review.content,
        },
      ],
      maxTokens: 10,
    });

    const sentiment = (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(aiResponse.content.trim().toUpperCase())
      ? aiResponse.content.trim().toUpperCase()
      : 'NEUTRAL') as SentimentType;

    await this.prisma.review.update({ where: { id }, data: { sentiment } });
    return { sentiment };
  }

  async getAnalytics(businessId: string) {
    const stats = await this.prisma.review.groupBy({
      by: ['rating', 'platform', 'status', 'sentiment'],
      where: { businessId },
      _count: true,
    });

    const total = stats.reduce((sum, s) => sum + s._count, 0);
    const totalRating = stats.reduce((sum, s) => sum + s.rating * s._count, 0);

    return {
      total,
      averageRating: total > 0 ? Math.round((totalRating / total) * 10) / 10 : 0,
      byRating: Object.fromEntries([1, 2, 3, 4, 5].map((r) => [r, stats.filter((s) => s.rating === r).reduce((sum, s) => sum + s._count, 0)])),
      byPlatform: stats.reduce<Record<string, number>>((acc, s) => {
        acc[s.platform] = (acc[s.platform] ?? 0) + s._count;
        return acc;
      }, {}),
      bySentiment: {
        POSITIVE: stats.filter((s) => s.sentiment === 'POSITIVE').reduce((sum, s) => sum + s._count, 0),
        NEUTRAL: stats.filter((s) => s.sentiment === 'NEUTRAL').reduce((sum, s) => sum + s._count, 0),
        NEGATIVE: stats.filter((s) => s.sentiment === 'NEGATIVE').reduce((sum, s) => sum + s._count, 0),
      },
      pendingReplies: stats.filter((s) => s.status === 'PENDING').reduce((sum, s) => sum + s._count, 0),
    };
  }
}
