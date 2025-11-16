-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

CREATE INDEX idx_topic_version_title_fts
    ON "TopicVersion"
    USING GIN (
    to_tsvector('public.spanish_simple_unaccent',
    jsonb_path_query_first(props, '$[*] ? (@.name == "Título").value.value')
    )
);