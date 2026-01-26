-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "caFollowersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "caFollowingCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
