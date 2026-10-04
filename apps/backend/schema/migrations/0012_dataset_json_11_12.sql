ALTER TABLE public.dataset_source
    ADD COLUMN source_format text NOT NULL DEFAULT 'csv' CHECK (source_format IN ('csv', 'json')),
    ADD COLUMN jq_filter text,
    ADD CONSTRAINT dataset_source_jq_check CHECK (
        jq_filter IS NULL OR (source_format = 'json' AND length(btrim(jq_filter)) > 0 AND length(jq_filter) <= 20000));
ALTER TABLE public.dataset_source ALTER COLUMN source_format DROP DEFAULT;

-- Include old search sources even when they no longer have a visible reference.
INSERT INTO public.dataset_source(id, file_id, source_url, source_format, jq_filter)
SELECT encode(sha256(convert_to(CASE WHEN kind = 'dataset_file' THEN 'file:' || file_id ELSE 'url:' || source_url END, 'UTF8')), 'hex'),
    CASE WHEN kind = 'dataset_file' THEN file_id END,
    CASE WHEN kind = 'dataset_url' THEN source_url END, 'csv', NULL
FROM public.search_source WHERE kind IN ('dataset_file', 'dataset_url')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.search_source ADD COLUMN dataset_source_id text REFERENCES public.dataset_source(id) ON DELETE CASCADE;
DO $$ DECLARE constraint_name text; BEGIN
    FOR constraint_name IN SELECT conname FROM pg_constraint
        WHERE conrelid = 'public.search_source'::regclass AND contype = 'c'
          AND (pg_get_constraintdef(oid) LIKE '%kind%' OR pg_get_constraintdef(oid) LIKE '%num_nonnulls%')
    LOOP EXECUTE format('ALTER TABLE public.search_source DROP CONSTRAINT %I', constraint_name); END LOOP;
END $$;
UPDATE public.search_source SET
    dataset_source_id = encode(sha256(convert_to(CASE WHEN kind = 'dataset_file' THEN 'file:' || file_id ELSE 'url:' || source_url END, 'UTF8')), 'hex'),
    kind = 'dataset', file_id = NULL
WHERE kind IN ('dataset_file', 'dataset_url');
ALTER TABLE public.search_source DROP COLUMN source_url;
ALTER TABLE public.search_source
    ADD CONSTRAINT search_source_kind_check CHECK (kind IN ('block_version', 'topic_title', 'comment', 'document_file', 'dataset')),
    ADD CONSTRAINT search_source_owner_count CHECK (num_nonnulls(block_version_id, title_edit_id, comment_id, file_id, dataset_source_id) = 1),
    ADD CONSTRAINT search_source_owner_kind CHECK (
        (kind = 'block_version' AND block_version_id IS NOT NULL)
        OR (kind = 'topic_title' AND title_edit_id IS NOT NULL)
        OR (kind = 'comment' AND comment_id IS NOT NULL)
        OR (kind = 'document_file' AND file_id IS NOT NULL)
        OR (kind = 'dataset' AND dataset_source_id IS NOT NULL)),
    ADD CONSTRAINT search_source_dataset_unique UNIQUE (dataset_source_id);
