import { Controller, Post, Body, Param, UseGuards, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';
import type { Request } from 'express';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('order')
  createOrder(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { businessId: string; amount: number; currency?: string; customerId?: string; description?: string },
  ) {
    return this.paymentsService.createOrder(user.tenantId, body.businessId, body);
  }

  @Post('verify')
  verifyPayment(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { businessId: string; paymentId: string; orderId: string; signature: string },
  ) {
    return this.paymentsService.verifyPayment(user.tenantId, body.businessId, body.paymentId, body.orderId, body.signature);
  }

  @Public()
  @Post('webhook/:tenantId')
  handleWebhook(
    @Param('tenantId') tenantId: string,
    @Body() body: unknown,
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(body);
    return this.paymentsService.handleWebhook(tenantId, body, signature, rawBody);
  }
}
