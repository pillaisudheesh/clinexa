import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  app.enableCors({
    origin: ['http://localhost:3001'],
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

  const config = new DocumentBuilder()
    .setTitle('SamaRoot API')
    .setDescription('SamaRoot Clinic Management Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);

  console.log(`🚀 Server running at http://localhost:3000`);
  console.log(`📘 Swagger: http://localhost:3000/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
