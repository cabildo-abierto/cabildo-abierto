-- Rename the table in place to preserve all existing block versions.
ALTER TABLE "block" RENAME TO "block_version";

-- Keep database object names aligned with the new physical table name.
ALTER TABLE "block_version" RENAME CONSTRAINT "block_pkey" TO "block_version_pkey";
ALTER INDEX "block_topic_id_block_number_key" RENAME TO "block_version_topic_id_block_number_key";
ALTER TABLE "block_version" RENAME CONSTRAINT "block_topic_id_fkey" TO "block_version_topic_id_fkey";
ALTER TABLE "block_version" RENAME CONSTRAINT "block_id_fkey" TO "block_version_id_fkey";
ALTER TABLE "block_version" RENAME CONSTRAINT "block_type_id_fkey" TO "block_version_type_id_fkey";
