import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  // Clinic logos are non-sensitive brand assets; serve only the dedicated logo directory.
  app.use(
    '/api/v1/clinic-settings/branding/logo',
    express.static(join(process.cwd(), 'uploads', 'clinic-logos'), {
      fallthrough: true,
      maxAge: '7d',
      index: false,
    }),
  );

  app.setGlobalPrefix('api/v1');
  const corsOrigins = configService.getOrThrow<string[]>('app.corsOrigins');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      // transformOptions: {
      //   enableImplicitConversion: true,
      // },
    }),
  );

  const swaggerEnabled = configService.getOrThrow<boolean>(
    'app.swaggerEnabled',
  );
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SamaRoot API')
      .setDescription('SamaRoot Clinic Management Platform')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  if (swaggerEnabled) {
    console.log(`📘 Swagger: /docs`);
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
