-- CreateEnum
CREATE TYPE "SalonGender" AS ENUM ('MASCULINE', 'FEMININE', 'UNISEX');

-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "city" TEXT NOT NULL DEFAULT 'Caraguatatuba',
ADD COLUMN     "gender" "SalonGender" NOT NULL DEFAULT 'UNISEX';
