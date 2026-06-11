import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GPOST_DELIVERY_METHODS } from '../shipping/georgian-post.constants';
import { ShippingService } from '../shipping/shipping.service';
import { PUBLIC_SHIPPABLE_PRODUCT_WHERE } from '../products/shipping-dimensions';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const grouped = new Map<string, number>();
    for (const item of dto.items) {
      grouped.set(item.productId, (grouped.get(item.productId) ?? 0) + item.quantity);
    }

    const productIds = Array.from(grouped.keys());
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, ...PUBLIC_SHIPPABLE_PRODUCT_WHERE }
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are unavailable for purchase');
    }

    const deliveryCity = await this.prisma.deliveryCity.findUnique({
      where: { id: dto.deliveryCityId },
      include: { country: true }
    });

    if (!deliveryCity || deliveryCity.countryId !== dto.deliveryCountryId) {
      throw new BadRequestException('Invalid delivery city for selected country');
    }

    const method = GPOST_DELIVERY_METHODS[dto.deliveryMethod];
    const shipping = await this.shippingService.quote({
      items: dto.items,
      deliveryCountryId: dto.deliveryCountryId,
      deliveryCityId: dto.deliveryCityId,
      deliveryMethod: dto.deliveryMethod
    });

    const shippingZone = shipping.shippingZone;
    const subtotal = products.reduce((sum, product) => {
      const qty = grouped.get(product.id) ?? 0;
      return sum + Number(product.price) * qty;
    }, 0);

    const shippingCost = Number(shipping.shippingCost);
    const merchantShippingCostGel =
      shipping.shippingCostGel != null ? Number(shipping.shippingCostGel) : null;
    const total = subtotal + shippingCost;

    const shippingAddress = await this.prisma.shippingAddress.create({
      data: {
        userId,
        shippingZoneId: shippingZone.id,
        deliveryCityId: deliveryCity.id,
        type: 'SHIPPING',
        fullName: dto.shippingAddress.fullName,
        phone: dto.shippingAddress.phone,
        countryCode: deliveryCity.country.abbr,
        city: deliveryCity.nameEn,
        region: dto.shippingAddress.region,
        postalCode: dto.shippingAddress.postalCode,
        line1: dto.shippingAddress.line1,
        line2: dto.shippingAddress.line2
      }
    });

    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber: this.buildOrderNumber(),
        status: 'PENDING',
        currency: 'USD',
        subtotal,
        shippingCost,
        merchantShippingCostGel,
        total,
        shippingZoneId: shippingZone.id,
        shippingAddressId: shippingAddress.id,
        deliveryMethod: dto.deliveryMethod,
        gpostParcelTypeId: method.gpostId,
        items: {
          create: products.map((product) => {
            const quantity = grouped.get(product.id) ?? 0;
            const unitPrice = Number(product.price);
            return {
              productId: product.id,
              skuSnapshot: product.sku,
              titleSnapshot: product.title,
              quantity,
              unitPrice,
              lineTotal: unitPrice * quantity
            };
          })
        }
      },
      include: {
        items: true,
        shippingAddress: true,
        shippingZone: true
      }
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      deliveryMethod: dto.deliveryMethod,
      shippingProvider: shipping.provider,
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        city: order.shippingAddress.city,
        countryCode: order.shippingAddress.countryCode,
        line1: order.shippingAddress.line1
      },
      items: order.items.map((item) => ({
        productId: item.productId,
        title: item.titleSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal)
      }))
    };
  }

  async listMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      parcelTrackingNumber: order.parcelTrackingNumber,
      itemsCount: order.items.length
    }));
  }

  private buildOrderNumber() {
    const ts = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${ts}-${rand}`;
  }
}
