-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_readerId_rootId_created_at_idx" ON "FollowingFeedIndex"("readerId", "rootId", "created_at" DESC);

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_authorId_idx" ON "FollowingFeedIndex"("authorId");
