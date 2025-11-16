-- DropIndex
DROP INDEX "public"."Topic_popularityScoreLastDay_idx";

-- DropIndex
DROP INDEX "public"."Topic_popularityScoreLastMonth_idx";

-- DropIndex
DROP INDEX "public"."Topic_popularityScoreLastWeek_idx";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastDay_lastEdit_idx" ON "public"."Topic"("popularityScoreLastDay" DESC, "lastEdit" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastMonth_lastEdit_idx" ON "public"."Topic"("popularityScoreLastMonth" DESC, "lastEdit" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastWeek_lastEdit_idx" ON "public"."Topic"("popularityScoreLastWeek" DESC, "lastEdit" DESC);
