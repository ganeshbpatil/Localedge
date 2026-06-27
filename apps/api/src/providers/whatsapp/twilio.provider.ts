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

interface TwilioConfig extends WAProviderConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string; // whatsapp:+1234567890
}

@Injectable()
export class TwilioProvider implements IWhatsAppProvider {
  readonly providerName = 'TWILIO';
  private readonly logger = new Logger(TwilioProvider.name);

  private async post(cfg: TwilioConfig, data: URLSearchParams): Promise<unknown> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
    const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: data.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio error ${response.status}: ${error}`);
    }

    return response.json();
  }

  async sendTextMessage(to: string, text: string, config: WAProviderConfig): Promise<WAMessageResult> {
    const cfg = config as TwilioConfig;
    try {
      const params = new URLSearchParams({
        From: cfg.fromNumber,
        To: `whatsapp:${to}`,
        Body: text,
      });

      const result = await this.post(cfg, params) as { sid?: string };
      return { messageId: result.sid ?? '', status: 'queued' };
    } catch (error) {
      this.logger.error('Twilio sendTextMessage failed', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    _language: string,
    components: WATemplateComponent[],
    config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    const cfg = config as TwilioConfig;
    try {
      // Twilio uses content templates differently
      const params = new URLSearchParams({
        From: cfg.fromNumber,
        To: `whatsapp:${to}`,
        ContentSid: templateName,
        ContentVariables: JSON.stringify(
          Object.fromEntries(
            components
              .flatMap((c) => c.parameters)
              .filter((p) => p.type === 'text')
              .map((p, i) => [`${i + 1}`, p.text ?? '']),
          ),
        ),
      });

      const result = await this.post(cfg, params) as { sid?: string };
      return { messageId: result.sid ?? '', status: 'queued' };
    } catch (error) {
      this.logger.error('Twilio sendTemplateMessage failed', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    _type: 'image' | 'video' | 'document' | 'audio',
    caption: string | undefined,
    config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    const cfg = config as TwilioConfig;
    try {
      const params = new URLSearchParams({
        From: cfg.fromNumber,
        To: `whatsapp:${to}`,
        MediaUrl: mediaUrl,
      });
      if (caption) params.append('Body', caption);

      const result = await this.post(cfg, params) as { sid?: string };
      return { messageId: result.sid ?? '', status: 'queued' };
    } catch (error) {
      this.logger.error('Twilio sendMediaMessage failed', error);
      return { messageId: '', status: 'failed', error: String(error) };
    }
  }

  async sendInteractiveMessage(
    _to: string,
    _interactive: WAInteractiveMessage,
    _config: WAProviderConfig,
  ): Promise<WAMessageResult> {
    return { messageId: '', status: 'failed', error: 'Interactive messages not supported by Twilio WhatsApp' };
  }

  async handleWebhook(payload: unknown, _config: WAProviderConfig): Promise<WAIncomingMessage | null> {
    const data = payload as {
      MessageSid?: string;
      From?: string;
      To?: string;
      Body?: string;
      MediaUrl0?: string;
      NumMedia?: string;
    };

    if (!data.MessageSid) return null;

    const from = data.From?.replace('whatsapp:', '') ?? '';
    const to = data.To?.replace('whatsapp:', '') ?? '';

    return {
      from,
      to,
      messageId: data.MessageSid,
      type: data.NumMedia && parseInt(data.NumMedia) > 0 ? 'image' : 'text',
      text: data.Body,
      mediaUrl: data.MediaUrl0,
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  validateWebhookSignature(rawBody: string, signature: string, config: WAProviderConfig): boolean {
    const cfg = config as TwilioConfig;
    const expected = crypto
      .createHmac('sha1', cfg.authToken)
      .update(rawBody)
      .digest('base64');
    return signature === expected;
  }
}
