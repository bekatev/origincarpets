import type { Prisma } from '@prisma/client';

/** Products must have full shipping dimensions before they appear on the storefront. */
export const PUBLIC_SHIPPABLE_PRODUCT_WHERE = {
  weightKg: { not: null },
  lengthCm: { not: null },
  widthCm: { not: null },
  heightCm: { not: null }
} satisfies Prisma.ProductWhereInput;

export type ShippingFields = {
  weightKg?: unknown;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
};

export function hasCompleteShipping(product: ShippingFields) {
  return (
    product.weightKg != null &&
    product.lengthCm != null &&
    product.widthCm != null &&
    product.heightCm != null
  );
}

export function mergeShippingFields(
  existing: ShippingFields | null | undefined,
  dto: ShippingFields
): ShippingFields {
  return {
    weightKg: dto.weightKg !== undefined ? dto.weightKg : (existing?.weightKg ?? null),
    lengthCm: dto.lengthCm !== undefined ? dto.lengthCm : (existing?.lengthCm ?? null),
    widthCm: dto.widthCm !== undefined ? dto.widthCm : (existing?.widthCm ?? null),
    heightCm: dto.heightCm !== undefined ? dto.heightCm : (existing?.heightCm ?? null)
  };
}

export const CANNOT_PUBLISH_INCOMPLETE_SHIPPING =
  'Complete shipping dimensions (weight, length, width, height) are required before publishing';

/** Storefront visibility — forced off when shipping data is incomplete. */
export function resolveProductPublication(params: {
  shipping: ShippingFields;
  requestedPublished?: boolean;
  currentPublished?: boolean;
  isCreate?: boolean;
}): { isActive: boolean; rejectPublish?: boolean } {
  const { shipping, requestedPublished, currentPublished, isCreate } = params;

  if (!hasCompleteShipping(shipping)) {
    if (requestedPublished === true) {
      return { isActive: false, rejectPublish: true };
    }
    return { isActive: false };
  }

  if (requestedPublished !== undefined) {
    return { isActive: requestedPublished };
  }

  if (isCreate) {
    return { isActive: true };
  }

  return { isActive: currentPublished ?? false };
}

/** Legacy origincarpets.com stores carpet length/width in metres. */
export function legacyMetresToCm(value?: number): number | undefined {
  if (!Number.isFinite(value) || value! <= 0) return undefined;
  return Math.round(value! * 100);
}

export function resolveLegacyHeightCm(
  heightMetres?: number,
  lengthCm?: number
): number | undefined {
  const rawHeightCm = legacyMetresToCm(heightMetres);
  if (!rawHeightCm) return undefined;

  // Legacy data often duplicates length into height — use rolled-carpet height instead.
  if (lengthCm && rawHeightCm >= lengthCm * 0.5) {
    return 20;
  }

  return rawHeightCm;
}
