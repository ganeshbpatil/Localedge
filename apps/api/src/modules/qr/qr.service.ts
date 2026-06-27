import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { QRCodeType } from '@localedge/shared';

@Injectable()
export class QRService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, data: { name: string; type: QRCodeType; targetUrl?: string; settings?: Record<string, unknown> }) {
    const targetUrl = data.targetUrl ?? this.buildDefaultUrl(businessId, data.type);
    return this.prisma.qRCode.create({
      data: { businessId, ...data, targetUrl },
    });
  }

  async findAll(businessId: string) {
    return this.prisma.qRCode.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' } });
  }

  async trackScan(id: string) {
    const qr = await this.prisma.qRCode.findUnique({ where: { id } });
    if (!qr || !qr.isActive) throw new NotFoundException('QR code not found or inactive');
    
    await this.prisma.qRCode.update({ where: { id }, data: { scanCount: { increment: 1 } } });
    return { targetUrl: qr.targetUrl };
  }

  private buildDefaultUrl(businessId: string, type: QRCodeType): string {
    const base = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';
    const urls: Record<string, string> = {
      REVIEW: `${base}/review/${businessId}`,
      WHATSAPP: `${base}/wa/${businessId}`,
      LOYALTY: `${base}/loyalty/${businessId}`,
      MENU: `${base}/menu/${businessId}`,
    };
    return urls[type] ?? `${base}/b/${businessId}`;
  }
}
