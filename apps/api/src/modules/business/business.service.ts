import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { BusinessCategory, BusinessStatus } from '@localedge/shared';

export interface CreateBusinessInput {
  name: string;
  category: BusinessCategory;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
}

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, input: CreateBusinessInput) {
    const slug = this.generateSlug(input.name);

    // Check slug uniqueness within tenant
    const existing = await this.prisma.business.findFirst({
      where: { tenantId, slug },
    });

    if (existing) {
      throw new ConflictException(`Business with slug "${slug}" already exists`);
    }

    return this.prisma.business.create({
      data: { ...input, tenantId, slug },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.business.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.business.count({ where: { tenantId } }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const business = await this.prisma.business.findFirst({
      where: { id, tenantId },
      include: {
        branches: true,
        verifications: true,
      },
    });

    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async update(tenantId: string, id: string, data: Partial<CreateBusinessInput> & { gbpSyncEnabled?: boolean; settings?: Record<string, unknown>; status?: BusinessStatus }) {
    await this.findOne(tenantId, id);
    return this.prisma.business.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.business.delete({ where: { id } });
  }

  async getDashboardStats(businessId: string, tenantId: string) {
    // Verify ownership
    await this.findOne(tenantId, businessId);

    const [reviewStats, customerCount, recentPayments] = await Promise.all([
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { businessId },
        _count: true,
      }),
      this.prisma.customer.count({ where: { businessId, isBlocked: false } }),
      this.prisma.payment.findMany({
        where: { businessId, status: 'SUCCESS' },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalReviews = reviewStats.reduce((sum, r) => sum + r._count, 0);
    const totalRating = reviewStats.reduce((sum, r) => sum + r.rating * r._count, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      reviews: { total: totalReviews, averageRating: Math.round(averageRating * 10) / 10 },
      customers: { total: customerCount },
      recentPayments,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}
