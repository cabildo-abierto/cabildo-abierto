/*
  Warnings:

  - You are about to drop the column `categories` on the `TopicVersion` table. All the data in the column will be lost.
  - You are about to drop the column `props` on the `TopicVersion` table. All the data in the column will be lost.
  - You are about to drop the `CategoryLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscoverFeedIndex` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FollowingFeedIndex` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopicToCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInterest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `TopicCategory` table without a default value. This is not possible if the table is not empty.

*/
DROP TRIGGER IF EXISTS topic_version_synonyms_update_trigger ON "TopicVersion";

-- DropForeignKey
ALTER TABLE "CategoryLink" DROP CONSTRAINT "CategoryLink_idCategoryA_fkey";

-- DropForeignKey
ALTER TABLE "CategoryLink" DROP CONSTRAINT "CategoryLink_idCategoryB_fkey";

-- DropForeignKey
ALTER TABLE "DiscoverFeedIndex" DROP CONSTRAINT "DiscoverFeedIndex_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "DiscoverFeedIndex" DROP CONSTRAINT "DiscoverFeedIndex_contentId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_authorId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_contentId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_readerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_repostedContentId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingFeedIndex" DROP CONSTRAINT "FollowingFeedIndex_rootId_fkey";

-- DropForeignKey
ALTER TABLE "TopicToCategory" DROP CONSTRAINT "TopicToCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TopicToCategory" DROP CONSTRAINT "TopicToCategory_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserInterest" DROP CONSTRAINT "UserInterest_topicCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserInterest" DROP CONSTRAINT "UserInterest_userId_fkey";

-- AlterTable
ALTER TABLE "TopicCategory" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TopicVersion" DROP COLUMN "categories",
DROP COLUMN "props";

-- DropTable
DROP TABLE "CategoryLink";

-- DropTable
DROP TABLE "DiscoverFeedIndex";

-- DropTable
DROP TABLE "FollowingFeedIndex";

-- DropTable
DROP TABLE "TopicToCategory";

-- DropTable
DROP TABLE "UserInterest";

-- CreateTable
CREATE TABLE "TopicProp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "topicCategoryId" TEXT,

    CONSTRAINT "TopicProp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicPropValue" (
    "topicVersionUri" TEXT NOT NULL,
    "propId" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "TopicPropValue_pkey" PRIMARY KEY ("topicVersionUri","propId")
);

-- CreateTable
CREATE TABLE "TopicVersionCategory" (
    "topicVersionUri" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "TopicVersionCategory_pkey" PRIMARY KEY ("topicVersionUri","categoryId")
);

-- CreateTable
CREATE TABLE "TopicCategoryProp" (
    "categoryId" TEXT NOT NULL,
    "propId" TEXT NOT NULL,
    "topicCategoryId" TEXT NOT NULL,

    CONSTRAINT "TopicCategoryProp_pkey" PRIMARY KEY ("categoryId","propId")
);

-- CreateTable
CREATE TABLE "_TopicCategoryToTopicVersion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TopicCategoryToTopicVersion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TopicCategoryToTopicVersion_B_index" ON "_TopicCategoryToTopicVersion"("B");

-- AddForeignKey
ALTER TABLE "TopicProp" ADD CONSTRAINT "TopicProp_id_fkey" FOREIGN KEY ("id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProp" ADD CONSTRAINT "TopicProp_topicCategoryId_fkey" FOREIGN KEY ("topicCategoryId") REFERENCES "TopicCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPropValue" ADD CONSTRAINT "TopicPropValue_topicVersionUri_fkey" FOREIGN KEY ("topicVersionUri") REFERENCES "TopicVersion"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPropValue" ADD CONSTRAINT "TopicPropValue_propId_fkey" FOREIGN KEY ("propId") REFERENCES "TopicProp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCategory" ADD CONSTRAINT "TopicCategory_id_fkey" FOREIGN KEY ("id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersionCategory" ADD CONSTRAINT "TopicVersionCategory_topicVersionUri_fkey" FOREIGN KEY ("topicVersionUri") REFERENCES "TopicVersion"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersionCategory" ADD CONSTRAINT "TopicVersionCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCategoryProp" ADD CONSTRAINT "TopicCategoryProp_topicCategoryId_fkey" FOREIGN KEY ("topicCategoryId") REFERENCES "TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCategoryProp" ADD CONSTRAINT "TopicCategoryProp_propId_fkey" FOREIGN KEY ("propId") REFERENCES "TopicProp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicCategoryToTopicVersion" ADD CONSTRAINT "_TopicCategoryToTopicVersion_A_fkey" FOREIGN KEY ("A") REFERENCES "TopicCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicCategoryToTopicVersion" ADD CONSTRAINT "_TopicCategoryToTopicVersion_B_fkey" FOREIGN KEY ("B") REFERENCES "TopicVersion"("uri") ON DELETE CASCADE ON UPDATE CASCADE;