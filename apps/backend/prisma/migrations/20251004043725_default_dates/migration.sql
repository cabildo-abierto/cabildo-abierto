/*
  Warnings:

  - You are about to drop the column `lastContentChange` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `lastContentChange_tz` on the `Topic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Draft" ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastUpdate_tz" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."PaymentPromise" ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Reference" ALTER COLUMN "touched" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Topic" DROP COLUMN "lastContentChange",
DROP COLUMN "lastContentChange_tz";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "public"."ValidationRequest" ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP;
