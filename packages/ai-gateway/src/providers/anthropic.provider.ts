import Anthropic from '@anthropic-ai/sdk';
import { AIProviderName } from '@localedge/shared';
import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderOptions } from '../types.js';
import { calculateCost } from '../types.js';

export class AnthropicProvider implements IAIProvider {
  readonly name = AIProviderName.ANTHROPIC;

  private getClient(options: AIProviderOptions): Anthropic {
    return new Anthropic({
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
    });
  }

  async complete(request: AICompletionRequest, options: AIProviderOptions): Promise<AICompletionResponse> {
    const client = this.getClient(options);
    const model = request.model ?? options.defaultModel ?? 'claude-3-5-haiku-20241022';
    const startTime = Date.now();

    // Separate system message from conversation
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    const response = await client.messages.create({
      model,
      system: systemMessage?.content,
      messages: conversationMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1024,
    });

    const latencyMs = Date.now() - startTime;
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return {
      content,
      model,
      provider: AIProviderName.ANTHROPIC,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      cost: calculateCost(model, response.usage.input_tokens, response.usage.output_tokens),
      latencyMs,
      finishReason: response.stop_reason === 'max_tokens' ? 'length' : 'stop',
    };
  }

  getModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ];
  }

  estimateCost(tokensIn: number, tokensOut: number, model: string): number {
    return calculateCost(model, tokensIn, tokensOut);
  }
}
