-- CreateEnum
CREATE TYPE "Collection" AS ENUM ('ArCabildoAbiertoFeedArticle', 'AppBskyFeedPost', 'AppBskyFeedRepost');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateTable
CREATE TABLE "FollowingFeedIndex" (
    "contentId" TEXT NOT NULL,
    "repostedContentId" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "collection" "Collection" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "authorInCA" BOOLEAN NOT NULL,

    CONSTRAINT "FollowingFeedIndex_pkey" PRIMARY KEY ("readerId","contentId")
);

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_readerId_collection_authorInCA_created_a_idx" ON "FollowingFeedIndex"("readerId", "collection", "authorInCA", "created_at" DESC);

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_readerId_created_at_idx" ON "FollowingFeedIndex"("readerId", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_repostedContentId_fkey" FOREIGN KEY ("repostedContentId") REFERENCES "Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowingFeedIndex" ADD CONSTRAINT "FollowingFeedIndex_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;
