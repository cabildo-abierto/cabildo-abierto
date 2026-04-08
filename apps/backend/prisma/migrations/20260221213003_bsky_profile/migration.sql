/*
  Warnings:

  - A unique constraint covering the columns `[bskyProfileUri]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bskyProfileUri" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_bskyProfileUri_key" ON "User"("bskyProfileUri");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bskyProfileUri_fkey" FOREIGN KEY ("bskyProfileUri") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;
