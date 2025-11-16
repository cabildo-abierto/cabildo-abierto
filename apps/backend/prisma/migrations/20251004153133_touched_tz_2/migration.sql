-- AlterTable
ALTER TABLE "public"."TopicInteraction" ALTER COLUMN "touched" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
