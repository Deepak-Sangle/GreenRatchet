-- CreateTable
CREATE TABLE "CloudEmbodiedMetrics" (
    "id" TEXT NOT NULL,
    "cloudServiceId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "region" TEXT NOT NULL,
    "instanceType" TEXT,
    "serviceName" TEXT NOT NULL,
    "usageType" TEXT,
    "instanceHours" DOUBLE PRECISION,
    "storageGBHours" DOUBLE PRECISION,
    "requestCount" DOUBLE PRECISION,
    "dataTransferGB" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "unblendedCost" DOUBLE PRECISION,
    "additionalMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudEmbodiedMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CloudEmbodiedMetrics_cloudServiceId_periodStart_periodEnd_idx" ON "CloudEmbodiedMetrics"("cloudServiceId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "CloudEmbodiedMetrics_serviceName_region_periodStart_idx" ON "CloudEmbodiedMetrics"("serviceName", "region", "periodStart");

-- AddForeignKey
ALTER TABLE "CloudEmbodiedMetrics" ADD CONSTRAINT "CloudEmbodiedMetrics_cloudServiceId_fkey" FOREIGN KEY ("cloudServiceId") REFERENCES "CloudService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
