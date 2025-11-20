/*
  Warnings:

  - The values [ArCabildoAbiertoFeedArticle] on the enum `Collection` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Collection_new" AS ENUM ('ArCabildoabiertoFeedArticle', 'AppBskyFeedPost', 'AppBskyFeedRepost');
ALTER TABLE "FollowingFeedIndex" ALTER COLUMN "collection" TYPE "Collection_new" USING ("collection"::text::"Collection_new");
ALTER TYPE "Collection" RENAME TO "Collection_old";
ALTER TYPE "Collection_new" RENAME TO "Collection";
DROP TYPE "public"."Collection_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;
