-- Migration to set up Full-Text Search (FTS) for the "Content" table.
-- This enables fast, language-aware searching on the "text" column.

-- Step 1: Ensure the 'unaccent' extension is enabled.
-- This module provides a function to remove accents from text.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Step 2: Create a custom text search configuration for Spanish with unaccent.
-- This tells PostgreSQL how to parse text: by removing accents first,
-- then by finding the Spanish stem of the word.
-- NOTE: This part is not idempotent. If it fails, it's likely because it already exists, which is safe to ignore.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'public.spanish_unaccent') THEN
        CREATE TEXT SEARCH CONFIGURATION public.spanish_unaccent ( COPY = pg_catalog.spanish );
        ALTER TEXT SEARCH CONFIGURATION public.spanish_unaccent
            ALTER MAPPING FOR hword, hword_part, word
            WITH unaccent, spanish_stem;
END IF;
END;
$$;


-- Step 3: Add a new 'tsvector' column to the "Content" table.
-- This column will store the pre-processed text for fast searching.
-- Using 'IF NOT EXISTS' makes this operation safe to re-run.
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "text_tsv" tsvector;

-- Step 4: Create a trigger function that will automatically update the 'text_tsv' column.
-- This function runs whenever a row is inserted or its 'text' field is updated.
CREATE OR REPLACE FUNCTION content_text_tsv_trigger() RETURNS trigger AS $$
begin
  new.text_tsv := to_tsvector('public.spanish_unaccent', new.text);
return new;
end
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger on the "Content" table.
-- This connects the function to the table, ensuring it fires on INSERT or UPDATE events.
-- We drop it first to ensure we are using the latest version of the function.
DROP TRIGGER IF EXISTS tsvectorupdate ON "Content";
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
                                                   ON "Content" FOR EACH ROW EXECUTE PROCEDURE content_text_tsv_trigger();

-- Step 6: Create a GIN index on the new 'text_tsv' column.
-- A GIN (Generalized Inverted Index) is specifically designed for FTS and
-- makes searching incredibly fast.
CREATE INDEX IF NOT EXISTS "content_text_tsv_idx" ON "Content" USING GIN ("text_tsv");

-- Step 7: Backfill the 'text_tsv' column for all existing content.
-- This is a crucial one-time operation to make sure all your current data is searchable.
-- The "WHERE text_tsv IS NULL" clause makes it safe to re-run, as it will only
-- update rows that haven't been processed yet.
UPDATE "Content"
SET text_tsv = to_tsvector('public.spanish_unaccent', text)
WHERE text_tsv IS NULL;