/*
  Warnings:

  - You are about to drop the column `topicId` on the `TopicInteraction` table. All the data in the column will be lost.
  - You are about to drop the column `touched` on the `TopicInteraction` table. All the data in the column will be lost.
  - You are about to drop the `_ReferenceToTopicInteraction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[recordId,referenceId]` on the table `TopicInteraction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceId` to the `TopicInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TopicInteraction" DROP CONSTRAINT "TopicInteraction_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ReferenceToTopicInteraction" DROP CONSTRAINT "_ReferenceToTopicInteraction_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ReferenceToTopicInteraction" DROP CONSTRAINT "_ReferenceToTopicInteraction_B_fkey";

-- DropIndex
DROP INDEX "public"."TopicInteraction_recordId_topicId_key";

-- AlterTable
ALTER TABLE "public"."TopicInteraction" DROP COLUMN "topicId",
DROP COLUMN "touched",
ADD COLUMN     "referenceId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_ReferenceToTopicInteraction";

-- CreateIndex
CREATE UNIQUE INDEX "TopicInteraction_recordId_referenceId_key" ON "public"."TopicInteraction"("recordId", "referenceId");

-- AddForeignKey
ALTER TABLE "public"."TopicInteraction" ADD CONSTRAINT "TopicInteraction_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."Reference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
