import { AIProviderName } from '@localedge/shared';
import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderOptions } from '../types.js';

// Ollama uses a local server with OpenAI-compatible API
export class OllamaProvider implements IAIProvider {
  readonly name = AIProviderName.OLLAMA;

  async complete(request: AICompletionRequest, options: AIProviderOptions): Promise<AICompletionResponse> {
    const baseUrl = options.baseUrl ?? 'http://localhost:11434';
    const model = request.model ?? options.defaultModel ?? 'llama3.2';
    const startTime = Date.now();

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 1024,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      message?: { content: string };
      prompt_eval_count?: number;
      eval_count?: number;
      done_reason?: string;
    };

    const latencyMs = Date.now() - startTime;
    const content = data.message?.content ?? '';
    const tokensIn = data.prompt_eval_count ?? 0;
    const tokensOut = data.eval_count ?? 0;

    return {
      content,
      model,
      provider: AIProviderName.OLLAMA,
      usage: {
        promptTokens: tokensIn,
        completionTokens: tokensOut,
        totalTokens: tokensIn + tokensOut,
      },
      cost: 0, // Ollama is free (local)
      latencyMs,
      finishReason: data.done_reason === 'length' ? 'length' : 'stop',
    };
  }

  getModels(): string[] {
    return ['llama3.2', 'llama3.1', 'mistral', 'phi3', 'gemma2', 'qwen2.5'];
  }

  estimateCost(_tokensIn: number, _tokensOut: number, _model: string): number {
    return 0; // Local models are free
  }
}
