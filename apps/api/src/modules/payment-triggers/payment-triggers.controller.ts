import {
  Controller,
  Post,
  Param,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator.js';
import { PaymentTriggersService } from './payment-triggers.service.js';
import type { RazorpayWebhookPayload } from './dto/razorpay-webhook.dto.js';
import type { CashfreeWebhookPayload } from './dto/cashfree-webhook.dto.js';

@Controller('webhooks')
export class PaymentTriggersController {
  private readonly logger = new Logger(PaymentTriggersController.name);

  constructor(private readonly triggersService: PaymentTriggersService) {}

  // ─── Razorpay ───────────────────────────────────────────────────────────────

  @Public()
  @Post('razorpay/:businessId')
  @HttpCode(HttpStatus.OK)
  async razorpayWebhook(
    @Param('businessId') businessId: string,
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody?.toString('utf8') ?? '';

    if (!signature) {
      throw new BadRequestException('Missing x-razorpay-signature header');
    }

    const webhookSecret = await this.triggersService.getWebhookSecret(businessId, 'RAZORPAY');
    if (!webhookSecret) {
      this.logger.warn(`No Razorpay webhook secret configured for business ${businessId}`);
      throw new UnauthorizedException('Webhook not configured');
    }

    const isValid = this.triggersService.validateRazorpaySignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      this.logger.warn(`Invalid Razorpay signature for business ${businessId}`);
      throw new UnauthorizedException('Invalid signature');
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    this.logger.log(`Razorpay webhook: ${payload.event} for business ${businessId}`);

    await this.triggersService.handleRazorpayWebhook(businessId, rawBody, payload);

    return { received: true };
  }

  // ─── Cashfree ───────────────────────────────────────────────────────────────

  @Public()
  @Post('cashfree/:businessId')
  @HttpCode(HttpStatus.OK)
  async cashfreeWebhook(
    @Param('businessId') businessId: string,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-timestamp') timestamp: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody?.toString('utf8') ?? '';

    if (!signature || !timestamp) {
      throw new BadRequestException('Missing Cashfree signature headers');
    }

    const webhookSecret = await this.triggersService.getWebhookSecret(businessId, 'CASHFREE');
    if (!webhookSecret) {
      this.logger.warn(`No Cashfree webhook secret configured for business ${businessId}`);
      throw new UnauthorizedException('Webhook not configured');
    }

    const isValid = this.triggersService.validateCashfreeSignature(rawBody, timestamp, signature, webhookSecret);
    if (!isValid) {
      this.logger.warn(`Invalid Cashfree signature for business ${businessId}`);
      throw new UnauthorizedException('Invalid signature');
    }

    const payload = JSON.parse(rawBody) as CashfreeWebhookPayload;
    this.logger.log(`Cashfree webhook: ${payload.type} for business ${businessId}`);

    await this.triggersService.handleCashfreeWebhook(businessId, payload);

    return { received: true };
  }
}
