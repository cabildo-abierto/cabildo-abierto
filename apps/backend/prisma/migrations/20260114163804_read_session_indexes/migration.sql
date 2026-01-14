-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "ReadSession_userId_created_at_tz_idx" ON "ReadSession"("userId", "created_at_tz");

-- CreateIndex
CREATE INDEX "ReadSession_created_at_tz_idx" ON "ReadSession"("created_at_tz");
