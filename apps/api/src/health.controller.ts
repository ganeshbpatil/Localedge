import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator.js';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'LocalEdge API', timestamp: new Date().toISOString() };
  }
}
