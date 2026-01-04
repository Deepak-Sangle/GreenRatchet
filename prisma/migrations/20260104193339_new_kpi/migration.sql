/*
  Warnings:

  - You are about to drop the column `definition` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `marginImpactBps` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `metricFormula` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `observationPeriod` on the `KPI` table. All the data in the column will be lost.
  - You are about to alter the column `targetValue` on the `KPI` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `baselineValue` on the `KPI` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `marginRatchetBps` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `observationPeriod` on the `Loan` table. All the data in the column will be lost.
  - The `currency` column on the `Loan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `calculationMethod` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataSources` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `effectiveFrom` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueType` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `KPI` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `committedAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drawnAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maturityDate` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `principalAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('FIXED_RATE', 'FLOATING_RATE', 'AMORTIZED', 'ANNUITY', 'BALLOON', 'CREDIT_LINE', 'REVOLVING_CREDIT_LINE', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "LoanCurrency" AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF');

-- CreateEnum
CREATE TYPE "ObservationPeriod" AS ENUM ('ANNUAL', 'QUARTERLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "KpiCategory" AS ENUM ('ENVIRONMENTAL', 'OPERATIONAL', 'GOVERNANCE');

-- CreateEnum
CREATE TYPE "KpiValueType" AS ENUM ('ABSOLUTE', 'INTENSITY', 'PERCENTAGE', 'SCORE');

-- CreateEnum
CREATE TYPE "KpiDirection" AS ENUM ('LOWER_IS_BETTER', 'HIGHER_IS_BETTER', 'TARGET_RANGE');

-- CreateEnum
CREATE TYPE "KpiFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "KpiStatus" AS ENUM ('DRAFT', 'PROPOSED', 'ACCEPTED', 'ACTIVE', 'PAUSED', 'EXPIRED');

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "definition",
DROP COLUMN "marginImpactBps",
DROP COLUMN "metricFormula",
DROP COLUMN "observationPeriod",
ADD COLUMN     "calculationMethod" JSONB NOT NULL,
ADD COLUMN     "category" "KpiCategory" NOT NULL,
ADD COLUMN     "dataSources" JSONB NOT NULL,
ADD COLUMN     "direction" "KpiDirection" NOT NULL,
ADD COLUMN     "effectiveFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "effectiveTo" TIMESTAMP(3),
ADD COLUMN     "frequency" "KpiFrequency" NOT NULL,
ADD COLUMN     "thresholdMax" DECIMAL(65,30),
ADD COLUMN     "thresholdMin" DECIMAL(65,30),
ADD COLUMN     "valueType" "KpiValueType" NOT NULL,
ALTER COLUMN "targetValue" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "baselineValue" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" "KpiStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "marginRatchetBps",
DROP COLUMN "observationPeriod",
ADD COLUMN     "committedAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdByUserId" TEXT NOT NULL,
ADD COLUMN     "drawnAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maturityDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "principalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "type" "LoanType" NOT NULL DEFAULT 'FIXED_RATE',
DROP COLUMN "currency",
ADD COLUMN     "currency" "LoanCurrency" NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "MarginRatchet" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "observationFrequency" "ObservationPeriod" NOT NULL,
    "observationStart" TIMESTAMP(3) NOT NULL,
    "observationEnd" TIMESTAMP(3),
    "targetValue" DECIMAL(65,30) NOT NULL,
    "thresholdMin" DECIMAL(65,30),
    "thresholdMax" DECIMAL(65,30),
    "stepUpBps" INTEGER NOT NULL,
    "stepDownBps" INTEGER NOT NULL,
    "maxAdjustmentBps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarginRatchet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginRatchet" ADD CONSTRAINT "MarginRatchet_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginRatchet" ADD CONSTRAINT "MarginRatchet_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
