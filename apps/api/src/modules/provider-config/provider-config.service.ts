import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import { AIProviderName } from '@localedge/shared';

// ============================================================
// Provider Config Service
// Admin uses this to set/update all provider configs.
// API keys are encrypted before storing in DB.
// ============================================================

@Injectable()
export class ProviderConfigService {
  private readonly logger = new Logger(ProviderConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  // ---- WhatsApp Provider ----

  async setWhatsAppProvider(tenantId: string, dto: {
    provider: string;
    config: Record<string, unknown>;
    phoneNumber: string;
    displayName?: string;
    isDefault?: boolean;
  }) {
    const encryptedConfig = this.encryption.encryptObject(dto.config);

    // If setting as default, unset others
    if (dto.isDefault !== false) {
      await this.prisma.whatsAppConfig.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.whatsAppConfig.upsert({
      where: {
        // Use a unique constraint based on tenant + provider + phone
        id: `${tenantId}_${dto.provider}`,
      },
      update: {
        providerConfig: encryptedConfig as Prisma.InputJsonValue,
        phoneNumber: dto.phoneNumber,
        displayName: dto.displayName,
        isDefault: dto.isDefault !== false,
      },
      create: {
        tenantId,
        provider: dto.provider as never,
        providerConfig: encryptedConfig as Prisma.InputJsonValue,
        phoneNumber: dto.phoneNumber,
        displayName: dto.displayName,
        isDefault: dto.isDefault !== false,
      },
    });
  }

  async getWhatsAppProviders(tenantId: string) {
    return this.prisma.whatsAppConfig.findMany({
      where: { tenantId },
      select: {
        id: true,
        provider: true,
        phoneNumber: true,
        displayName: true,
        status: true,
        isDefault: true,
        createdAt: true,
        // Do NOT return providerConfig (contains encrypted API keys)
      },
    });
  }

  // ---- AI Provider ----

  async setAIProvider(tenantId: string, dto: {
    provider: AIProviderName;
    apiKey: string;
    baseUrl?: string;
    modelDefaults?: Record<string, unknown>;
    priority?: number;
  }) {
    const apiKeyEncrypted = this.encryption.encrypt(dto.apiKey);

    return this.prisma.aIProviderConfig.upsert({
      where: { tenantId_provider: { tenantId, provider: dto.provider } },
      update: {
        apiKeyEncrypted,
        baseUrl: dto.baseUrl,
        modelDefaults: (dto.modelDefaults ?? {}) as Prisma.InputJsonValue,
        priority: dto.priority ?? 0,
        isActive: true,
      },
      create: {
        tenantId,
        provider: dto.provider,
        apiKeyEncrypted,
        baseUrl: dto.baseUrl,
        modelDefaults: (dto.modelDefaults ?? {}) as Prisma.InputJsonValue,
        priority: dto.priority ?? 0,
        isActive: true,
      },
    });
  }

  async getAIProviders(tenantId: string) {
    return this.prisma.aIProviderConfig.findMany({
      where: { tenantId },
      select: {
        id: true,
        provider: true,
        baseUrl: true,
        modelDefaults: true,
        isActive: true,
        priority: true,
        createdAt: true,
        // Do NOT return apiKeyEncrypted
      },
    });
  }

  async setAIRoutingRule(tenantId: string, dto: {
    useCase: string;
    provider: AIProviderName;
    model: string;
    fallbackProvider?: AIProviderName;
    fallbackModel?: string;
  }) {
    return this.prisma.aIRoutingRule.upsert({
      where: { tenantId_useCase: { tenantId, useCase: dto.useCase } },
      update: { ...dto },
      create: { tenantId, ...dto },
    });
  }

  async getAIRoutingRules(tenantId: string) {
    return this.prisma.aIRoutingRule.findMany({ where: { tenantId } });
  }

  // ---- Payment Provider ----

  async setPaymentProvider(tenantId: string, dto: {
    provider: string;
    config: Record<string, unknown>;
    isDefault?: boolean;
  }) {
    const encryptedConfig = this.encryption.encryptObject(dto.config);

    if (dto.isDefault) {
      await this.prisma.paymentConfig.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentConfig.upsert({
      where: { tenantId_provider: { tenantId, provider: dto.provider as never } },
      update: { config: encryptedConfig as Prisma.InputJsonValue, isActive: true, isDefault: dto.isDefault ?? false },
      create: {
        tenantId,
        provider: dto.provider as never,
        config: encryptedConfig as Prisma.InputJsonValue,
        isActive: true,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async getPaymentProviders(tenantId: string) {
    return this.prisma.paymentConfig.findMany({
      where: { tenantId },
      select: { id: true, provider: true, isActive: true, isDefault: true, createdAt: true },
    });
  }

  // ---- Generic Provider Config ----

  async setGenericProvider(tenantId: string, dto: {
    providerType: string;
    providerName: string;
    config: Record<string, unknown>;
    isDefault?: boolean;
    priority?: number;
  }) {
    const encryptedConfig = this.encryption.encryptObject(dto.config);

    return this.prisma.providerConfig.upsert({
      where: {
        tenantId_providerType_providerName: {
          tenantId,
          providerType: dto.providerType as never,
          providerName: dto.providerName,
        },
      },
      update: {
        config: encryptedConfig as Prisma.InputJsonValue,
        isActive: true,
        isDefault: dto.isDefault ?? false,
        priority: dto.priority ?? 0,
      },
      create: {
        tenantId,
        providerType: dto.providerType as never,
        providerName: dto.providerName,
        config: encryptedConfig as Prisma.InputJsonValue,
        isActive: true,
        isDefault: dto.isDefault ?? false,
        priority: dto.priority ?? 0,
      },
    });
  }

  async getGenericProviders(tenantId: string, providerType?: string) {
    return this.prisma.providerConfig.findMany({
      where: { tenantId, ...(providerType && { providerType: providerType as never }) },
      select: { id: true, providerType: true, providerName: true, isActive: true, isDefault: true, priority: true },
    });
  }
}
