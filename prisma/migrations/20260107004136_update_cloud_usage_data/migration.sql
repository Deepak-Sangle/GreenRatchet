-- CreateTable
CREATE TABLE "CloudService" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "additionalData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cloudConnectionId" TEXT NOT NULL,

    CONSTRAINT "CloudService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudUsageData" (
    "id" TEXT NOT NULL,
    "cloudServiceId" TEXT NOT NULL,
    "averageCpuLoad" DOUBLE PRECISION,
    "networkIn" DOUBLE PRECISION,
    "networkOut" DOUBLE PRECISION,
    "instanceType" TEXT,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudUsageData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CloudService" ADD CONSTRAINT "CloudService_cloudConnectionId_fkey" FOREIGN KEY ("cloudConnectionId") REFERENCES "CloudConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudUsageData" ADD CONSTRAINT "CloudUsageData_cloudServiceId_fkey" FOREIGN KEY ("cloudServiceId") REFERENCES "CloudService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
