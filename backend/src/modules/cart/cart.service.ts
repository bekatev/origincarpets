import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hasCompleteShipping, PUBLIC_SHIPPABLE_PRODUCT_WHERE } from '../products/shipping-dimensions';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!cart) {
      return { items: [], subtotal: 0 };
    }

    const shippableItems = cart.items.filter((item) => hasCompleteShipping(item.product));
    return this.serializeCart(shippableItems);
  }

  async syncCart(userId: string, items: Array<{ productId: string; quantity: number }>) {
    const normalized = this.normalizeItems(items);
    const ids = normalized.map((item) => item.productId);

    if (ids.length) {
      const count = await this.prisma.product.count({
        where: { id: { in: ids }, isActive: true, ...PUBLIC_SHIPPABLE_PRODUCT_WHERE }
      });
      if (count !== ids.length) {
        throw new BadRequestException('Some products are unavailable for purchase');
      }
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true }
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (normalized.length) {
        await tx.cartItem.createMany({
          data: normalized.map((item) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          }))
        });
      }
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const current = await this.getCart(userId);
    const merged = current.items
      .map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      .filter((item) => item.productId !== productId);

    merged.push({ productId, quantity });
    return this.syncCart(userId, merged);
  }

  async removeItem(userId: string, productId: string) {
    const current = await this.getCart(userId);
    const filtered = current.items
      .map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      .filter((item) => item.productId !== productId);

    return this.syncCart(userId, filtered);
  }

  private normalizeItems(items: Array<{ productId: string; quantity: number }>) {
    const map = new Map<string, number>();

    for (const item of items) {
      const existing = map.get(item.productId) ?? 0;
      map.set(item.productId, Math.min(99, existing + Math.max(1, Math.floor(item.quantity))));
    }

    return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  }

  private serializeCart(
    items: Array<{
      quantity: number;
      product: {
        id: string;
        slug: string;
        title: string;
        price: { toNumber(): number };
        images: Array<{ url: string }>;
      };
    }>
  ) {
    const result = items.map((item) => ({
      quantity: item.quantity,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        title: item.product.title,
        price: item.product.price.toNumber(),
        image: item.product.images[0]?.url ?? null
      }
    }));

    return {
      items: result,
      subtotal: result.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
    };
  }
}
