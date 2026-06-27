import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error', 'verbose'],
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: [
      process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
      process.env['ADMIN_URL'] ?? 'http://localhost:3002',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger docs
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LocalEdge API')
      .setDescription("India's AI-powered hyperlocal business growth platform")
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication')
      .addTag('business', 'Business management')
      .addTag('reviews', 'Review management')
      .addTag('whatsapp', 'WhatsApp messaging')
      .addTag('ai', 'AI features')
      .addTag('offers', 'Offers & coupons')
      .addTag('loyalty', 'Loyalty programs')
      .addTag('qr', 'QR codes')
      .addTag('payments', 'Payment processing')
      .addTag('crm', 'Customer management')
      .addTag('analytics', 'Analytics')
      .addTag('admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger docs available at /api/docs');
  }

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
  logger.log(`LocalEdge API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start LocalEdge API:', err);
  process.exit(1);
});
