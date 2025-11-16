-- DropIndex
DROP INDEX "public"."Topic_lastEdit_idx";

-- DropIndex
DROP INDEX "public"."Topic_popularityScoreLastDay_lastEdit_idx";

-- DropIndex
DROP INDEX "public"."Topic_popularityScoreLastMonth_lastEdit_idx";

-- DropIndex
DROP INDEX "public"."Topic_popularityScoreLastWeek_lastEdit_idx";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "Topic_lastEdit_tz_idx" ON "public"."Topic"("lastEdit_tz" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastDay_lastEdit_tz_idx" ON "public"."Topic"("popularityScoreLastDay" DESC, "lastEdit_tz" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastMonth_lastEdit_tz_idx" ON "public"."Topic"("popularityScoreLastMonth" DESC, "lastEdit_tz" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastWeek_lastEdit_tz_idx" ON "public"."Topic"("popularityScoreLastWeek" DESC, "lastEdit_tz" DESC);
