import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { ShippingService } from '../modules/shipping/shipping.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const shipping = app.get(ShippingService);
  const prisma = app.get(PrismaService);

  const countries = await shipping.syncAllCountries();
  console.log(`Synced ${countries.count} countries from Georgian Post`);

  const georgia = await prisma.deliveryCountry.findFirst({ where: { abbr: 'GE' } });
  if (georgia) {
    const cities = await shipping.syncCitiesForCountry(georgia.id);
    console.log(`Synced ${cities.count} cities for Georgia`);
  }

  await app.close();
}

void main();
