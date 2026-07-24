-- AlterTable
ALTER TABLE "ShippingAddress" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "guestEmail" TEXT;

-- CreateIndex
CREATE INDEX "Order_guestEmail_createdAt_idx" ON "Order"("guestEmail", "createdAt");
