-- AlterTable
ALTER TABLE "TopicVersion" ADD COLUMN     "charsContribution" DOUBLE PRECISION,
ADD COLUMN     "monetizedContribution" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
