BEGIN;

ALTER TABLE "block_version" ADD COLUMN "order" TEXT;

-- Give each existing block a distinct key in creation order. Keys stay in the
-- middle of the alphabet and use a fixed-width base-24 suffix (b-y).
CREATE FUNCTION pg_temp.block_order_key(value BIGINT) RETURNS TEXT AS $$
DECLARE
    alphabet CONSTANT TEXT := 'bcdefghijklmnopqrstuvwxy';
    result TEXT := '';
    digit INTEGER;
BEGIN
    FOR position IN 1..6 LOOP
        digit := (value % 24)::INTEGER;
        result := substr(alphabet, digit + 1, 1) || result;
        value := value / 24;
    END LOOP;
    IF value > 0 THEN
        RAISE EXCEPTION 'Too many existing blocks to generate an order key';
    END IF;
    RETURN 'm' || result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

WITH first_versions AS (
    SELECT
        block_version.topic_id,
        block_version.block_number,
        MIN(record.created_at) AS created_at,
        MIN(record.id) AS record_id
    FROM block_version
    INNER JOIN record ON record.id = block_version.id
    GROUP BY block_version.topic_id, block_version.block_number
), ranked_blocks AS (
    SELECT
        topic_id,
        block_number,
        ROW_NUMBER() OVER (
            PARTITION BY topic_id
            ORDER BY created_at, record_id, block_number
        ) - 1 AS position
    FROM first_versions
)
UPDATE block_version
SET "order" = pg_temp.block_order_key(ranked_blocks.position)
FROM ranked_blocks
WHERE block_version.topic_id = ranked_blocks.topic_id
  AND block_version.block_number = ranked_blocks.block_number;

ALTER TABLE "block_version" ALTER COLUMN "order" SET NOT NULL;
ALTER TABLE "block_version" ADD CONSTRAINT "block_version_order_format_check"
CHECK ("order" ~ '^[a-z]+$' AND right("order", 1) <> 'a');

INSERT INTO "record_type" ("id", "name")
VALUES ('block_reorder', 'Reordenamiento de bloques');

CREATE TABLE "block_reorder" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "permutation" JSONB NOT NULL,
    CONSTRAINT "block_reorder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "block_reorder_topic_id_idx" ON "block_reorder"("topic_id");

ALTER TABLE "block_reorder"
ADD CONSTRAINT "block_reorder_topic_id_fkey"
FOREIGN KEY ("topic_id") REFERENCES "topic"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "block_reorder"
ADD CONSTRAINT "block_reorder_id_fkey"
FOREIGN KEY ("id") REFERENCES "record"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
