-- DropIndex
DROP INDEX "Content_created_at_idx";

-- DropIndex
DROP INDEX "Content_interactionsScore_created_at_idx";

-- DropIndex
DROP INDEX "Content_likesScore_created_at_idx";

-- DropIndex
DROP INDEX "Content_relativePopularityScore_created_at_idx";

-- DropIndex
DROP INDEX "Record_authorId_collection_created_at_idx";

-- DropIndex
DROP INDEX "Record_authorId_created_at_idx";

-- DropIndex
DROP INDEX "Record_collection_authorId_created_at_idx";

-- DropIndex
DROP INDEX "Record_collection_created_at_idx";

-- DropIndex
DROP INDEX "Record_created_at_idx";

-- DropIndex
DROP INDEX "User_created_at_idx";

-- CreateIndex
CREATE INDEX "Content_interactionsScore_created_at_tz_idx" ON "Content"("interactionsScore" DESC, "created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Content_likesScore_created_at_tz_idx" ON "Content"("likesScore" DESC, "created_at_tz" DESC);

-- CreateIndex
CREATE INDEX "Content_relativePopularityScore_created_at_tz_idx" ON "Content"("relativePopularityScore" DESC, "created_at_tz" DESC);
