CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
AS $$
SELECT public.unaccent($1);
$$;

CREATE TEXT SEARCH CONFIGURATION public.spanish_simple_unaccent
    ( COPY = pg_catalog.spanish );

ALTER TEXT SEARCH CONFIGURATION public.spanish_simple_unaccent
    ALTER MAPPING FOR
              hword,
          hword_part,
          word,
          asciiword,
          asciihword,
          hword_asciipart
              WITH unaccent, simple;