ALTER TEXT SEARCH CONFIGURATION public.spanish_simple_unaccent
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart
    WITH unaccent, simple;

UPDATE "Content"
SET text_tsv = to_tsvector('public.spanish_simple_unaccent', text)
WHERE text IS NOT NULL;