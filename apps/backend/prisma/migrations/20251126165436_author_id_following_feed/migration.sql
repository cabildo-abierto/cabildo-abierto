/*
  Warnings:

  - You are about to drop the column `followId` on the `FollowingFeedIndex` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `FollowingFeedIndex` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_followId_fkey";

-- DropIndex
DROP INDEX "FollowingFeedIndex_followId_idx";

-- AlterTable
ALTER TABLE "FollowingFeedIndex" DROP COLUMN "followId",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;
