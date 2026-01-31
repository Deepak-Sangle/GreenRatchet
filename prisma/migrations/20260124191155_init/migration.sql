-- CreateEnum
CREATE TYPE "CloudProvider" AS ENUM ('AWS', 'GCP', 'AZURE');

-- CreateEnum
CREATE TYPE "KPIResultStatus" AS ENUM ('PASSED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "CloudServiceSource" AS ENUM ('OPERATIONAL_METRICS', 'EMBODIED_METRICS');

-- CreateEnum
CREATE TYPE "ObservationPeriod" AS ENUM ('ANNUAL', 'QUARTERLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "KpiType" AS ENUM ('CO2_EMISSION', 'AI_COMPUTE_HOURS', 'LOW_CARBON_REGION_PERCENTAGE', 'CARBON_FREE_ENERGY_PERCENTAGE', 'ELECTRICITY_MIX_BREAKDOWN', 'RENEWABLE_ENERGY_PERCENTAGE', 'ENERGY_CONSUMPTION', 'WATER_WITHDRAWAL', 'GHG_INTENSITY', 'WATER_STRESSED_REGION_PERCENTAGE');

-- CreateEnum
CREATE TYPE "KpiDirection" AS ENUM ('LOWER_IS_BETTER', 'HIGHER_IS_BETTER');

-- CreateEnum
CREATE TYPE "KpiStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CloudFootprintType" AS ENUM ('OPERATIONAL_METRICS', 'EMBODIED_METRICS');

-- CreateEnum
CREATE TYPE "ElectricityMapsProvider" AS ENUM ('AWS', 'AZURE', 'GCP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" "UserRole" NOT NULL,
    "organizationId" TEXT,
    "lastLoginAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatarUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoUrl" TEXT,
    "headquarters" TEXT,
    "linkedinUrl" TEXT,
    "annualRevenue" DOUBLE PRECISION,
    "employeeCount" INTEGER,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "baselineValue" DOUBLE PRECISION,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "direction" "KpiDirection" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "thresholdMax" DOUBLE PRECISION,
    "thresholdMin" DOUBLE PRECISION,
    "status" "KpiStatus" NOT NULL,
    "type" "KpiType" NOT NULL,
    "frequency" "ObservationPeriod" NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIResult" (
    "id" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "status" "KPIResultStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudConnection" (
    "id" TEXT NOT NULL,
    "provider" "CloudProvider" NOT NULL,
    "roleArn" TEXT,
    "externalId" TEXT,
    "serviceAccountKey" TEXT,
    "projectId" TEXT,
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT,

    CONSTRAINT "CloudConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudFootprint" (
    "id" TEXT NOT NULL,
    "cloudConnectionId" TEXT NOT NULL,
    "cloudProvider" TEXT NOT NULL,
    "kilowattHours" DOUBLE PRECISION,
    "co2e" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "serviceName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3) NOT NULL,
    "type" "CloudFootprintType" NOT NULL DEFAULT 'OPERATIONAL_METRICS',
    "serviceType" TEXT,

    CONSTRAINT "CloudFootprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "userId" TEXT,
    "kpiId" TEXT,
    "kpiResultId" TEXT,
    "cloudConnectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GridCarbonFreeEnergy" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "dataCenterRegion" TEXT NOT NULL,
    "dataCenterProvider" "ElectricityMapsProvider" NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isEstimated" BOOLEAN NOT NULL,
    "apiUpdatedAt" TIMESTAMP(3) NOT NULL,
    "apiCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimationMethod" TEXT,
    "temporalGranularity" TEXT,

    CONSTRAINT "GridCarbonFreeEnergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GridRenewableEnergy" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "dataCenterRegion" TEXT NOT NULL,
    "dataCenterProvider" "ElectricityMapsProvider" NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "isEstimated" BOOLEAN NOT NULL,
    "apiUpdatedAt" TIMESTAMP(3) NOT NULL,
    "apiCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimationMethod" TEXT,
    "temporalGranularity" TEXT,

    CONSTRAINT "GridRenewableEnergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GridCarbonIntensity" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "dataCenterRegion" TEXT NOT NULL,
    "dataCenterProvider" "ElectricityMapsProvider" NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "emissionFactorType" TEXT NOT NULL,
    "isEstimated" BOOLEAN NOT NULL,
    "apiUpdatedAt" TIMESTAMP(3) NOT NULL,
    "apiCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimationMethod" TEXT,
    "temporalGranularity" TEXT,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GridCarbonIntensity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GridCarbonIntensityFossilOnly" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "dataCenterRegion" TEXT NOT NULL,
    "dataCenterProvider" "ElectricityMapsProvider" NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "emissionFactorType" TEXT NOT NULL,
    "isEstimated" BOOLEAN NOT NULL,
    "estimationMethod" TEXT,
    "temporalGranularity" TEXT,
    "apiUpdatedAt" TIMESTAMP(3) NOT NULL,
    "apiCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GridCarbonIntensityFossilOnly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GridElectricityMix" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "dataCenterRegion" TEXT NOT NULL,
    "dataCenterProvider" "ElectricityMapsProvider" NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "nuclear" DOUBLE PRECISION NOT NULL,
    "geothermal" DOUBLE PRECISION NOT NULL,
    "biomass" DOUBLE PRECISION NOT NULL,
    "coal" DOUBLE PRECISION NOT NULL,
    "wind" DOUBLE PRECISION NOT NULL,
    "solar" DOUBLE PRECISION NOT NULL,
    "hydro" DOUBLE PRECISION NOT NULL,
    "gas" DOUBLE PRECISION NOT NULL,
    "oil" DOUBLE PRECISION NOT NULL,
    "unknown" DOUBLE PRECISION NOT NULL,
    "hydroDischarge" DOUBLE PRECISION NOT NULL,
    "batteryDischarge" DOUBLE PRECISION NOT NULL,
    "isEstimated" BOOLEAN NOT NULL,
    "apiUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimationMethod" TEXT,
    "temporalGranularity" TEXT,

    CONSTRAINT "GridElectricityMix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "CloudFootprint_cloudConnectionId_idx" ON "CloudFootprint"("cloudConnectionId");

-- CreateIndex
CREATE INDEX "CloudFootprint_periodStartDate_periodEndDate_idx" ON "CloudFootprint"("periodStartDate", "periodEndDate");

-- CreateIndex
CREATE INDEX "CloudFootprint_serviceName_idx" ON "CloudFootprint"("serviceName");

-- CreateIndex
CREATE INDEX "GridCarbonFreeEnergy_dataCenterRegion_dataCenterProvider_idx" ON "GridCarbonFreeEnergy"("dataCenterRegion", "dataCenterProvider");

-- CreateIndex
CREATE INDEX "GridCarbonFreeEnergy_datetime_idx" ON "GridCarbonFreeEnergy"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "GridCarbonFreeEnergy_dataCenterRegion_dataCenterProvider_da_key" ON "GridCarbonFreeEnergy"("dataCenterRegion", "dataCenterProvider", "datetime");

-- CreateIndex
CREATE INDEX "GridRenewableEnergy_dataCenterRegion_dataCenterProvider_idx" ON "GridRenewableEnergy"("dataCenterRegion", "dataCenterProvider");

-- CreateIndex
CREATE INDEX "GridRenewableEnergy_datetime_idx" ON "GridRenewableEnergy"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "GridRenewableEnergy_dataCenterRegion_dataCenterProvider_dat_key" ON "GridRenewableEnergy"("dataCenterRegion", "dataCenterProvider", "datetime");

-- CreateIndex
CREATE INDEX "GridCarbonIntensity_dataCenterRegion_dataCenterProvider_idx" ON "GridCarbonIntensity"("dataCenterRegion", "dataCenterProvider");

-- CreateIndex
CREATE INDEX "GridCarbonIntensity_datetime_idx" ON "GridCarbonIntensity"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "GridCarbonIntensity_dataCenterRegion_dataCenterProvider_dat_key" ON "GridCarbonIntensity"("dataCenterRegion", "dataCenterProvider", "datetime");

-- CreateIndex
CREATE INDEX "GridCarbonIntensityFossilOnly_dataCenterRegion_dataCenterPr_idx" ON "GridCarbonIntensityFossilOnly"("dataCenterRegion", "dataCenterProvider");

-- CreateIndex
CREATE INDEX "GridCarbonIntensityFossilOnly_datetime_idx" ON "GridCarbonIntensityFossilOnly"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "GridCarbonIntensityFossilOnly_dataCenterRegion_dataCenterPr_key" ON "GridCarbonIntensityFossilOnly"("dataCenterRegion", "dataCenterProvider", "datetime");

-- CreateIndex
CREATE INDEX "GridElectricityMix_dataCenterRegion_dataCenterProvider_idx" ON "GridElectricityMix"("dataCenterRegion", "dataCenterProvider");

-- CreateIndex
CREATE INDEX "GridElectricityMix_datetime_idx" ON "GridElectricityMix"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "GridElectricityMix_dataCenterRegion_dataCenterProvider_date_key" ON "GridElectricityMix"("dataCenterRegion", "dataCenterProvider", "datetime");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIResult" ADD CONSTRAINT "KPIResult_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudConnection" ADD CONSTRAINT "CloudConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudFootprint" ADD CONSTRAINT "CloudFootprint_cloudConnectionId_fkey" FOREIGN KEY ("cloudConnectionId") REFERENCES "CloudConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_cloudConnectionId_fkey" FOREIGN KEY ("cloudConnectionId") REFERENCES "CloudConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_kpiResultId_fkey" FOREIGN KEY ("kpiResultId") REFERENCES "KPIResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
