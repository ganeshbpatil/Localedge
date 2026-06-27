import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class CRMService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(businessId: string, data: { name: string; phone?: string; email?: string; tags?: string[]; metadata?: Record<string, unknown> }) {
    return this.prisma.customer.create({ data: { businessId, ...data } });
  }

  async findAll(businessId: string, opts: { page?: number; limit?: number; q?: string; tags?: string[] }) {
    const { page = 1, limit = 20, q, tags } = opts;
    const skip = (page - 1) * limit;

    const where = {
      businessId,
      ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { phone: { contains: q } }, { email: { contains: q, mode: 'insensitive' as const } }] }),
    };

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, businessId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: { loyaltyTransactions: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, businessId: string, data: Record<string, unknown>) {
    await this.findOne(id, businessId);
    return this.prisma.customer.update({ where: { id }, data: data as Parameters<typeof this.prisma.customer.update>[0]['data'] });
  }

  async awardLoyaltyPoints(customerId: string, businessId: string, points: number, type: string, referenceId?: string, description?: string) {
    const customer = await this.findOne(customerId, businessId);
    
    await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: { customerId, businessId, points, type: type as 'EARN', referenceId, description },
      }),
      this.prisma.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: points } },
      }),
    ]);

    return { customerId, points, newBalance: customer.loyaltyPoints + points };
  }

  async getLoyaltyHistory(customerId: string, businessId: string) {
    await this.findOne(customerId, businessId);
    return this.prisma.loyaltyTransaction.findMany({
      where: { customerId, businessId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
