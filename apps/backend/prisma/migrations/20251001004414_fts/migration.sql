/*
  Warnings:

  - You are about to drop the column `text_tsv` on the `Content` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."content_text_tsv_idx";

-- AlterTable
ALTER TABLE "public"."Content" DROP COLUMN "text_tsv";
