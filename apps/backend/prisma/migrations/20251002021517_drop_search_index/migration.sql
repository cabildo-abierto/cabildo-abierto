-- AlterTable
ALTER TABLE "public"."Reference" ALTER COLUMN "touched" DROP DEFAULT;

DROP INDEX IF EXISTS "content_text_search_idx";