/*
  Warnings:

  - You are about to drop the column `created_at` on the `AccessRequest` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `AccessRequest` table. All the data in the column will be lost.
  - You are about to drop the column `sentInviteAt_tz` on the `AccessRequest` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `AssignedPayment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `DiscoverFeedIndex` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Draft` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `Draft` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdate_tz` on the `Draft` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `EmailSent` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `FollowingFeedIndex` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `InviteCode` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `InviteCode` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt_tz` on the `InviteCode` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `date_tz` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ModerationAction` table. All the data in the column will be lost.
  - You are about to drop the column `date_end` on the `ModerationAction` table. All the data in the column will be lost.
  - You are about to drop the column `date_start` on the `ModerationAction` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `PaymentPromise` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `PaymentPromise` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ReadSession` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `ReadSession` table. All the data in the column will be lost.
  - You are about to drop the column `CAIndexedAt` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `CAIndexedAt_tz` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdatedAt_tz` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `RecordModerationProcess` table. All the data in the column will be lost.
  - You are about to drop the column `processed_at` on the `RecordModerationProcess` table. All the data in the column will be lost.
  - You are about to drop the column `touched_tz` on the `Reference` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `SearchableContent` table. All the data in the column will be lost.
  - You are about to drop the column `date_tz` on the `Timestamps` table. All the data in the column will be lost.
  - You are about to drop the column `lastEdit_tz` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `touched_tz` on the `TopicInteraction` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `ValidationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `created_at_tz` on the `ValidationRequest` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `DiscoverFeedIndex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `FollowingFeedIndex` table without a default value. This is not possible if the table is not empty.
  - Made the column `date` on table `Meeting` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `createdAt` to the `SearchableContent` table without a default value. This is not possible if the table is not empty.

*/
-- Drop old trigger that referenced Record.created_at_tz/Content.created_at_tz.
DROP TRIGGER IF EXISTS record_after_insert_or_update_sync_content_timestamp ON "Record";
DROP FUNCTION IF EXISTS sync_content_created_at_tz_from_record();
DROP FUNCTION IF EXISTS sync_content_createdAt_from_record();

-- DropIndex
DROP INDEX "Content_created_at_tz_idx";

-- DropIndex
DROP INDEX "Content_interactionsScore_created_at_tz_idx";

-- DropIndex
DROP INDEX "Content_likesScore_created_at_tz_idx";

-- DropIndex
DROP INDEX "Content_relativePopularityScore_created_at_tz_idx";

-- DropIndex
DROP INDEX "DiscoverFeedIndex_categoryId_created_at_idx";

-- DropIndex
DROP INDEX "FollowingFeedIndex_readerId_collection_authorInCA_created_a_idx";

-- DropIndex
DROP INDEX "FollowingFeedIndex_readerId_created_at_idx";

-- DropIndex
DROP INDEX "FollowingFeedIndex_readerId_rootId_created_at_idx";

-- DropIndex
DROP INDEX "ReadSession_created_at_tz_idx";

-- DropIndex
DROP INDEX "ReadSession_userId_created_at_tz_idx";

-- DropIndex
DROP INDEX "Record_authorId_collection_created_at_tz_idx";

-- DropIndex
DROP INDEX "Record_authorId_created_at_tz_idx";

-- DropIndex
DROP INDEX "Record_collection_authorId_created_at_tz_idx";

-- DropIndex
DROP INDEX "Record_collection_created_at_tz_idx";

-- DropIndex
DROP INDEX "Record_created_at_tz_idx";

-- DropIndex
DROP INDEX "SearchableContent_collection_created_at_idx";

-- DropIndex
DROP INDEX "SearchableContent_created_at_idx";

-- DropIndex
DROP INDEX "Topic_lastEdit_tz_idx";

-- DropIndex
DROP INDEX "Topic_popularityScoreLastDay_lastEdit_tz_idx";

-- DropIndex
DROP INDEX "Topic_popularityScoreLastMonth_lastEdit_tz_idx";

-- DropIndex
DROP INDEX "Topic_popularityScoreLastWeek_lastEdit_tz_idx";

-- DropIndex
DROP INDEX "User_created_at_tz_idx";

