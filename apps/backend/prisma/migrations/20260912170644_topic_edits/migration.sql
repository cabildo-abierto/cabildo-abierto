BEGIN;

-- An edit is the record that owns one or more block snapshots. Preserve the
-- existing reorder rows by renaming their table in place.
ALTER TABLE "block_reorder" RENAME TO "edit";
ALTER TABLE "edit" RENAME CONSTRAINT "block_reorder_pkey" TO "edit_pkey";
ALTER TABLE "edit" RENAME CONSTRAINT "block_reorder_id_fkey" TO "edit_id_fkey";
ALTER TABLE "edit" RENAME CONSTRAINT "block_reorder_topic_id_fkey" TO "edit_topic_id_fkey";
ALTER INDEX "block_reorder_topic_id_idx" RENAME TO "edit_topic_id_idx";

INSERT INTO "record_type" ("id", "name") VALUES ('edit', 'Edición')
ON CONFLICT ("id") DO NOTHING;

UPDATE "record" SET "type_id" = 'edit'
WHERE "type_id" IN ('block', 'block_reorder');

DELETE FROM "record_type" WHERE "id" IN ('block', 'block_reorder');

ALTER TABLE "block_version" DROP CONSTRAINT "block_version_id_fkey";
ALTER TABLE "block_version" ADD COLUMN "edit_id" TEXT;
ALTER TABLE "block_version" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "comment" ADD COLUMN "block_number" TEXT;

-- Reuse each historical block record as a one-block edit, preserving its
-- author, timestamp, identifier and references.
INSERT INTO "edit" ("id", "topic_id", "permutation")
SELECT "id", "topic_id", '[]'::jsonb FROM "block_version";

UPDATE "block_version" SET "edit_id" = "id";

-- Existing roots now identify edits; retain the block half of the pair. Follow
-- reply ancestry as well so comments created before root_id existed are safe.
WITH RECURSIVE ancestors AS (
    SELECT comment."id" AS comment_id, comment."root_id" AS ancestor_id, 0 AS depth
    FROM "comment"
    UNION ALL
    SELECT ancestors.comment_id, parent."reply_to_id", ancestors.depth + 1
    FROM ancestors
    INNER JOIN "comment" AS parent ON parent."id" = ancestors.ancestor_id
    WHERE ancestors.depth < 100
), resolved_roots AS (
    SELECT DISTINCT ON (ancestors.comment_id)
        ancestors.comment_id,
        block_version."id" AS edit_id,
        block_version."block_number"
    FROM ancestors
    INNER JOIN "block_version" ON "block_version"."id" = ancestors.ancestor_id
    ORDER BY ancestors.comment_id, ancestors.depth
)
UPDATE "comment"
SET "root_id" = resolved_roots.edit_id,
    "block_number" = resolved_roots."block_number"
FROM resolved_roots
WHERE "comment"."id" = resolved_roots.comment_id;

-- Complete old snapshots with the latest order that preceded each one.
UPDATE "block_version" AS version
SET "order" = COALESCE((
    SELECT item.value->>'order'
    FROM "edit" AS reordered_edit
    INNER JOIN "record" AS reorder_record ON reorder_record."id" = reordered_edit."id"
    CROSS JOIN LATERAL jsonb_array_elements(reordered_edit."permutation") AS item(value)
    WHERE reordered_edit."topic_id" = version."topic_id"
      AND item.value->>'blockNumber' = version."block_number"
      AND (reorder_record."created_at", reorder_record."id")
          <= (version_record."created_at", version_record."id")
    ORDER BY reorder_record."created_at" DESC, reorder_record."id" DESC
    LIMIT 1
), version."order")
FROM "record" AS version_record
WHERE version_record."id" = version."id";

UPDATE "block_version" SET "content" = '' WHERE "content" IS NULL;
ALTER TABLE "block_version" ALTER COLUMN "content" SET NOT NULL;

-- Expand each historical reorder only for blocks whose order changed. Every
-- inserted version is still a complete snapshot of that block (content and
-- order), but unrelated blocks are not attached to the edit.
DO $$
DECLARE
    reordered_edit RECORD;
    item RECORD;
    previous_content TEXT;
    previous_order TEXT;
BEGIN
    FOR reordered_edit IN
        SELECT edit."id", edit."topic_id", edit."permutation",
               record."created_at", record."id" AS record_id
        FROM "edit" AS edit
        INNER JOIN "record" AS record ON record."id" = edit."id"
        WHERE jsonb_array_length(edit."permutation") > 0
        ORDER BY record."created_at", record."id"
    LOOP
        FOR item IN
            SELECT value->>'blockNumber' AS block_number,
                   value->>'order' AS block_order
            FROM jsonb_array_elements(reordered_edit."permutation") AS value
        LOOP
            SELECT version."content", version."order"
            INTO previous_content, previous_order
            FROM "block_version" AS version
            INNER JOIN "record" AS version_record ON version_record."id" = version."edit_id"
            WHERE version."topic_id" = reordered_edit."topic_id"
              AND version."block_number" = item.block_number
              AND (version_record."created_at", version_record."id")
                  < (reordered_edit."created_at", reordered_edit.record_id)
            ORDER BY version_record."created_at" DESC, version_record."id" DESC
            LIMIT 1;

            IF FOUND AND previous_order IS DISTINCT FROM item.block_order THEN
                INSERT INTO "block_version" (
                    "id", "topic_id", "block_number", "content", "order", "edit_id", "deleted"
                ) VALUES (
                    reordered_edit."id" || ':' || item.block_number,
                    reordered_edit."topic_id",
                    item.block_number,
                    previous_content,
                    item.block_order,
                    reordered_edit."id",
                    false
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;

ALTER TABLE "edit" DROP COLUMN "permutation";
ALTER TABLE "block_version" ALTER COLUMN "edit_id" SET NOT NULL;
ALTER TABLE "comment" ALTER COLUMN "block_number" SET NOT NULL;

CREATE UNIQUE INDEX "edit_id_topic_id_key" ON "edit"("id", "topic_id");
CREATE UNIQUE INDEX "block_version_edit_id_block_number_key"
ON "block_version"("edit_id", "block_number");

ALTER TABLE "block_version"
ADD CONSTRAINT "block_version_edit_id_topic_id_fkey"
FOREIGN KEY ("edit_id", "topic_id") REFERENCES "edit"("id", "topic_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comment"
ADD CONSTRAINT "comment_root_id_topic_id_fkey"
FOREIGN KEY ("root_id", "topic_id") REFERENCES "edit"("id", "topic_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comment"
ADD CONSTRAINT "comment_block_number_topic_id_fkey"
FOREIGN KEY ("block_number", "topic_id") REFERENCES "block"("block_number", "topic_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
