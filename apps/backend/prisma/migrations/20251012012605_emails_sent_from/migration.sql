/*
  Warnings:

  - Added the required column `from` to the `EmailSent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailSent" ADD COLUMN     "from" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
