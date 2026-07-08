import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../modules/mail/mail.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log']
  });

  const prisma = app.get(PrismaService);
  const mail = app.get(MailService);

  const order = await prisma.order.findFirst({
    where: { status: { in: ['PAID', 'PENDING'] } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      shippingAddress: { include: { deliveryCity: { include: { country: true } } } },
      items: { include: { product: true } }
    }
  });

  if (!order) {
    console.error('No order found in database — create one via checkout first.');
    await app.close();
    process.exit(1);
  }

  console.log(`Sending test admin email for order ${order.orderNumber}...`);

  await mail.sendAdminShipmentRequestEmail({
    order,
    packageDimensions: {
      weightKg: Number(order.billableWeightKg ?? 8),
      lengthCm: order.packageLengthCm ?? 200,
      widthCm: order.packageWidthCm ?? 150,
      heightCm: order.packageHeightCm ?? 20
    },
    billableWeightKg: Number(order.billableWeightKg ?? 8),
    estimatedMerchantCostUsd: Number(order.shippingCost)
  });

  console.log('Done — check bekatevd@gmail.com and gallerycarpets19@gmail.com (and spam).');
  await app.close();
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
