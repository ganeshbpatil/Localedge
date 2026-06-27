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

interface MetaCloudConfig extends WAProviderConfig {
  accessToken: string;
  phoneNumberId: string;
  appSecret: string;
  apiVersion?: string;
}

@Injectable()
export class MetaCloudProvider implements IWhatsAppProvider {
  readonly providerName = 'META_CLOUD';
  private readonly logger = new Logger(MetaCloudProvider.name);
  private readonly baseUrl = 'https://graph.facebook.com';

  private getApiVersion(config: MetaCloudConfig): string {
    return config.apiVersion ?? 'v21.0';
  }

  private async post(url: string, data: unknown, token: string): Promise<unknown> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Meta API error ${response.status}: ${error}`);
    }

    return response.json();
  }

  async sendTextMessage(to: string, text: string, config: WAProviderConfig): Promise<WAMessageResult> {
    const cfg = config as MetaCloudConfig;
    const url = `${this.baseUrl}/${this.getApiVersion(cfg)}/${cfg.phoneNumberId}/messages`;

    try {
      const result = await this.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      }, cfg.accessToken) as { messages?: Array<{ id: string }> };

      return {
        messageId: result.messages?.[0]?.id ?? '',
        status: 'sent',
      };
    } catch (error) {
      this.logger.error('Failed to send text message via Meta Cloud', error);
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
    const cfg = config as MetaCloudConfig;
    const url = `${this.baseUrl}/${this.getApiVersion(cfg)}/${cfg.phoneNumberId}/messages`;

    try {
      const result = await this.post(url, {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components,
        },
      }, cfg.accessToken) as { messages?: Array<{ id: string }> };

      return {
        messageId: result.messages?.[0]?.id ?? '',
        status: 'sent',
      };
    } catch (error) {
      this.logger.error('Failed to send template message via Meta Cloud', error);
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
    const cfg = config as MetaCloudConfig;
    const url = `${this.baseUrl}/${this.getApiVersion(cfg)}/${cfg.phoneNumberId}/messages`;

    const mediaObj: Record<string, unknown> = { link: mediaUrl };
    if (caption && (type === 'image' || type === 'video' || type === 'document')) {
      mediaObj['caption'] = caption;
    }

    try {
      const result = await this.post(url, {
        messaging_product: 'whatsapp',
        to,
        type,
        [type]: mediaObj,
      }, cfg.accessToken) as { messages?: Array<{ id: string }> };

      return {
        messageId: result.messages?.[0]?.id ?? '',
        status: 'sent',
      };
    } catch (error) {
      this.logger.error('Failed to send media message via Meta Cloud', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendInteractiveMessage(
    to: string,
    interactive: WAInteractiveMessage,
    config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    const cfg = config as MetaCloudConfig;
    const url = `${this.baseUrl}/${this.getApiVersion(cfg)}/${cfg.phoneNumberId}/messages`;

    try {
      const result = await this.post(url, {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive,
      }, cfg.accessToken) as { messages?: Array<{ id: string }> };

      return {
        messageId: result.messages?.[0]?.id ?? '',
        status: 'sent',
      };
    } catch (error) {
      this.logger.error('Failed to send interactive message via Meta Cloud', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async handleWebhook(payload: unknown, _config: WAProviderConfig): Promise<WAIncomingMessage | null> {
    const data = payload as {
      object?: string;
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{
              id: string;
              from: string;
              to: string;
              type: string;
              timestamp: string;
              text?: { body: string };
              image?: { id: string; link?: string; caption?: string };
              interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } };
            }>;
            metadata?: { phone_number_id: string };
          };
        }>;
      }>;
    };

    if (data.object !== 'whatsapp_business_account') return null;

    const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;

    const to = data.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id ?? '';

    const base: WAIncomingMessage = {
      from: message.from,
      to,
      messageId: message.id,
      type: message.type as WAIncomingMessage['type'],
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      rawPayload: payload,
    };

    if (message.type === 'text' && message.text) {
      base.text = message.text.body;
    }

    if (message.type === 'interactive' && message.interactive) {
      base.interactive = {
        type: message.interactive.type === 'button_reply' ? 'button_reply' : 'list_reply',
        buttonId: message.interactive.button_reply?.id,
        listId: message.interactive.list_reply?.id,
        title: message.interactive.button_reply?.title ?? message.interactive.list_reply?.title,
      };
    }

    return base;
  }

  validateWebhookSignature(rawBody: string, signature: string, config: WAProviderConfig): boolean {
    const cfg = config as MetaCloudConfig;
    const expectedSignature = crypto
      .createHmac('sha256', cfg.appSecret)
      .update(rawBody)
      .digest('hex');

    const sig = signature.replace('sha256=', '');
    return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(sig, 'hex'));
  }
}
