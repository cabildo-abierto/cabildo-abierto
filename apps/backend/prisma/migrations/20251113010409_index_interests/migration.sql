/*
  Warnings:

  - A unique constraint covering the columns `[userId,topicCategoryId]` on the table `UserInterest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");

-- CreateIndex
CREATE INDEX "UserInterest_topicCategoryId_idx" ON "UserInterest"("topicCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_topicCategoryId_key" ON "UserInterest"("userId", "topicCategoryId");
