/** Rolled carpet default height when product has no depth. */
export const DEFAULT_PACKAGE_HEIGHT_CM = 20;

export const DEFAULT_PRODUCT_WEIGHT_KG = 5;
export const DEFAULT_PRODUCT_LENGTH_CM = 200;
export const DEFAULT_PRODUCT_WIDTH_CM = 150;

export type ProductDimensions = {
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  weightKg: { toNumber(): number } | number | null;
};

export type PackageDimensions = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export function productPackageDimensions(product?: ProductDimensions): PackageDimensions {
  const weight =
    product?.weightKg != null
      ? typeof product.weightKg === 'number'
        ? product.weightKg
        : product.weightKg.toNumber()
      : DEFAULT_PRODUCT_WEIGHT_KG;

  return {
    weightKg: weight,
    lengthCm: product?.lengthCm ?? DEFAULT_PRODUCT_LENGTH_CM,
    widthCm: product?.widthCm ?? DEFAULT_PRODUCT_WIDTH_CM,
    heightCm: product?.heightCm ?? DEFAULT_PACKAGE_HEIGHT_CM
  };
}

/** Combine line items into one outbound parcel estimate (pre-packing). */
export function combineOrderPackage(
  items: Array<{ product: ProductDimensions; quantity: number }>
): PackageDimensions {
  let totalWeightKg = 0;
  let maxLengthCm = 0;
  let maxWidthCm = 0;
  let stackedHeightCm = 0;

  for (const item of items) {
    const dims = productPackageDimensions(item.product);
    totalWeightKg += dims.weightKg * item.quantity;
    maxLengthCm = Math.max(maxLengthCm, dims.lengthCm);
    maxWidthCm = Math.max(maxWidthCm, dims.widthCm);
    stackedHeightCm += dims.heightCm * item.quantity;
  }

  return {
    weightKg: Math.round(totalWeightKg * 100) / 100,
    lengthCm: maxLengthCm,
    widthCm: maxWidthCm,
    heightCm: Math.max(stackedHeightCm, DEFAULT_PACKAGE_HEIGHT_CM)
  };
}

/** UPS dimensional weight (cm + kg, divisor 5000). */
export function dimensionalWeightKg(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor = 5000
) {
  return Math.round(((lengthCm * widthCm * heightCm) / divisor) * 100) / 100;
}

export function billableWeightKg(packageDims: PackageDimensions, divisor = 5000) {
  const volumetric = dimensionalWeightKg(
    packageDims.lengthCm,
    packageDims.widthCm,
    packageDims.heightCm,
    divisor
  );
  return Math.max(packageDims.weightKg, volumetric, 0.5);
}
