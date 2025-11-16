CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
    LANGUAGE sql IMMUTABLE
AS $$
SELECT public.unaccent($1);
$$;

ALTER FUNCTION public.immutable_unaccent(text) OWNER TO postgres;

CREATE INDEX idx_content_text_trgm
    ON "Content" USING GIN (lower(immutable_unaccent("text")) gin_trgm_ops);
