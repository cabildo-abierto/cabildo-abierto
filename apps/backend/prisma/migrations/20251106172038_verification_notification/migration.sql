-- AlterTable
ALTER TABLE "User" ADD COLUMN     "seenVerifiedNotification" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
