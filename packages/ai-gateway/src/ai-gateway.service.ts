import { AIProviderName } from '@localedge/shared';
import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIGatewayOptions, AIRoutingConfig, AIProviderOptions } from './types.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import { OllamaProvider } from './providers/ollama.provider.js';

// ============================================================
// AI Gateway Service
// Routes requests to the correct provider based on routing rules
// stored in the database (ai_routing_rules table).
// Falls back to fallback provider on failure.
// Logs all usage to ai_usage_logs table.
// ============================================================

export class AIGatewayService {
  private readonly providers: Map<AIProviderName, IAIProvider>;
  private readonly options: AIGatewayOptions;

  constructor(options: AIGatewayOptions) {
    this.options = options;
    this.providers = new Map([
      [AIProviderName.OPENAI, new OpenAIProvider()],
      [AIProviderName.ANTHROPIC, new AnthropicProvider()],
      [AIProviderName.GEMINI, new GeminiProvider()],
      [AIProviderName.GROQ, new GroqProvider()],
      [AIProviderName.OLLAMA, new OllamaProvider()],
    ]);
  }

  private getProvider(name: AIProviderName): IAIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI provider "${name}" is not registered`);
    }
    return provider;
  }

  /**
   * Complete a chat request.
   * Automatically routes to the correct provider based on:
   * 1. tenantId + useCase → looks up ai_routing_rules
   * 2. Falls back to fallback_provider on error
   * 3. Logs usage to ai_usage_logs
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const tenantId = request.tenantId;
    const useCase = request.useCase ?? 'chat';

    if (!tenantId) {
      throw new Error('tenantId is required for AI Gateway routing');
    }

    const routingConfig = await this.options.getRoutingConfig(tenantId, useCase);

    if (!routingConfig) {
      throw new Error(`No AI routing rule found for tenant "${tenantId}" and use case "${useCase}"`);
    }

    let response: AICompletionResponse;
    let usedProvider = routingConfig.provider;
    let usedModel = request.model ?? routingConfig.model;

    try {
      response = await this.callProvider(
        routingConfig.provider,
        { ...request, model: usedModel },
        {
          apiKey: routingConfig.apiKey,
          baseUrl: routingConfig.baseUrl,
          defaultModel: routingConfig.model,
        },
      );
    } catch (primaryError) {
      // Try fallback provider
      if (routingConfig.fallbackProvider && routingConfig.fallbackApiKey) {
        console.warn(
          `Primary AI provider "${routingConfig.provider}" failed, falling back to "${routingConfig.fallbackProvider}"`,
          primaryError,
        );

        usedProvider = routingConfig.fallbackProvider;
        usedModel = request.model ?? routingConfig.fallbackModel ?? routingConfig.model;

        try {
          response = await this.callProvider(
            routingConfig.fallbackProvider,
            { ...request, model: usedModel },
            {
              apiKey: routingConfig.fallbackApiKey,
              baseUrl: routingConfig.fallbackBaseUrl,
              defaultModel: routingConfig.fallbackModel,
            },
          );
        } catch (fallbackError) {
          // Both failed - log failure and throw
          await this.logFailure(tenantId, request.businessId, routingConfig.fallbackProvider, usedModel, useCase, fallbackError);
          throw fallbackError;
        }
      } else {
        await this.logFailure(tenantId, request.businessId, routingConfig.provider, usedModel, useCase, primaryError);
        throw primaryError;
      }
    }

    // Log successful usage
    await this.options.logUsage({
      tenantId,
      businessId: request.businessId,
      provider: usedProvider,
      model: usedModel,
      useCase,
      tokensIn: response.usage.promptTokens,
      tokensOut: response.usage.completionTokens,
      cost: response.cost,
      latencyMs: response.latencyMs,
      success: true,
    });

    return response;
  }

  private async callProvider(
    providerName: AIProviderName,
    request: AICompletionRequest,
    options: AIProviderOptions,
  ): Promise<AICompletionResponse> {
    const provider = this.getProvider(providerName);
    return provider.complete(request, options);
  }

  private async logFailure(
    tenantId: string,
    businessId: string | undefined,
    provider: AIProviderName,
    model: string,
    useCase: string,
    error: unknown,
  ): Promise<void> {
    try {
      await this.options.logUsage({
        tenantId,
        businessId,
        provider,
        model,
        useCase,
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        latencyMs: 0,
        success: false,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
    } catch {
      // Don't throw from logging
    }
  }

  /**
   * Get all registered provider names
   */
  getRegisteredProviders(): AIProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get available models for a provider
   */
  getModelsForProvider(providerName: AIProviderName): string[] {
    const provider = this.providers.get(providerName);
    return provider?.getModels() ?? [];
  }

  /**
   * Estimate cost for a request without making an API call
   */
  estimateCost(providerName: AIProviderName, model: string, tokensIn: number, tokensOut: number): number {
    const provider = this.providers.get(providerName);
    return provider?.estimateCost(tokensIn, tokensOut, model) ?? 0;
  }
}
