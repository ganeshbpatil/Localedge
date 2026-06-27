import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, data: Record<string, unknown>) {
    return this.prisma.offer.create({ data: { businessId, ...data } as Parameters<typeof this.prisma.offer.create>[0]['data'] });
  }

  async findAll(businessId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({ where: { businessId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.offer.count({ where: { businessId } }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, businessId: string) {
    const offer = await this.prisma.offer.findFirst({ where: { id, businessId } });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async update(id: string, businessId: string, data: Record<string, unknown>) {
    await this.findOne(id, businessId);
    return this.prisma.offer.update({ where: { id }, data: data as Parameters<typeof this.prisma.offer.update>[0]['data'] });
  }

  async generateCoupon(offerId: string, businessId: string, customerId?: string) {
    await this.findOne(offerId, businessId);
    const code = `LE${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.coupon.create({
      data: { offerId, code, customerId, maxUses: 1 },
    });
  }
}
