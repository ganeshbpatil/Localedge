// ============================================================
// WhatsApp Provider Interface
// All WhatsApp providers must implement this interface.
// Zero code changes to switch between Meta, Gupshup, Twilio, etc.
// ============================================================

export interface WAMessageResult {
  messageId: string;
  status: 'queued' | 'sent' | 'failed';
  error?: string;
}

export interface WAIncomingMessage {
  from: string;
  to: string;
  messageId: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'interactive' | 'button';
  text?: string;
  mediaUrl?: string;
  mediaId?: string;
  caption?: string;
  location?: { lat: number; lng: number; name?: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    buttonId?: string;
    listId?: string;
    title?: string;
  };
  timestamp: Date;
  rawPayload: unknown;
}

export interface WAProviderConfig {
  // All config comes from DB - provider-specific shape
  [key: string]: unknown;
}

export interface IWhatsAppProvider {
  readonly providerName: string;

  /**
   * Send a plain text message
   */
  sendTextMessage(
    to: string,
    text: string,
    config: WAProviderConfig,
  ): Promise<WAMessageResult>;

  /**
   * Send a pre-approved template message
   */
  sendTemplateMessage(
    to: string,
    templateName: string,
    language: string,
    components: WATemplateComponent[],
    config: WAProviderConfig,
  ): Promise<WAMessageResult>;

  /**
   * Send a media message (image/video/document/audio)
   */
  sendMediaMessage(
    to: string,
    mediaUrl: string,
    type: 'image' | 'video' | 'document' | 'audio',
    caption: string | undefined,
    config: WAProviderConfig,
  ): Promise<WAMessageResult>;

  /**
   * Send an interactive message (buttons / list)
   */
  sendInteractiveMessage(
    to: string,
    interactive: WAInteractiveMessage,
    config: WAProviderConfig,
  ): Promise<WAMessageResult>;

  /**
   * Parse a webhook payload into a normalized incoming message
   */
  handleWebhook(
    payload: unknown,
    config: WAProviderConfig,
  ): Promise<WAIncomingMessage | null>;

  /**
   * Validate webhook signature for security
   */
  validateWebhookSignature(
    rawBody: string,
    signature: string,
    config: WAProviderConfig,
  ): boolean;
}

export interface WATemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: WATemplateParameter[];
}

export interface WATemplateParameter {
  type: 'text' | 'image' | 'video' | 'document' | 'currency' | 'date_time';
  text?: string;
  image?: { link: string };
  video?: { link: string };
  document?: { link: string; filename?: string };
  currency?: { fallback_value: string; code: string; amount_1000: number };
}

export interface WAInteractiveMessage {
  type: 'button' | 'list';
  header?: { type: 'text' | 'image'; text?: string; image?: { link: string } };
  body: { text: string };
  footer?: { text: string };
  action: WAButtonAction | WAListAction;
}

export interface WAButtonAction {
  buttons: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
}

export interface WAListAction {
  button: string;
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}