-- AlterTable
ALTER TABLE "AccessRequest" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
DROP COLUMN "sentInviteAt_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "sentInviteAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "AssignedPayment" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DiscoverFeedIndex" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Draft" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
DROP COLUMN "lastUpdate_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastUpdate" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "EmailSent" DROP COLUMN "sent_at",
ADD COLUMN     "sentAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "FollowingFeedIndex" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "InviteCode" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
DROP COLUMN "usedAt_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "usedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "date_tz",
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "ModerationAction" DROP COLUMN "created_at",
DROP COLUMN "date_end",
DROP COLUMN "date_start",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateEnd" TIMESTAMPTZ(3),
ADD COLUMN     "dateStart" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PaymentPromise" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ReadSession" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "CAIndexedAt",
DROP COLUMN "CAIndexedAt_tz",
DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
DROP COLUMN "lastUpdatedAt_tz",
ADD COLUMN     "caIndexedAt" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastUpdatedAt" DROP NOT NULL,
ALTER COLUMN "lastUpdatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "RecordModerationProcess" DROP COLUMN "created_at",
DROP COLUMN "processed_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "processedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Reference" DROP COLUMN "touched_tz",
ALTER COLUMN "touched" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "SearchableContent" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "Timestamps" DROP COLUMN "date_tz",
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "lastEdit_tz",
ALTER COLUMN "lastEdit" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "TopicInteraction" DROP COLUMN "touched_tz",
ALTER COLUMN "touched" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ValidationRequest" DROP COLUMN "created_at",
DROP COLUMN "created_at_tz",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Content_createdAt_idx" ON "Content"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Content_interactionsScore_createdAt_idx" ON "Content"("interactionsScore" DESC, "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Content_likesScore_createdAt_idx" ON "Content"("likesScore" DESC, "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Content_relativePopularityScore_createdAt_idx" ON "Content"("relativePopularityScore" DESC, "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DiscoverFeedIndex_categoryId_createdAt_idx" ON "DiscoverFeedIndex"("categoryId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_readerId_collection_authorInCA_createdAt_idx" ON "FollowingFeedIndex"("readerId", "collection", "authorInCA", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_readerId_rootId_createdAt_idx" ON "FollowingFeedIndex"("readerId", "rootId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FollowingFeedIndex_readerId_createdAt_idx" ON "FollowingFeedIndex"("readerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReadSession_userId_createdAt_idx" ON "ReadSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReadSession_createdAt_idx" ON "ReadSession"("createdAt");

-- CreateIndex
CREATE INDEX "Record_authorId_collection_createdAt_idx" ON "Record"("authorId", "collection", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Record_authorId_createdAt_idx" ON "Record"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Record_collection_authorId_createdAt_idx" ON "Record"("collection", "authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Record_collection_createdAt_idx" ON "Record"("collection", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Record_createdAt_idx" ON "Record"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "SearchableContent_collection_createdAt_idx" ON "SearchableContent"("collection", "createdAt");

-- CreateIndex
CREATE INDEX "SearchableContent_createdAt_idx" ON "SearchableContent"("createdAt");

-- CreateIndex
CREATE INDEX "Topic_lastEdit_idx" ON "Topic"("lastEdit" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastDay_lastEdit_idx" ON "Topic"("popularityScoreLastDay" DESC, "lastEdit" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastMonth_lastEdit_idx" ON "Topic"("popularityScoreLastMonth" DESC, "lastEdit" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastWeek_lastEdit_idx" ON "Topic"("popularityScoreLastWeek" DESC, "lastEdit" DESC);

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- Recreate the Record -> Content timestamp sync trigger for the renamed fields.
CREATE OR REPLACE FUNCTION sync_content_createdAt_from_record()
RETURNS TRIGGER AS $$
BEGIN
UPDATE "Content"
SET "createdAt" = NEW."createdAt"
WHERE "uri" = NEW."uri";

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_after_insert_or_update_sync_content_timestamp
    AFTER INSERT OR UPDATE ON "Record"
    FOR EACH ROW
    EXECUTE FUNCTION sync_content_createdAt_from_record();
