/*
  Warnings:

  - Made the column `createdAt` on table `Record` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "trustedCreatedAt" TIMESTAMPTZ(3),
ALTER COLUMN "createdAt" SET NOT NULL;
