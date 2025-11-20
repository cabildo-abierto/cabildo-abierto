-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_repostedContentId_fkey";

-- AlterTable
ALTER TABLE "FollowingFeedIndex" ALTER COLUMN "repostedContentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_repostedContentId_fkey" FOREIGN KEY ("repostedContentId") REFERENCES "Content"("uri") ON DELETE SET NULL ON UPDATE CASCADE;
