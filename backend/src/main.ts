import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { AppModule } from './app.module';
import { resolveUploadsDir } from './uploads-path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const corsOrigins = [...new Set([frontendUrl, 'http://localhost:3000', 'http://localhost:3001'])];

  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });

  const uploadsDir = resolveUploadsDir();
  app.use('/uploads', express.static(uploadsDir));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
}

void bootstrap();
