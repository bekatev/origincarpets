-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingProvider" TEXT DEFAULT 'ups',
ADD COLUMN     "billableWeightKg" DECIMAL(10,2),
ADD COLUMN     "packageLengthCm" INTEGER,
ADD COLUMN     "packageWidthCm" INTEGER,
ADD COLUMN     "packageHeightCm" INTEGER,
ADD COLUMN     "shipmentNotifiedAt" TIMESTAMP(3);
