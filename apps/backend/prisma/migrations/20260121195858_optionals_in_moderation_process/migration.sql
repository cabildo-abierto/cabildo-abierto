-- DropForeignKey
ALTER TABLE "RecordModerationProcess" DROP CONSTRAINT "RecordModerationProcess_recordId_fkey";

-- AlterTable
ALTER TABLE "RecordModerationProcess" ALTER COLUMN "recordId" DROP NOT NULL,
ALTER COLUMN "method" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AddForeignKey
ALTER TABLE "RecordModerationProcess" ADD CONSTRAINT "RecordModerationProcess_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;
