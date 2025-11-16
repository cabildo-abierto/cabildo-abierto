DROP INDEX IF EXISTS "content_text_fts_idx";
DROP INDEX IF EXISTS "idx_content_text_trgm";
CREATE INDEX "content_text_fts_idx" ON "Content" USING GIN (to_tsvector('public.spanish_unaccent', text));