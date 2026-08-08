/*
  Warnings:

  - You are about to drop the column `lastSeenNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeenNotifications_tz` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" DROP NOT NULL,
ALTER COLUMN "referencingContentCreatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastSeenNotifications",
DROP COLUMN "lastSeenNotifications_tz";
