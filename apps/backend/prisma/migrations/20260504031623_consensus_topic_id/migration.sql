/*
  Warnings:

  - Added the required column `topicId` to the `Consensus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consensus" ADD COLUMN     "topicId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Consensus" ADD CONSTRAINT "Consensus_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
