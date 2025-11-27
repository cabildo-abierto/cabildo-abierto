-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_rootId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;
