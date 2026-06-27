import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class CrossPromotionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, data: { partnerBusinessId: string; type: string; content?: Record<string, unknown> }) {
    return this.prisma.crossPromotion.create({
      data: { businessId, ...data } as Parameters<typeof this.prisma.crossPromotion.create>[0]['data'],
    });
  }

  async findAll(businessId: string) {
    return this.prisma.crossPromotion.findMany({
      where: { OR: [{ businessId }, { partnerBusinessId: businessId }] },
      include: {
        business: { select: { id: true, name: true, category: true } },
        partnerBusiness: { select: { id: true, name: true, category: true } },
      },
    });
  }

  async findNearbyBusinesses(lat: number, lng: number, radiusKm = 5, category?: string) {
    // Simple bounding box approach (would use PostGIS in production)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return this.prisma.business.findMany({
      where: {
        lat: { gte: lat - latDelta, lte: lat + latDelta },
        lng: { gte: lng - lngDelta, lte: lng + lngDelta },
        status: 'ACTIVE',
        ...(category && { category: category as never }),
      },
      take: 20,
      select: { id: true, name: true, category: true, address: true, lat: true, lng: true },
    });
  }
}
