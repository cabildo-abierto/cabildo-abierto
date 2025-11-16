-- DropIndex
DROP INDEX "public"."AssignedPayment_contentId_userMonthId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
