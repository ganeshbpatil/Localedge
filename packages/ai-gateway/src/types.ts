import type { AIProviderName } from '@localedge/shared';

// ============================================================
// AI Gateway Types
// ============================================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  useCase?: string;
  tenantId?: string;
  businessId?: string;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: AIProviderName;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latencyMs: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface AIProviderOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  organizationId?: string;
}

export interface IAIProvider {
  readonly name: AIProviderName;
  complete(request: AICompletionRequest, options: AIProviderOptions): Promise<AICompletionResponse>;
  getModels(): string[];
  estimateCost(tokensIn: number, tokensOut: number, model: string): number;
}

export interface AIRoutingConfig {
  tenantId: string;
  useCase: string;
  provider: AIProviderName;
  model: string;
  apiKey: string;
  baseUrl?: string;
  fallbackProvider?: AIProviderName;
  fallbackModel?: string;
  fallbackApiKey?: string;
  fallbackBaseUrl?: string;
}

export interface AIGatewayOptions {
  getRoutingConfig: (tenantId: string, useCase: string) => Promise<AIRoutingConfig | null>;
  logUsage: (log: AIUsageLogEntry) => Promise<void>;
}

export interface AIUsageLogEntry {
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
}

// Per-model pricing in USD per 1K tokens
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
  // Gemini
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
  // Groq
  'llama-3.3-70b-versatile': { input: 0.00059, output: 0.00079 },
  'llama-3.1-8b-instant': { input: 0.00005, output: 0.00008 },
  'mixtral-8x7b-32768': { input: 0.00027, output: 0.00027 },
  'gemma2-9b-it': { input: 0.0002, output: 0.0002 },
  // Ollama (local, no cost)
  'llama3.2': { input: 0, output: 0 },
  'mistral': { input: 0, output: 0 },
  'phi3': { input: 0, output: 0 },
};

export function calculateCost(model: string, tokensIn: number, tokensOut: number): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (tokensIn / 1000) * pricing.input + (tokensOut / 1000) * pricing.output;
}
