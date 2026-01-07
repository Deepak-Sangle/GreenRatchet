/*
  Warnings:

  - Added the required column `periodEnd` to the `CloudUsageData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `CloudUsageData` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns as nullable
ALTER TABLE "CloudUsageData" ADD COLUMN "periodStart" TIMESTAMP(3);
ALTER TABLE "CloudUsageData" ADD COLUMN "periodEnd" TIMESTAMP(3);

-- Step 2: Set default values for existing rows based on createdAt
-- Assuming hourly collection: periodStart = createdAt - 1 hour, periodEnd = createdAt
UPDATE "CloudUsageData" 
SET 
  "periodStart" = "createdAt" - INTERVAL '1 hour',
  "periodEnd" = "createdAt"
WHERE "periodStart" IS NULL OR "periodEnd" IS NULL;

-- Step 3: Make columns required (NOT NULL)
ALTER TABLE "CloudUsageData" ALTER COLUMN "periodStart" SET NOT NULL;
ALTER TABLE "CloudUsageData" ALTER COLUMN "periodEnd" SET NOT NULL;

-- Step 4: CreateIndex
CREATE INDEX "CloudUsageData_cloudServiceId_periodStart_periodEnd_idx" ON "CloudUsageData"("cloudServiceId", "periodStart", "periodEnd");
