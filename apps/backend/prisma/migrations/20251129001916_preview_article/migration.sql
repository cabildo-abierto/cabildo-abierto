-- AlterTable
ALTER TABLE "Draft" ADD COLUMN     "description" TEXT,
ADD COLUMN     "previewImage" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
