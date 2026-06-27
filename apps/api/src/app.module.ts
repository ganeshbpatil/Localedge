import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TenantModule } from './modules/tenant/tenant.module.js';
import { BusinessModule } from './modules/business/business.module.js';
import { ReviewModule } from './modules/review/review.module.js';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module.js';
import { AIModule } from './modules/ai/ai.module.js';
import { OffersModule } from './modules/offers/offers.module.js';
import { QRModule } from './modules/qr/qr.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { CRMModule } from './modules/crm/crm.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { CrossPromotionModule } from './modules/cross-promotion/cross-promotion.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module.js';
import { ProviderConfigModule } from './modules/provider-config/provider-config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { QUEUE_NAMES } from '@localedge/shared';

@Module({
  controllers: [HealthController],
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Event emitter for internal events
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // BullMQ for background job queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('redisUrl'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.REVIEW_REPLY },
      { name: QUEUE_NAMES.WA_CAMPAIGN },
      { name: QUEUE_NAMES.WA_MESSAGE },
      { name: QUEUE_NAMES.ANALYTICS },
      { name: QUEUE_NAMES.WEBHOOK_DELIVERY },
      { name: QUEUE_NAMES.PAYMENT_TRIGGER },
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.SMS },
      { name: QUEUE_NAMES.GBP_SYNC },
    ),

    // Core
    DatabaseModule,

    // Feature modules
    AuthModule,
    TenantModule,
    BusinessModule,
    ReviewModule,
    WhatsAppModule,
    AIModule,
    OffersModule,
    QRModule,
    PaymentsModule,
    CRMModule,
    AnalyticsModule,
    CrossPromotionModule,
    WebhooksModule,
    FeatureFlagsModule,
    ProviderConfigModule,
  ],
})
export class AppModule {}
