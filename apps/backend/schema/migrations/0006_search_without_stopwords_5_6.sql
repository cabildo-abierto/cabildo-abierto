CREATE TEXT SEARCH DICTIONARY public.search_spanish_all_stem (
    TEMPLATE = pg_catalog.snowball,
    Language = spanish
);
CREATE TEXT SEARCH CONFIGURATION public.search_spanish_all (COPY = public.search_spanish);
ALTER TEXT SEARCH CONFIGURATION public.search_spanish_all
    ALTER MAPPING REPLACE pg_catalog.spanish_stem WITH public.search_spanish_all_stem;
ALTER TABLE public.search_entry
    ALTER COLUMN search_config SET DEFAULT 'public.search_spanish_all'::regconfig;

-- Existing entries keep their original search vectors until search:reindex runs.
