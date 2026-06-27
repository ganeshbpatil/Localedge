import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(businessId: string, startDate: Date, endDate: Date, metrics: string[]) {
    const results = await this.prisma.businessAnalytic.findMany({
      where: {
        businessId,
        date: { gte: startDate, lte: endDate },
        metricType: { in: metrics },
      },
      orderBy: { date: 'asc' },
    });

    return metrics.reduce<Record<string, Array<{ date: Date; value: number }>>>((acc, metric) => {
      acc[metric] = results
        .filter((r) => r.metricType === metric)
        .map((r) => ({ date: r.date, value: Number(r.value) }));
      return acc;
    }, {});
  }

  async getDashboard(businessId: string) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [reviews, customers, payments, waMessages] = await Promise.all([
      this.prisma.review.aggregate({
        where: { businessId, createdAt: { gte: last30Days } },
        _count: true,
        _avg: { rating: true },
      }),
      this.prisma.customer.count({ where: { businessId, createdAt: { gte: last30Days } } }),
      this.prisma.payment.aggregate({
        where: { businessId, status: 'SUCCESS', createdAt: { gte: last30Days } },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.whatsAppMessage.count({
        where: { conversation: { businessId }, direction: 'OUTBOUND', createdAt: { gte: last30Days } },
      }),
    ]);

    return {
      period: '30d',
      reviews: { total: reviews._count, averageRating: Math.round((reviews._avg.rating ?? 0) * 10) / 10 },
      newCustomers: customers,
      payments: { count: payments._count, revenue: Number(payments._sum.amount ?? 0) },
      whatsappMessagesSent: waMessages,
    };
  }

  async trackEvent(tenantId: string, businessId: string, eventType: string, payload: Record<string, unknown>) {
    return this.prisma.event.create({
      data: { tenantId, businessId, eventType, payload: payload as Prisma.InputJsonValue },
    });
  }

  async recordMetric(businessId: string, date: Date, metricType: string, value: number, metadata?: Record<string, unknown>) {
    return this.prisma.businessAnalytic.upsert({
      where: { businessId_date_metricType: { businessId, date, metricType } },
      update: { value, metadata: (metadata ?? {}) as Prisma.InputJsonValue },
      create: { businessId, date, metricType, value, metadata: (metadata ?? {}) as Prisma.InputJsonValue },
    });
  }
}
