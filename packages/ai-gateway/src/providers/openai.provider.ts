import OpenAI from 'openai';
import { AIProviderName } from '@localedge/shared';
import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderOptions } from '../types.js';
import { calculateCost } from '../types.js';

export class OpenAIProvider implements IAIProvider {
  readonly name = AIProviderName.OPENAI;

  private getClient(options: AIProviderOptions): OpenAI {
    return new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
      organization: options.organizationId,
    });
  }

  async complete(request: AICompletionRequest, options: AIProviderOptions): Promise<AICompletionResponse> {
    const client = this.getClient(options);
    const model = request.model ?? options.defaultModel ?? 'gpt-4o-mini';
    const startTime = Date.now();

    const response = await client.chat.completions.create({
      model,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1024,
      top_p: request.topP ?? 1,
    });

    const latencyMs = Date.now() - startTime;
    const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const content = response.choices[0]?.message?.content ?? '';
    const finishReason = response.choices[0]?.finish_reason ?? 'stop';

    return {
      content,
      model,
      provider: AIProviderName.OPENAI,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      cost: calculateCost(model, usage.prompt_tokens, usage.completion_tokens),
      latencyMs,
      finishReason: finishReason as AICompletionResponse['finishReason'],
    };
  }

  getModels(): string[] {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  estimateCost(tokensIn: number, tokensOut: number, model: string): number {
    return calculateCost(model, tokensIn, tokensOut);
  }
}
