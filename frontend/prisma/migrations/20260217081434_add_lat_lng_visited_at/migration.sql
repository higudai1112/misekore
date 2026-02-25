-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserShop" ADD COLUMN     "visitedAt" TIMESTAMP(3);
