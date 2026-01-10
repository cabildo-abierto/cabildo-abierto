-- AlterTable
ALTER TABLE "Reference" ADD COLUMN     "referencingContentCreatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
