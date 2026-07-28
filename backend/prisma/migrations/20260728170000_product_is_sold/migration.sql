-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isSold" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isSold_isActive_idx" ON "Product"("isSold", "isActive");
