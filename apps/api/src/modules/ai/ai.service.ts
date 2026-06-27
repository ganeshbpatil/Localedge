import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AIGatewayService } from '@localedge/ai-gateway';
import type { AICompletionRequest, AICompletionResponse, AIRoutingConfig } from '@localedge/ai-gateway';
import { AIProviderName } from '@localedge/shared';
import { PrismaService } from '../../database/prisma.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';

// ============================================================
// AI Service
// Wraps the AI Gateway and bridges it with DB-stored configs.
// ============================================================

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly gateway: AIGatewayService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {
    this.gateway = new AIGatewayService({
      getRoutingConfig: this.getRoutingConfig.bind(this),
      logUsage: this.logUsage.bind(this),
    });
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    return this.gateway.complete(request);
  }

  private async getRoutingConfig(tenantId: string, useCase: string): Promise<AIRoutingConfig | null> {
    // 1. Check for specific routing rule
    const rule = await this.prisma.aIRoutingRule.findFirst({
      where: { tenantId, useCase, isActive: true },
    });

    // 2. Fall back to default provider config
    const providerName = rule?.provider ?? AIProviderName.OPENAI;
    const fallbackName = rule?.fallbackProvider;

    const providerConfig = await this.prisma.aIProviderConfig.findFirst({
      where: { tenantId, provider: providerName, isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (!providerConfig) {
      this.logger.warn(`No AI provider config for tenant ${tenantId}, provider ${providerName}`);
      return null;
    }

    const apiKey = this.encryption.decrypt(providerConfig.apiKeyEncrypted);

    let fallbackApiKey: string | undefined;
    let fallbackBaseUrl: string | undefined;

    if (fallbackName) {
      const fallbackConfig = await this.prisma.aIProviderConfig.findFirst({
        where: { tenantId, provider: fallbackName, isActive: true },
      });
      if (fallbackConfig) {
        fallbackApiKey = this.encryption.decrypt(fallbackConfig.apiKeyEncrypted);
        fallbackBaseUrl = fallbackConfig.baseUrl ?? undefined;
      }
    }

    return {
      tenantId,
      useCase,
      provider: providerName,
      model: rule?.model ?? this.getDefaultModel(providerName),
      apiKey,
      baseUrl: providerConfig.baseUrl ?? undefined,
      fallbackProvider: fallbackName ?? undefined,
      fallbackModel: rule?.fallbackModel ?? undefined,
      fallbackApiKey,
      fallbackBaseUrl,
    };
  }

  private async logUsage(log: Parameters<AIGatewayService['estimateCost']>[0] extends never ? never : {
    tenantId: string;
    businessId?: string;
    provider: AIProviderName;
    model: string;
    useCase: string;
    tokensIn: number;
    tokensOut: number;
    cost: number;
    latencyMs: number;
    success: boolean;
    errorMsg?: string;
  }): Promise<void> {
    try {
      await this.prisma.aIUsageLog.create({ data: log as Parameters<typeof this.prisma.aIUsageLog.create>[0]['data'] });
    } catch (err) {
      this.logger.error('Failed to log AI usage', err);
    }
  }

  private getDefaultModel(provider: AIProviderName): string {
    const defaults: Record<AIProviderName, string> = {
      [AIProviderName.OPENAI]: 'gpt-4o-mini',
      [AIProviderName.ANTHROPIC]: 'claude-3-5-haiku-20241022',
      [AIProviderName.GEMINI]: 'gemini-1.5-flash',
      [AIProviderName.GROQ]: 'llama-3.3-70b-versatile',
      [AIProviderName.DEEPSEEK]: 'deepseek-chat',
      [AIProviderName.MISTRAL]: 'mistral-small-latest',
      [AIProviderName.OLLAMA]: 'llama3.2',
      [AIProviderName.AZURE_OPENAI]: 'gpt-4o-mini',
      [AIProviderName.COHERE]: 'command-r',
    };
    return defaults[provider] ?? 'gpt-4o-mini';
  }

  async getUsageStats(tenantId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.aIUsageLog.findMany({
      where: { tenantId, createdAt: { gte: since } },
    });

    const totalCost = logs.reduce((sum, l) => sum + Number(l.cost), 0);
    const totalTokens = logs.reduce((sum, l) => sum + l.tokensIn + l.tokensOut, 0);
    const totalRequests = logs.length;
    const successRate = totalRequests > 0 ? logs.filter((l) => l.success).length / totalRequests : 0;

    const byProvider = logs.reduce<Record<string, { requests: number; cost: number; tokens: number }>>((acc, l) => {
      acc[l.provider] ??= { requests: 0, cost: 0, tokens: 0 };
      acc[l.provider]!.requests++;
      acc[l.provider]!.cost += Number(l.cost);
      acc[l.provider]!.tokens += l.tokensIn + l.tokensOut;
      return acc;
    }, {});

    return { totalCost, totalTokens, totalRequests, successRate, byProvider };
  }
}
