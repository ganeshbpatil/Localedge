import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentProviderName } from '@localedge/shared';
import { PrismaService } from '../../database/prisma.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import type { IPaymentProvider, PaymentProviderConfig } from './payment-provider.interface.js';
import { RazorpayProvider } from './razorpay.provider.js';
import { CashfreeProvider } from './cashfree.provider.js';

@Injectable()
export class PaymentProviderFactory {
  private readonly logger = new Logger(PaymentProviderFactory.name);

  private readonly providers: Map<string, IPaymentProvider> = new Map([
    [PaymentProviderName.RAZORPAY, new RazorpayProvider()],
    [PaymentProviderName.CASHFREE, new CashfreeProvider()],
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async getDefaultProviderForTenant(tenantId: string): Promise<{
    provider: IPaymentProvider;
    config: PaymentProviderConfig;
  }> {
    const paymentConfig = await this.prisma.paymentConfig.findFirst({
      where: { tenantId, isActive: true, isDefault: true },
    });

    if (!paymentConfig) {
      throw new NotFoundException(`No active payment configuration found for tenant ${tenantId}`);
    }

    const provider = this.providers.get(paymentConfig.provider);
    if (!provider) {
      throw new NotFoundException(`Payment provider "${paymentConfig.provider}" is not supported`);
    }

    const decryptedConfig = this.encryption.decryptObject(paymentConfig.config as Record<string, string>);

    return { provider, config: decryptedConfig };
  }

  getProvider(name: string): IPaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`Payment provider "${name}" is not registered`);
    }
    return provider;
  }

  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
