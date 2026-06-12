/**
 * Local Georgian Post end-to-end test (no payment).
 * Creates a PENDING order, registers parcel via iStore API, prints result.
 *
 * Usage: npm run test:gpost
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../modules/orders/orders.service';
import { ShippingService } from '../modules/shipping/shipping.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const prisma = app.get(PrismaService);
  const orders = app.get(OrdersService);
  const shipping = app.get(ShippingService);

  const user =
    (await prisma.user.findFirst({ where: { role: 'ADMIN' } })) ??
    (await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }));

  if (!user) {
    throw new Error('No user in database — register at http://localhost:3000/register first');
  }

  const product = await prisma.product.findFirst({
    where: { isActive: true, weightKg: { not: null }, lengthCm: { not: null }, widthCm: { not: null } }
  });
  if (!product) {
    throw new Error('No shippable product — need weight + dimensions in admin');
  }

  const georgia = await prisma.deliveryCountry.findFirst({
    where: { abbr: 'GE' },
    include: { cities: { where: { nameEn: 'Tbilisi' }, take: 1 } }
  });
  const city = georgia?.cities[0];
  if (!georgia || !city) {
    throw new Error('Georgia/Tbilisi missing — run: npm run sync:gpost');
  }

  console.log(`User: ${user.email}`);
  console.log(`Product: ${product.title} (${product.slug})`);
  console.log(`Delivery: ${city.nameEn}, Georgia\n`);

  const order = await orders.createOrder(user.id, {
    items: [{ productId: product.id, quantity: 1 }],
    deliveryCountryId: georgia.id,
    deliveryCityId: city.id,
    deliveryMethod: 'CD-Parcel',
    shippingAddress: {
      fullName: 'Test User',
      phone: '+995555123456',
      region: 'Tbilisi',
      postalCode: '0108',
      line1: '12 Rustaveli Ave',
      line2: 'Test order — local GP check'
    }
  });

  const saved = await prisma.order.findUnique({
    where: { id: order.id },
    select: { merchantShippingCostGel: true }
  });

  console.log(`Order created: ${order.orderNumber} (${order.id})`);
  console.log(
    `Merchant GP cost (quote): ${saved?.merchantShippingCostGel != null ? `₾${Number(saved.merchantShippingCostGel).toFixed(2)}` : 'n/a'}\n`
  );
  console.log('Registering parcel with Georgian Post API...');

  const result = await shipping.registerOrderParcel(order.id);

  if (result.success) {
    console.log('\n✅ SUCCESS — parcel registered with Georgian Post');
    console.log(`   Internal code: ${result.parcelInternalCode}`);
    console.log(`   Tracking:      ${result.parcelTrackingNumber}`);
    console.log('\nVerify on https://www.gpost.ge/ with the tracking number.');
  } else {
    console.log('\n❌ FAILED — parcel not registered');
    console.log(`   Error: ${'error' in result ? result.error : 'unknown'}`);

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      select: { parcelRegistrationError: true }
    });
    if (updated?.parcelRegistrationError) {
      console.log(`   DB error: ${updated.parcelRegistrationError}`);
    }
  }

  await app.close();
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
