-- Backfill source identities without downloading or preparing any dataset.
ALTER TABLE public.dataset ADD COLUMN source_id text;

INSERT INTO public.dataset_source (id, file_id, source_url)
SELECT encode(sha256(convert_to(CASE WHEN d.file_id IS NOT NULL
    THEN 'file:' || d.file_id ELSE 'url:' || d.source_url END, 'UTF8')), 'hex'),
    d.file_id, d.source_url
FROM (SELECT DISTINCT file_id, source_url FROM public.dataset) d
WHERE NOT EXISTS (
    SELECT 1 FROM public.dataset_source s
    WHERE s.file_id = d.file_id OR s.source_url = d.source_url
)
ON CONFLICT (id) DO NOTHING;

UPDATE public.dataset d SET source_id = s.id
FROM public.dataset_source s
WHERE s.file_id = d.file_id OR s.source_url = d.source_url;

ALTER TABLE public.dataset ALTER COLUMN source_id SET NOT NULL;
ALTER TABLE public.dataset ADD CONSTRAINT dataset_source_id_fkey
    FOREIGN KEY (source_id) REFERENCES public.dataset_source(id) ON DELETE RESTRICT;
CREATE INDEX dataset_source_id_idx ON public.dataset(source_id);
CREATE INDEX dataset_source_file_id_idx ON public.dataset_source(file_id) WHERE file_id IS NOT NULL;
CREATE INDEX dataset_source_url_idx ON public.dataset_source USING hash(source_url) WHERE source_url IS NOT NULL;

ALTER TABLE public.dataset DROP CONSTRAINT dataset_source_check;
ALTER TABLE public.dataset DROP COLUMN file_id, DROP COLUMN source_url;
