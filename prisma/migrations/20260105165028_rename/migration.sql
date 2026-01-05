/*
  Warnings:

  - You are about to drop the column `unit` on the `KPI` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "KpiValueType" ADD VALUE 'RATIO';

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "unit";
