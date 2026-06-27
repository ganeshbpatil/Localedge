import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProviderName } from '@localedge/shared';
import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderOptions } from '../types.js';
import { calculateCost } from '../types.js';

export class GeminiProvider implements IAIProvider {
  readonly name = AIProviderName.GEMINI;

  async complete(request: AICompletionRequest, options: AIProviderOptions): Promise<AICompletionResponse> {
    const genAI = new GoogleGenerativeAI(options.apiKey);
    const model = request.model ?? options.defaultModel ?? 'gemini-1.5-flash';
    const startTime = Date.now();

    const geminiModel = genAI.getGenerativeModel({ model });

    // Build chat history
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    const systemInstruction = systemMessage?.content;
    const lastMessage = conversationMessages[conversationMessages.length - 1];

    if (!lastMessage) {
      throw new Error('No user message provided');
    }

    const history = conversationMessages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = geminiModel.startChat({
      history,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 1024,
        topP: request.topP ?? 1,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const latencyMs = Date.now() - startTime;

    const responseText = result.response.text();
    const usage = result.response.usageMetadata;

    const tokensIn = usage?.promptTokenCount ?? 0;
    const tokensOut = usage?.candidatesTokenCount ?? 0;

    return {
      content: responseText,
      model,
      provider: AIProviderName.GEMINI,
      usage: {
        promptTokens: tokensIn,
        completionTokens: tokensOut,
        totalTokens: tokensIn + tokensOut,
      },
      cost: calculateCost(model, tokensIn, tokensOut),
      latencyMs,
      finishReason: 'stop',
    };
  }

  getModels(): string[] {
    return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  }

  estimateCost(tokensIn: number, tokensOut: number, model: string): number {
    return calculateCost(model, tokensIn, tokensOut);
  }
}
