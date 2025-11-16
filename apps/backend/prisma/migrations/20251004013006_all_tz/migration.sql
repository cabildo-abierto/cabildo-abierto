-- AlterTable
ALTER TABLE "public"."AccessRequest" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3),
ADD COLUMN     "sentInviteAt_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Donation" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Draft" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3),
ADD COLUMN     "lastUpdate_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."InviteCode" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3),
ADD COLUMN     "usedAt_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Meeting" ADD COLUMN     "date_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."PaymentPromise" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."ReadSession" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "CAIndexedAt_tz" TIMESTAMPTZ(3),
ADD COLUMN     "lastUpdatedAt_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Reference" ADD COLUMN     "touched_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Timestamps" ADD COLUMN     "date_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."Topic" ADD COLUMN     "lastContentChange_tz" TIMESTAMPTZ(3),
ADD COLUMN     "lastEdit_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3),
ADD COLUMN     "lastSeenNotifications_tz" TIMESTAMPTZ(3) DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "public"."UserMonth" ADD COLUMN     "monthEnd_tz" TIMESTAMPTZ(3),
ADD COLUMN     "monthStart_tz" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "public"."ValidationRequest" ADD COLUMN     "created_at_tz" TIMESTAMPTZ(3);
