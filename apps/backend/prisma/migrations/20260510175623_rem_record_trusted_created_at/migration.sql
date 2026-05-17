/*
  Warnings:

  - You are about to drop the column `trustedCreatedAt` on the `Record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "trustedCreatedAt",
ALTER COLUMN "createdAt" DROP NOT NULL;
