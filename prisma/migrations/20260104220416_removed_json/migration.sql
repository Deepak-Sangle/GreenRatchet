/*
  Warnings:

  - You are about to drop the column `calculationMethod` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `dataSources` on the `KPI` table. All the data in the column will be lost.
  - You are about to alter the column `targetValue` on the `KPI` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `baselineValue` on the `KPI` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `thresholdMax` on the `KPI` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `thresholdMin` on the `KPI` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `calculationDetails` on the `KPIResult` table. All the data in the column will be lost.
  - You are about to drop the column `calculationVersion` on the `KPIResult` table. All the data in the column will be lost.
  - You are about to drop the column `dataSource` on the `KPIResult` table. All the data in the column will be lost.
  - You are about to alter the column `targetValue` on the `MarginRatchet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `thresholdMin` on the `MarginRatchet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `thresholdMax` on the `MarginRatchet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterEnum
ALTER TYPE "KpiStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "calculationMethod",
DROP COLUMN "dataSources",
ALTER COLUMN "targetValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "baselineValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "thresholdMax" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "thresholdMin" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "KPIResult" DROP COLUMN "calculationDetails",
DROP COLUMN "calculationVersion",
DROP COLUMN "dataSource";

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "currency" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MarginRatchet" ALTER COLUMN "targetValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "thresholdMin" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "thresholdMax" SET DATA TYPE DOUBLE PRECISION;

-- DropEnum
DROP TYPE "KPIStatus";
