-- Preserve the selected version even when convergence marks a block as deleted.
-- Serialize with search mutations and full index rebuilds during the backfill.
SELECT pg_advisory_xact_lock(194827, 2);

ALTER TABLE public.search_reference
    ADD COLUMN is_selected boolean NOT NULL DEFAULT false,
    ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;

WITH candidates AS (
    SELECT v.id, v.topic_id, v.block_number, v.edit_id, v.deleted, r.created_at
    FROM public.block_version v JOIN public.record r ON r.id = v.edit_id
    WHERE NOT r.deleted
), tree AS (
WITH RECURSIVE reject_tree AS (
            SELECT reaction.id,
                   reaction.subject_id AS "recordId",
                   reaction.id AS "rootReactionId",
                   reaction.subject_id AS "subjectId",
                   reaction.reason_id AS "reasonId",
                   0::int AS depth,
                   ARRAY[reaction.id] AS path
            FROM reaction
            WHERE reaction.type = 'reject'
              AND reaction.subject_id IN (SELECT DISTINCT edit_id FROM candidates)
            UNION ALL
            SELECT child.id,
                   reject_tree."recordId",
                   reject_tree."rootReactionId",
                   child.subject_id,
                   child.reason_id,
                   reject_tree.depth + 1,
                   reject_tree.path || child.id
            FROM reject_tree
            INNER JOIN reaction AS child
                ON child.subject_id = reject_tree."reasonId"
               AND child.type = 'reject'
            WHERE NOT child.id = ANY(reject_tree.path)
        )
        SELECT id, "recordId", "rootReactionId", "subjectId", "reasonId", depth
        FROM reject_tree
), rejected AS (
    SELECT DISTINCT root."recordId" AS edit_id FROM tree root
    WHERE root.depth = 0 AND NOT EXISTS (
        SELECT 1 FROM tree leaf
        WHERE leaf."rootReactionId" = root."rootReactionId" AND leaf.depth % 2 = 1
            AND (leaf."reasonId" IS NULL OR NOT EXISTS (
                SELECT 1 FROM tree child WHERE child."rootReactionId" = root."rootReactionId"
                    AND child."subjectId" = leaf."reasonId"
            ))
    )
), selected AS (
    SELECT DISTINCT ON (c.topic_id, c.block_number) c.id,
        (c.deleted OR r.edit_id IS NOT NULL) AS deleted
    FROM candidates c LEFT JOIN rejected r ON r.edit_id = c.edit_id
    ORDER BY c.topic_id, c.block_number, (r.edit_id IS NOT NULL), c.created_at DESC, c.edit_id DESC
)
UPDATE public.search_reference r SET is_selected = true, is_deleted = s.deleted
FROM selected s WHERE r.block_version_id = s.id;

CREATE INDEX search_reference_selected_idx ON public.search_reference(topic_id, block_version_id) WHERE is_selected;
