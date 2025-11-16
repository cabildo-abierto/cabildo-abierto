-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "editedAt" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
