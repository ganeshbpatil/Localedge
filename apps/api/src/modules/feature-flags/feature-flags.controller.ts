import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureFlagsService } from './feature-flags.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  getAll(@CurrentUser() user: CurrentUserData) {
    return this.featureFlagsService.getAll(user.tenantId);
  }

  @Get('check')
  check(@CurrentUser() user: CurrentUserData, @Query('flag') flag: string) {
    return this.featureFlagsService.isEnabled(user.tenantId, flag);
  }

  @Post()
  set(@CurrentUser() user: CurrentUserData, @Body() body: { flagKey: string; isEnabled: boolean; rolloutPercentage?: number }) {
    return this.featureFlagsService.set(user.tenantId, body.flagKey, body.isEnabled, body.rolloutPercentage);
  }
}
