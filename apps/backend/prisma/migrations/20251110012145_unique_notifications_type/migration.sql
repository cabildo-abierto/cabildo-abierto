/*
  Warnings:

  - A unique constraint covering the columns `[causedByRecordId,userNotifiedId,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Notification_causedByRecordId_userNotifiedId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_causedByRecordId_userNotifiedId_type_key" ON "Notification"("causedByRecordId", "userNotifiedId", "type");
