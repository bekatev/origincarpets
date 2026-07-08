/**
 * Legacy Georgian Post smoke test — shipping now uses UPS manual fulfillment.
 * Run only if you need to verify GPOST credentials in isolation.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { GeorgianPostClient } from '../modules/shipping/georgian-post.client';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const gpost = app.get(GeorgianPostClient);

  if (!gpost.isConfigured()) {
    console.log('GPOST credentials not set — skipping');
    await app.close();
    return;
  }

  const countries = await gpost.fetchCountries();
  console.log(`Georgian Post countries: ${countries.length}`);
  await app.close();
}

void main();
