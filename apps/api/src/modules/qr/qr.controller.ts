import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QRService } from './qr.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';
import type { QRCodeType } from '@localedge/shared';

@ApiTags('qr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses/:businessId/qr')
export class QRController {
  constructor(private readonly qrService: QRService) {}

  @Post()
  create(@Param('businessId') businessId: string, @Body() body: { name: string; type: QRCodeType; targetUrl?: string }) {
    return this.qrService.create(businessId, body);
  }

  @Get()
  findAll(@Param('businessId') businessId: string) {
    return this.qrService.findAll(businessId);
  }

  @Public()
  @Get('scan/:id')
  trackScan(@Param('id') id: string) {
    return this.qrService.trackScan(id);
  }
}
