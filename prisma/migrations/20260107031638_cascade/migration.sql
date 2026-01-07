-- DropForeignKey
ALTER TABLE "CloudEmbodiedMetrics" DROP CONSTRAINT "CloudEmbodiedMetrics_cloudServiceId_fkey";

-- DropForeignKey
ALTER TABLE "CloudUsageData" DROP CONSTRAINT "CloudUsageData_cloudServiceId_fkey";

-- AddForeignKey
ALTER TABLE "CloudUsageData" ADD CONSTRAINT "CloudUsageData_cloudServiceId_fkey" FOREIGN KEY ("cloudServiceId") REFERENCES "CloudService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudEmbodiedMetrics" ADD CONSTRAINT "CloudEmbodiedMetrics_cloudServiceId_fkey" FOREIGN KEY ("cloudServiceId") REFERENCES "CloudService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
