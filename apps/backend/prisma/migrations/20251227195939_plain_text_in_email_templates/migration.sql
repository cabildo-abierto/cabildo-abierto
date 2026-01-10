/*
  Warnings:

  - Added the required column `text` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
