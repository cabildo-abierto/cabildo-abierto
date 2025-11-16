-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "quoteToCid" TEXT,
ADD COLUMN     "replyToCid" TEXT,
ADD COLUMN     "rootCid" TEXT;

-- AlterTable
ALTER TABLE "public"."Reaction" ADD COLUMN     "subjectCid" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
