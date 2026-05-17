/*
  Warnings:

  - You are about to drop the column `isChallenge` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "isChallenge";

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "reasonId" TEXT;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "Comment"("uri") ON DELETE SET NULL ON UPDATE CASCADE;
