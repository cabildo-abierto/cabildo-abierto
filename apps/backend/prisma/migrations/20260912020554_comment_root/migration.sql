-- Add the column nullable so existing comments can be backfilled safely.
ALTER TABLE "comment" ADD COLUMN "root_id" TEXT;

-- Existing comments currently reply directly to their root block version.
UPDATE "comment"
SET "root_id" = "reply_to_id"
WHERE "root_id" IS NULL;

ALTER TABLE "comment" ALTER COLUMN "root_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
