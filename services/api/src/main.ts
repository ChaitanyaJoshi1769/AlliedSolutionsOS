import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';
import * as pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { initializeOpenTelemetry } from './observability/otel.config';

async function bootstrap() {
  // Initialize OpenTelemetry
  initializeOpenTelemetry();

  // Create logger
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: false,
      },
    },
  });

  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  // Use pino logger
  app.use(pinoHttp({ logger }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3001);
  const apiVersion = configService.get<string>('API_VERSION', 'v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0', () => {
    logger.info(
      `🚀 Allied Solutions API Server running on http://0.0.0.0:${port}/api/${apiVersion}`
    );
    logger.info(`📊 GraphQL Playground: http://0.0.0.0:${port}/graphql`);
    logger.info(`🏥 Health Check: http://0.0.0.0:${port}/health`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
