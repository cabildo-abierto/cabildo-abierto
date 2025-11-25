/*
  Warnings:

  - Added the required column `followId` to the `FollowingFeedIndex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rootId` to the `FollowingFeedIndex` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FollowingFeedIndex" ADD COLUMN     "followId" TEXT NOT NULL,
ADD COLUMN     "rootId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_rootId_idx" ON "FollowingFeedIndex"("rootId");

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_followId_idx" ON "FollowingFeedIndex"("followId");

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_followId_fkey" FOREIGN KEY ("followId") REFERENCES "Reaction"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;
