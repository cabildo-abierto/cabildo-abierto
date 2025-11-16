/*
  Warnings:

  - You are about to drop the column `lastReferencesUpdate` on the `Content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "lastReferencesUpdate";

-- AlterTable
ALTER TABLE "public"."Donation" ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
