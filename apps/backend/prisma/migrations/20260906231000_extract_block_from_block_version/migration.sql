BEGIN;

-- Block identity and type are no longer versioned. Create the stable block table
-- before changing block_version so the existing type assignments can be retained.
CREATE TABLE "block" (
    "topic_id" TEXT NOT NULL,
    "block_number" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,

    CONSTRAINT "block_pkey" PRIMARY KEY ("topic_id", "block_number")
);

INSERT INTO "block" ("topic_id", "block_number", "type_id")
SELECT "topic_id", "block_number", "type_id"
FROM "block_version";

-- Replace the old direct topic/type relationships with the composite block
-- relationship. The former unique index is no longer valid because a block may
-- now have multiple versions.
ALTER TABLE "block_version" DROP CONSTRAINT "block_version_topic_id_fkey";
ALTER TABLE "block_version" DROP CONSTRAINT "block_version_type_id_fkey";
DROP INDEX "block_version_topic_id_block_number_key";
ALTER TABLE "block_version" DROP COLUMN "type_id";

-- Records are global; topic ownership is defined by the concrete record subtype.
ALTER TABLE "record" DROP CONSTRAINT "record_topic_id_fkey";
ALTER TABLE "record" DROP COLUMN "topic_id";

CREATE INDEX "block_version_topic_id_block_number_idx"
ON "block_version"("topic_id", "block_number");

ALTER TABLE "block_version"
ADD CONSTRAINT "block_version_topic_id_block_number_fkey"
FOREIGN KEY ("topic_id", "block_number")
REFERENCES "block"("topic_id", "block_number")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "block"
ADD CONSTRAINT "block_type_id_fkey"
FOREIGN KEY ("type_id") REFERENCES "block_type"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "block"
ADD CONSTRAINT "block_topic_id_fkey"
FOREIGN KEY ("topic_id") REFERENCES "topic"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
