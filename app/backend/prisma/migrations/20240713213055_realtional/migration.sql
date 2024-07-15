/*
  Warnings:

  - You are about to drop the column `discount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discountEnd` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discountStart` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `pricePer` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `PriceHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[priceId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unit` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "discount",
DROP COLUMN "discountEnd",
DROP COLUMN "discountStart",
DROP COLUMN "price",
DROP COLUMN "pricePer",
ADD COLUMN     "priceId" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- DropTable
DROP TABLE "PriceHistory";

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" TEXT NOT NULL,
    "pricePer" TEXT NOT NULL,
    "discountPercent" TEXT,
    "discountStart" TIMESTAMP(3),
    "discountEnd" TIMESTAMP(3),

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_priceId_key" ON "Product"("priceId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
