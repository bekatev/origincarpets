import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import express from 'express';
import { AppModule } from './app.module';

function resolveUploadsDir() {
  const candidates = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'backend', 'uploads'),
    join(__dirname, '..', 'uploads')
  ];
  return candidates.find((dir) => existsSync(dir)) ?? candidates[0];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const corsOrigins = [...new Set([frontendUrl, 'http://localhost:3000', 'http://localhost:3001'])];

  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });

  app.use('/uploads', express.static(resolveUploadsDir()));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
}

void bootstrap();
