import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async isEnabled(tenantId: string, flagKey: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { tenantId_flagKey: { tenantId, flagKey } },
    });

    if (!flag || !flag.isEnabled) return false;

    // Rollout percentage check
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashTenantFlag(tenantId, flagKey);
      return hash % 100 < flag.rolloutPercentage;
    }

    return true;
  }

  async getAll(tenantId: string) {
    return this.prisma.featureFlag.findMany({ where: { tenantId } });
  }

  async set(tenantId: string, flagKey: string, isEnabled: boolean, rolloutPercentage = 100) {
    return this.prisma.featureFlag.upsert({
      where: { tenantId_flagKey: { tenantId, flagKey } },
      update: { isEnabled, rolloutPercentage },
      create: { tenantId, flagKey, isEnabled, rolloutPercentage },
    });
  }

  private hashTenantFlag(tenantId: string, flagKey: string): number {
    const str = `${tenantId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }
}
