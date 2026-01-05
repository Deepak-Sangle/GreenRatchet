/*
  Warnings:

  - The values [TARGET_RANGE] on the enum `KpiDirection` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAFT,ACTIVE,PAUSED,EXPIRED] on the enum `KpiStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [INTENSITY,SCORE] on the enum `KpiValueType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `observationEnd` on the `MarginRatchet` table. All the data in the column will be lost.
  - You are about to drop the column `observationFrequency` on the `MarginRatchet` table. All the data in the column will be lost.
  - You are about to drop the column `observationStart` on the `MarginRatchet` table. All the data in the column will be lost.
  - You are about to drop the column `targetValue` on the `MarginRatchet` table. All the data in the column will be lost.
  - You are about to drop the column `thresholdMax` on the `MarginRatchet` table. All the data in the column will be lost.
  - You are about to drop the column `thresholdMin` on the `MarginRatchet` table. All the data in the column will be lost.
  - Added the required column `type` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `frequency` on the `KPI` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "KpiType" AS ENUM ('CO2_EMISSION', 'AI_COMPUTE_HOURS');

-- AlterEnum
BEGIN;
CREATE TYPE "KpiDirection_new" AS ENUM ('LOWER_IS_BETTER', 'HIGHER_IS_BETTER');
ALTER TABLE "KPI" ALTER COLUMN "direction" TYPE "KpiDirection_new" USING ("direction"::text::"KpiDirection_new");
ALTER TYPE "KpiDirection" RENAME TO "KpiDirection_old";
ALTER TYPE "KpiDirection_new" RENAME TO "KpiDirection";
DROP TYPE "public"."KpiDirection_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "KpiStatus_new" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED');
ALTER TABLE "KPI" ALTER COLUMN "status" TYPE "KpiStatus_new" USING ("status"::text::"KpiStatus_new");
ALTER TYPE "KpiStatus" RENAME TO "KpiStatus_old";
ALTER TYPE "KpiStatus_new" RENAME TO "KpiStatus";
DROP TYPE "public"."KpiStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "KpiValueType_new" AS ENUM ('ABSOLUTE', 'PERCENTAGE');
ALTER TABLE "KPI" ALTER COLUMN "valueType" TYPE "KpiValueType_new" USING ("valueType"::text::"KpiValueType_new");
ALTER TYPE "KpiValueType" RENAME TO "KpiValueType_old";
ALTER TYPE "KpiValueType_new" RENAME TO "KpiValueType";
DROP TYPE "public"."KpiValueType_old";
COMMIT;

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "category",
ADD COLUMN     "type" "KpiType" NOT NULL,
DROP COLUMN "frequency",
ADD COLUMN     "frequency" "ObservationPeriod" NOT NULL;

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "MarginRatchet" DROP COLUMN "observationEnd",
DROP COLUMN "observationFrequency",
DROP COLUMN "observationStart",
DROP COLUMN "targetValue",
DROP COLUMN "thresholdMax",
DROP COLUMN "thresholdMin";

-- DropEnum
DROP TYPE "KpiCategory";

-- DropEnum
DROP TYPE "KpiFrequency";

-- DropEnum
DROP TYPE "LoanStatus";
