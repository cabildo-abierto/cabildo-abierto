-- CreateTable
CREATE TABLE "SearchableContent" (
                                     "uri" TEXT NOT NULL,
                                     "text" TEXT NOT NULL,
                                     "collection" TEXT NOT NULL,
                                     "created_at" TIMESTAMPTZ(3) NOT NULL,

                                     CONSTRAINT "SearchableContent_pkey" PRIMARY KEY ("uri")
);

-- Foreign key
ALTER TABLE "SearchableContent"
    ADD CONSTRAINT "SearchableContent_uri_fkey"
        FOREIGN KEY ("uri")
            REFERENCES "Content"("uri")
            ON DELETE CASCADE
            ON UPDATE CASCADE;

-- Extensions + config
CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_ts_config c
                     JOIN pg_namespace n ON n.oid = c.cfgnamespace
            WHERE c.cfgname = 'spanish_unaccent'
              AND n.nspname = 'public'
        ) THEN
            CREATE TEXT SEARCH CONFIGURATION public.spanish_unaccent
                ( COPY = pg_catalog.spanish );

            ALTER TEXT SEARCH CONFIGURATION public.spanish_unaccent
                ALTER MAPPING FOR hword, hword_part, word
                    WITH unaccent, spanish_stem;
        END IF;
    END;
$$;

-- Stored tsvector
ALTER TABLE "SearchableContent"
    ADD COLUMN "text_tsv" tsvector
        GENERATED ALWAYS AS (
            to_tsvector('public.spanish_unaccent', coalesce(text, ''))
            ) STORED;
