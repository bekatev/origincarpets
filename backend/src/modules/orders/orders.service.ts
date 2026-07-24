import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingService } from '../shipping/shipping.service';
import { AddressesService } from '../users/addresses.service';
import { PUBLIC_SHIPPABLE_PRODUCT_WHERE } from '../products/shipping-dimensions';
import { SHIPPING_PROVIDER_KEY } from '../shipping/shipping.constants';
import { CreateGuestOrderDto, CreateOrderDto } from './dto/create-order.dto';
import { GuestCheckoutTokenService } from './guest-checkout-token.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly addressesService: AddressesService,
    private readonly guestTokens: GuestCheckoutTokenService
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const order = await this.createOrderRecord({
      userId,
      guestEmail: null,
      dto,
      saveAddress: Boolean(dto.saveAddress)
    });

    return this.toOrderResponse(order, dto.deliveryMethod, order.shippingProvider ?? SHIPPING_PROVIDER_KEY);
  }

  async createGuestOrder(dto: CreateGuestOrderDto) {
    const guestEmail = dto.email.trim().toLowerCase();
    if (!guestEmail) {
      throw new BadRequestException('Email is required');
    }

    const order = await this.createOrderRecord({
      userId: null,
      guestEmail,
      dto,
      saveAddress: false
    });

    return {
      ...this.toOrderResponse(order, dto.deliveryMethod, order.shippingProvider ?? SHIPPING_PROVIDER_KEY),
      guestAccessToken: this.guestTokens.signForPayment(order.id)
    };
  }

  async lookupGuestOrder(email: string, orderNumber: string) {
    const guestEmail = email.trim().toLowerCase();
    const number = orderNumber.trim().toUpperCase();

    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber: { equals: number, mode: 'insensitive' },
        OR: [{ guestEmail }, { user: { email: guestEmail } }]
      },
      include: {
        items: true,
        shippingAddress: { include: { deliveryCity: { include: { country: true } } } }
      }
    });

    if (!order) {
      throw new NotFoundException('No order found for that email and order number');
    }

    const country =
      order.shippingAddress.deliveryCity?.country.nameEn ?? order.shippingAddress.countryCode;

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      deliveryMethod: order.deliveryMethod,
      createdAt: order.createdAt,
      parcelTrackingNumber: order.parcelTrackingNumber,
      items: order.items.map((item) => ({
        title: item.titleSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal)
      })),
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        line1: order.shippingAddress.line1,
        line2: order.shippingAddress.line2,
        city: order.shippingAddress.city,
        region: order.shippingAddress.region,
        postalCode: order.shippingAddress.postalCode,
        country,
        phone: order.shippingAddress.phone
      }
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

  private async createOrderRecord(input: {
    userId: string | null;
    guestEmail: string | null;
    dto: CreateOrderDto | CreateGuestOrderDto;
    saveAddress: boolean;
  }) {
    const { userId, guestEmail, dto, saveAddress } = input;

    if (!dto.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!userId && !guestEmail) {
      throw new BadRequestException('Order requires a user or guest email');
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
    const merchantShippingCostGel = shipping.merchantShippingCostUsd
      ? Math.round(shipping.merchantShippingCostUsd * 2.69 * 100) / 100
      : null;
    const total = subtotal + shippingCost;

    const cityName = dto.shippingAddress.city?.trim() || deliveryCity.nameEn;

    const shippingAddress = await this.prisma.shippingAddress.create({
      data: {
        userId: userId ?? null,
        shippingZoneId: shippingZone.id,
        deliveryCityId: deliveryCity.id,
        type: 'SHIPPING',
        fullName: dto.shippingAddress.fullName,
        phone: dto.shippingAddress.phone,
        countryCode: deliveryCity.country.abbr,
        city: cityName,
        region: dto.shippingAddress.region,
        postalCode: dto.shippingAddress.postalCode,
        line1: dto.shippingAddress.line1,
        line2: dto.shippingAddress.line2
      }
    });

    if (saveAddress && userId) {
      await this.addressesService.saveProfileAddressFromCheckout(userId, {
        deliveryCountryId: dto.deliveryCountryId,
        deliveryCityId: dto.deliveryCityId,
        fullName: dto.shippingAddress.fullName,
        phone: dto.shippingAddress.phone,
        region: dto.shippingAddress.region,
        postalCode: dto.shippingAddress.postalCode,
        line1: dto.shippingAddress.line1,
        line2: dto.shippingAddress.line2
      });
    }

    return this.prisma.order.create({
      data: {
        userId: userId ?? null,
        guestEmail,
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
        shippingProvider: SHIPPING_PROVIDER_KEY,
        billableWeightKg: shipping.package.chargeableWeightKg,
        packageLengthCm: shipping.package.lengthCm,
        packageWidthCm: shipping.package.widthCm,
        packageHeightCm: shipping.package.heightCm,
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
  }

  private toOrderResponse(
    order: {
      id: string;
      orderNumber: string;
      status: string;
      currency: string;
      subtotal: { toString(): string } | number;
      shippingCost: { toString(): string } | number;
      total: { toString(): string } | number;
      shippingAddress: { fullName: string; city: string; countryCode: string; line1: string };
      items: Array<{
        productId: string;
        titleSnapshot: string;
        quantity: number;
        unitPrice: { toString(): string } | number;
        lineTotal: { toString(): string } | number;
      }>;
    },
    deliveryMethod: string,
    shippingProvider: string
  ) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      deliveryMethod,
      shippingProvider,
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

  private buildOrderNumber() {
    const ts = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${ts}-${rand}`;
  }
}
