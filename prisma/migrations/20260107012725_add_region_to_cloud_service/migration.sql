/*
  Warnings:

  - Added the required column `region` to the `CloudService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CloudService" ADD COLUMN     "region" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CloudService_cloudConnectionId_region_idx" ON "CloudService"("cloudConnectionId", "region");

-- CreateIndex
CREATE INDEX "CloudService_serviceName_region_idx" ON "CloudService"("serviceName", "region");
