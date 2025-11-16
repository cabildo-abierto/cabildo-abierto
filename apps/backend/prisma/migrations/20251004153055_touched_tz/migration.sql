-- AlterTable
ALTER TABLE "public"."TopicInteraction" ADD COLUMN     "touched_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
