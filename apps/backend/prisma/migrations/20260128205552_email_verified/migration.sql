-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_repostedContentId_idx" ON "FollowingFeedIndex"("repostedContentId");

-- CreateIndex
CREATE INDEX "RecordModerationProcess_recordId_idx" ON "RecordModerationProcess"("recordId");

-- CreateIndex
CREATE INDEX "RecordModerationProcess_processedById_idx" ON "RecordModerationProcess"("processedById");
