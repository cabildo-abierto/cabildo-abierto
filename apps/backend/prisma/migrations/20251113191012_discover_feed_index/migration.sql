/*
  Warnings:

  - You are about to drop the `ContentToCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ContentToCategory" DROP CONSTRAINT "ContentToCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContentToCategory" DROP CONSTRAINT "ContentToCategory_contentId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- DropTable
DROP TABLE "public"."ContentToCategory";

-- CreateTable
CREATE TABLE "DiscoverFeedIndex" (
    "contentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DiscoverFeedIndex_pkey" PRIMARY KEY ("contentId","categoryId")
);

-- CreateIndex
CREATE INDEX "DiscoverFeedIndex_categoryId_created_at_idx" ON "DiscoverFeedIndex"("categoryId", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "DiscoverFeedIndex" ADD CONSTRAINT "DiscoverFeedIndex_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoverFeedIndex" ADD CONSTRAINT "DiscoverFeedIndex_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
