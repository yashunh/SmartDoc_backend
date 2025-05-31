/*
  Warnings:

  - Added the required column `appointmentId` to the `Vital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vital" ADD COLUMN     "appointmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Vital" ADD CONSTRAINT "Vital_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
