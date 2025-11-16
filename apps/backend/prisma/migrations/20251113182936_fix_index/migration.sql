-- DropIndex
DROP INDEX "public"."ContentToCategory_contentId_categoryId_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "ContentToCategory_categoryId_contentId_idx" ON "ContentToCategory"("categoryId", "contentId");
