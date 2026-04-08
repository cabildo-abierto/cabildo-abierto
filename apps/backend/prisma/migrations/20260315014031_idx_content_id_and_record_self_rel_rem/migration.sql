-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_uri_fkey";

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_contentId_idx" ON "FollowingFeedIndex"("contentId");
