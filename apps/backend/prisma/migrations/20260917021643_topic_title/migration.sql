BEGIN;

-- Keep the conversion and its historical snapshots consistent with each other.
LOCK TABLE "topic", "edit", "topic_move", "topic_redirect", "comment", "block",
    "block_version", "record", "reaction", "topic_connection" IN ACCESS EXCLUSIVE MODE;

-- Decide which topics to remove before converting movements or adding initial edits.
CREATE TEMP TABLE topics_without_edits ON COMMIT DROP AS
SELECT topic.id FROM "topic"
WHERE NOT EXISTS (SELECT 1 FROM "edit" WHERE edit.topic_id = topic.id);

-- Include reactions to movements/comments and any nested reactions.
CREATE TEMP TABLE removed_topic_records ON COMMIT DROP AS
WITH RECURSIVE removed(id) AS (
    SELECT id FROM (
        SELECT topic_move.id FROM "topic_move" JOIN topics_without_edits t ON t.id = topic_move.topic_id
        UNION
        SELECT comment.id FROM "comment" JOIN topics_without_edits t ON t.id = comment.topic_id
    ) AS roots
    UNION
    SELECT reaction.id FROM "reaction"
    JOIN removed ON reaction.subject_id = removed.id OR reaction.reason_id = removed.id
)
SELECT id FROM removed;

DELETE FROM "reaction" WHERE id IN (SELECT id FROM removed_topic_records);
DELETE FROM "comment" WHERE topic_id IN (SELECT id FROM topics_without_edits);
DELETE FROM "block_version" WHERE topic_id IN (SELECT id FROM topics_without_edits);
DELETE FROM "block" WHERE topic_id IN (SELECT id FROM topics_without_edits);
DELETE FROM "topic_redirect" WHERE topic_id IN (SELECT id FROM topics_without_edits);
DELETE FROM "topic_connection" WHERE topic_id IN (SELECT id FROM topics_without_edits);
DELETE FROM "topic_move" WHERE topic_id IN (SELECT id FROM topics_without_edits);
DELETE FROM "record" WHERE id IN (SELECT id FROM removed_topic_records);
DELETE FROM "topic" WHERE id IN (SELECT id FROM topics_without_edits);

ALTER TABLE "edit" ADD COLUMN "title" TEXT;
ALTER TABLE "topic_redirect" ADD COLUMN "edit_id" TEXT;

-- Historical topics have no recorded creator. Attribute the imported initial
-- title to the author of their first edit, including logically deleted edits.
CREATE TEMP TABLE initial_title_edits ON COMMIT DROP AS
SELECT gen_random_uuid()::text AS id, topic.id AS topic_id,
       topic.original_title AS title, original.slug, first_edit.author_id,
       LEAST(first_edit.created_at, (
           SELECT min(record.created_at)
           FROM "topic_move" JOIN "record" ON record.id = topic_move.id
           WHERE topic_move.topic_id = topic.id
       )) - INTERVAL '1 microsecond' AS created_at
FROM "topic"
JOIN LATERAL (
    SELECT record.author_id, record.created_at
    FROM "edit" JOIN "record" ON record.id = edit.id
    WHERE edit.topic_id = topic.id
    ORDER BY record.created_at, record.id
    LIMIT 1
) AS first_edit ON true
JOIN "topic_redirect" AS original ON original.topic_id = topic.id AND original.topic_move_id IS NULL;

DO $$ BEGIN
    IF (SELECT count(*) FROM initial_title_edits) <> (SELECT count(*) FROM "topic") THEN
        RAISE EXCEPTION 'Every retained topic must have exactly one original alias';
    END IF;
END $$;

INSERT INTO "record" (id, type_id, author_id, created_at)
SELECT id, 'edit', author_id, created_at FROM initial_title_edits;

INSERT INTO "edit" (id, topic_id, title, message)
SELECT id, topic_id, title, 'Incorporación del título inicial histórico.' FROM initial_title_edits;

