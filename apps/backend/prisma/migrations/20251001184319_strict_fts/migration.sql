BEGIN;

CREATE TEXT SEARCH CONFIGURATION public.spanish_simple_unaccent ( COPY = pg_catalog.spanish );

ALTER TEXT SEARCH CONFIGURATION public.spanish_simple_unaccent
    ALTER MAPPING FOR hword, hword_part, word
    WITH unaccent, simple;


DROP INDEX IF EXISTS "content_text_fts_idx";
DROP TRIGGER IF EXISTS tsvectorupdate ON "Content";
DROP FUNCTION IF EXISTS content_text_tsv_trigger();

CREATE OR REPLACE FUNCTION content_text_tsv_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.text IS NOT NULL THEN
    NEW.text_tsv := to_tsvector('public.spanish_simple_unaccent', NEW.text);
ELSE
    NEW.text_tsv := NULL;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER tsvectorupdate
    BEFORE INSERT OR UPDATE ON "Content"
                         FOR EACH ROW EXECUTE FUNCTION content_text_tsv_trigger();


CREATE INDEX "content_text_fts_idx" ON "Content" USING GIN ("text_tsv");

UPDATE "Content"
SET text_tsv = to_tsvector('public.spanish_simple_unaccent', text)
WHERE text IS NOT NULL;

COMMIT;