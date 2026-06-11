-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "gpostParcelTypeId" INTEGER,
ADD COLUMN     "parcelInternalCode" TEXT,
ADD COLUMN     "parcelRegisteredAt" TIMESTAMP(3),
ADD COLUMN     "parcelRegistrationError" TEXT,
ADD COLUMN     "parcelTrackingNumber" TEXT;

-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "deliveryCityId" TEXT;

-- CreateTable
CREATE TABLE "DeliveryCountry" (
    "id" TEXT NOT NULL,
    "gpostId" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameGe" TEXT,
    "abbr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryCity" (
    "id" TEXT NOT NULL,
    "gpostId" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameGe" TEXT,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryCity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryCountry_gpostId_key" ON "DeliveryCountry"("gpostId");

-- CreateIndex
CREATE INDEX "DeliveryCountry_abbr_idx" ON "DeliveryCountry"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryCity_gpostId_key" ON "DeliveryCity"("gpostId");

-- CreateIndex
CREATE INDEX "DeliveryCity_countryId_nameEn_idx" ON "DeliveryCity"("countryId", "nameEn");

-- CreateIndex
CREATE INDEX "ShippingAddress_deliveryCityId_idx" ON "ShippingAddress"("deliveryCityId");

-- AddForeignKey
ALTER TABLE "DeliveryCity" ADD CONSTRAINT "DeliveryCity_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "DeliveryCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_deliveryCityId_fkey" FOREIGN KEY ("deliveryCityId") REFERENCES "DeliveryCity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