-- Preserve movement IDs so votes, comments, replies and deletion state survive.
INSERT INTO "edit" (id, topic_id, title, message)
SELECT id, topic_id, title, message FROM "topic_move";

UPDATE "record" SET type_id = 'edit'
WHERE id IN (SELECT id FROM "topic_move");

UPDATE "comment" SET edit_id = topic_move.id
FROM "topic_move"
WHERE comment.root_id = topic_move.id AND comment.topic_id = topic_move.topic_id;

UPDATE "topic_redirect" SET edit_id = topic_move_id WHERE topic_move_id IS NOT NULL;
UPDATE "topic_redirect" SET edit_id = initial.id
FROM initial_title_edits AS initial
WHERE topic_redirect.topic_id = initial.topic_id AND topic_redirect.topic_move_id IS NULL;

-- Retain the exact historical slug for each title while recalculating convergence.
CREATE TEMP TABLE title_edit_slugs ON COMMIT DROP AS
SELECT id, slug FROM initial_title_edits
UNION ALL
SELECT id, slug FROM "topic_move";

-- Match the application's rejection tree: a root rejection is active only when
-- every terminal reaction in its reply tree has even depth.
WITH RECURSIVE rejection_tree AS (
    SELECT reaction.id, reaction.subject_id AS edit_id, reaction.id AS root_reaction_id,
           reaction.subject_id, reaction.reason_id, 0 AS depth, ARRAY[reaction.id] AS path
    FROM "reaction" JOIN "edit" ON edit.id = reaction.subject_id
    WHERE reaction.type = 'reject' AND edit.title IS NOT NULL
    UNION ALL
    SELECT child.id, parent.edit_id, parent.root_reaction_id,
           child.subject_id, child.reason_id, parent.depth + 1, parent.path || child.id
    FROM rejection_tree AS parent
    JOIN "reaction" AS child ON child.subject_id = parent.reason_id AND child.type = 'reject'
    WHERE NOT child.id = ANY(parent.path)
), active_rejections AS (
    SELECT leaf.edit_id, leaf.root_reaction_id
    FROM rejection_tree AS leaf
    WHERE leaf.reason_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM rejection_tree AS child
        WHERE child.root_reaction_id = leaf.root_reaction_id AND child.subject_id = leaf.reason_id
    )
    GROUP BY leaf.edit_id, leaf.root_reaction_id
    HAVING bool_and(leaf.depth % 2 = 0)
), current_titles AS (
    SELECT DISTINCT ON (edit.topic_id) edit.topic_id, edit.title, title_edit_slugs.slug
    FROM "edit"
    JOIN "record" ON record.id = edit.id
    JOIN title_edit_slugs ON title_edit_slugs.id = edit.id
    WHERE edit.title IS NOT NULL AND record.deleted = false
      AND NOT EXISTS (SELECT 1 FROM active_rejections WHERE active_rejections.edit_id = edit.id)
    ORDER BY edit.topic_id, record.created_at DESC, record.id DESC
)
UPDATE "topic" SET title = current_titles.title, slug = current_titles.slug
FROM current_titles WHERE current_titles.topic_id = topic.id;

ALTER TABLE "topic_redirect" DROP CONSTRAINT "topic_redirect_topic_move_id_topic_id_fkey";
DROP INDEX "topic_redirect_topic_move_id_topic_id_idx";
DROP INDEX IF EXISTS "topic_redirect_original_topic_id_key";
ALTER TABLE "topic_redirect" DROP COLUMN "topic_move_id";
ALTER TABLE "topic_redirect" ALTER COLUMN "edit_id" SET NOT NULL;
CREATE INDEX "topic_redirect_edit_id_topic_id_idx" ON "topic_redirect"("edit_id", "topic_id");
ALTER TABLE "topic_redirect" ADD CONSTRAINT "topic_redirect_edit_id_topic_id_fkey"
FOREIGN KEY ("edit_id", "topic_id") REFERENCES "edit"("id", "topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TABLE "topic_move";
DELETE FROM "record_type" WHERE id = 'topic_move';
ALTER TABLE "topic" DROP COLUMN "original_title";

COMMIT;
