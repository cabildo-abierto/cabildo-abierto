-- AlterEnum
ALTER TYPE "ModerationMethod" ADD VALUE 'Automatic';

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
