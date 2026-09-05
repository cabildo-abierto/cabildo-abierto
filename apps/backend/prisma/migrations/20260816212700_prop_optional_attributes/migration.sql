/*
  Warnings:

  - You are about to drop the column `topicCategoryId` on the `TopicProp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TopicProp" DROP CONSTRAINT "TopicProp_topicCategoryId_fkey";

-- AlterTable
ALTER TABLE "TopicProp" DROP COLUMN "topicCategoryId",
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;
