-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "ContentToCategory_contentId_categoryId_idx" ON "ContentToCategory"("contentId", "categoryId");

-- CreateIndex
CREATE INDEX "Reference_referencingContentId_referencedTopicId_idx" ON "Reference"("referencingContentId", "referencedTopicId");
