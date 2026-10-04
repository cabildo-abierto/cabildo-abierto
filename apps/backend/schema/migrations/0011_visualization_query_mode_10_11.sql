ALTER TABLE public.visualization ADD COLUMN query_mode text NOT NULL DEFAULT 'auto'
    CHECK (query_mode IN ('auto', 'custom'));
ALTER TABLE public.visualization ALTER COLUMN query_mode DROP DEFAULT;
