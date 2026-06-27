import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import type {
  IWhatsAppProvider,
  WAMessageResult,
  WAIncomingMessage,
  WAProviderConfig,
  WATemplateComponent,
  WAInteractiveMessage,
} from './whatsapp-provider.interface.js';

interface GupshupConfig extends WAProviderConfig {
  apiKey: string;
  appName: string;
  sourcePhone: string;
}

@Injectable()
export class GupshupProvider implements IWhatsAppProvider {
  readonly providerName = 'GUPSHUP';
  private readonly logger = new Logger(GupshupProvider.name);
  private readonly baseUrl = 'https://api.gupshup.io/wa/api/v1';

  private async post(endpoint: string, data: URLSearchParams, apiKey: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: apiKey,
      },
      body: data.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gupshup API error ${response.status}: ${error}`);
    }

    return response.json();
  }

  async sendTextMessage(to: string, text: string, config: WAProviderConfig): Promise<WAMessageResult> {
    const cfg = config as GupshupConfig;
    try {
      const params = new URLSearchParams({
        channel: 'whatsapp',
        source: cfg.sourcePhone,
        destination: to,
        message: JSON.stringify({ type: 'text', text }),
        'src.name': cfg.appName,
      });

      const result = await this.post('/msg', params, cfg.apiKey) as { messageId?: string };
      return { messageId: result.messageId ?? '', status: 'queued' };
    } catch (error) {
      this.logger.error('Gupshup sendTextMessage failed', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string,
    components: WATemplateComponent[],
    config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    const cfg = config as GupshupConfig;
    try {
      // Gupshup template format
      const params = new URLSearchParams({
        channel: 'whatsapp',
        source: cfg.sourcePhone,
        destination: to,
        template: JSON.stringify({
          id: templateName,
          params: components
            .flatMap((c) => c.parameters)
            .filter((p) => p.type === 'text')
            .map((p) => p.text ?? ''),
        }),
        'src.name': cfg.appName,
      });

      void language; // Gupshup uses template ID

      const result = await this.post('/template/msg', params, cfg.apiKey) as { messageId?: string };
      return { messageId: result.messageId ?? '', status: 'queued' };
    } catch (error) {
      this.logger.error('Gupshup sendTemplateMessage failed', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    type: 'image' | 'video' | 'document' | 'audio',
    caption: string | undefined,
    config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    const cfg = config as GupshupConfig;
    try {
      const msgObj: Record<string, unknown> = { type, url: mediaUrl };
      if (caption) msgObj['caption'] = caption;

      const params = new URLSearchParams({
        channel: 'whatsapp',
        source: cfg.sourcePhone,
        destination: to,
        message: JSON.stringify(msgObj),
        'src.name': cfg.appName,
      });

      const result = await this.post('/msg', params, cfg.apiKey) as { messageId?: string };
      return { messageId: result.messageId ?? '', status: 'queued' };
    } catch (error) {
      this.logger.error('Gupshup sendMediaMessage failed', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendInteractiveMessage(
    _to: string,
    _interactive: WAInteractiveMessage,
    _config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    // Gupshup has its own interactive format - simplified implementation
    this.logger.warn('Gupshup interactive messages require custom implementation');
    return { messageId: '', status: 'failed', error: 'Not implemented for Gupshup' };
  }

  async handleWebhook(payload: unknown, _config: WAProviderConfig): Promise<WAIncomingMessage | null> {
    const data = payload as {
      app?: string;
      payload?: {
        id: string;
        source: string;
        type: string;
        payload?: { text?: string };
        timestamp: number;
      };
    };

    if (!data.payload) return null;

    return {
      from: data.payload.source,
      to: data.app ?? '',
      messageId: data.payload.id,
      type: (data.payload.type === 'text' ? 'text' : 'text') as WAIncomingMessage['type'],
      text: data.payload.payload?.text,
      timestamp: new Date(data.payload.timestamp),
      rawPayload: payload,
    };
  }

  validateWebhookSignature(rawBody: string, signature: string, config: WAProviderConfig): boolean {
    const cfg = config as GupshupConfig;
    // Gupshup uses HMAC-SHA256
    const expected = crypto.createHmac('sha256', cfg.apiKey).update(rawBody).digest('hex');
    return signature === expected;
  }
}
