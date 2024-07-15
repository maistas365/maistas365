/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shopName,productShopId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `price` on the `Price` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pricePer` on the `Price` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `productShopId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_productId_fkey";

-- AlterTable
ALTER TABLE "Price" ALTER COLUMN "productId" DROP NOT NULL,
DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
DROP COLUMN "pricePer",
ADD COLUMN     "pricePer" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productShopId" TEXT NOT NULL,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopName_productShopId_key" ON "Product"("shopName", "productShopId");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
