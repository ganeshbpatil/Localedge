import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WhatsAppProviderName } from '@localedge/shared';
import { PrismaService } from '../../database/prisma.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import type { IWhatsAppProvider, WAProviderConfig } from './whatsapp-provider.interface.js';
import { MetaCloudProvider } from './meta-cloud.provider.js';
import { GupshupProvider } from './gupshup.provider.js';
import { TwilioProvider } from './twilio.provider.js';

// ============================================================
// WhatsApp Provider Factory
// Looks up the tenant's active WhatsApp provider from DB
// and returns the correct implementation.
// Zero code changes to switch providers.
// ============================================================

@Injectable()
export class WhatsAppProviderFactory {
  private readonly logger = new Logger(WhatsAppProviderFactory.name);

  private readonly providers: Map<string, IWhatsAppProvider> = new Map([
    [WhatsAppProviderName.META_CLOUD, new MetaCloudProvider()],
    [WhatsAppProviderName.GUPSHUP, new GupshupProvider()],
    [WhatsAppProviderName.TWILIO, new TwilioProvider()],
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * Get the active WhatsApp provider for a tenant.
   * Config is loaded from DB and decrypted at runtime.
   */
  async getProviderForTenant(tenantId: string): Promise<{
    provider: IWhatsAppProvider;
    config: WAProviderConfig;
    phoneNumber: string;
  }> {
    const config = await this.prisma.whatsAppConfig.findFirst({
      where: { tenantId, status: 'ACTIVE', isDefault: true },
    });

    if (!config) {
      throw new NotFoundException(`No active WhatsApp configuration found for tenant ${tenantId}`);
    }

    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new NotFoundException(`WhatsApp provider "${config.provider}" is not supported`);
    }

    // Decrypt provider config from DB
    const decryptedConfig = this.encryption.decryptObject(config.providerConfig as Record<string, string>);

    this.logger.debug(`Using WhatsApp provider: ${config.provider} for tenant ${tenantId}`);

    return {
      provider,
      config: decryptedConfig,
      phoneNumber: config.phoneNumber,
    };
  }

  /**
   * Get provider by name (for admin/config operations)
   */
  getProvider(name: string): IWhatsAppProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`WhatsApp provider "${name}" is not registered`);
    }
    return provider;
  }

  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
