/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Vital` table. All the data in the column will be lost.
  - Added the required column `doctorId` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `Vital` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Medication" DROP CONSTRAINT "Medication_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Vital" DROP CONSTRAINT "Vital_createdBy_fkey";

-- AlterTable
ALTER TABLE "Medication" DROP COLUMN "createdBy",
ADD COLUMN     "doctorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "createdBy",
ADD COLUMN     "doctorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "createdBy",
ADD COLUMN     "doctorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vital" DROP COLUMN "createdBy",
ADD COLUMN     "doctorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vital" ADD CONSTRAINT "Vital_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
