-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "Content_created_at_tz_idx" ON "public"."Content"("created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Record_authorId_collection_created_at_tz_idx" ON "public"."Record"("authorId", "collection", "created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Record_authorId_created_at_tz_idx" ON "public"."Record"("authorId", "created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Record_collection_authorId_created_at_tz_idx" ON "public"."Record"("collection", "authorId", "created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Record_collection_created_at_tz_idx" ON "public"."Record"("collection", "created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Record_created_at_tz_idx" ON "public"."Record"("created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "User_created_at_tz_idx" ON "public"."User"("created_at_tz");
