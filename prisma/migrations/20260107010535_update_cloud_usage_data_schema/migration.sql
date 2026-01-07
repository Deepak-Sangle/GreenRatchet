/*
  Warnings:

  - You are about to drop the column `networkIn` on the `CloudUsageData` table. All the data in the column will be lost.
  - You are about to drop the column `networkOut` on the `CloudUsageData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CloudUsageData" DROP COLUMN "networkIn",
DROP COLUMN "networkOut",
ADD COLUMN     "network" DOUBLE PRECISION,
ADD COLUMN     "storageBytes" DOUBLE PRECISION,
ADD COLUMN     "storageClass" TEXT;
