-- DropIndex
DROP INDEX "Reference_referencedTopicId_idx";

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "Reference_referencedTopicId_referencingContentCreatedAt_idx" ON "Reference"("referencedTopicId", "referencingContentCreatedAt" DESC);
