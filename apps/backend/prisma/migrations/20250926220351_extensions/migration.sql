CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE OR REPLACE FUNCTION "public"."immutable_unaccent"("text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    AS $_$
SELECT "public"."unaccent"($1);
$_$;

ALTER FUNCTION "public"."immutable_unaccent"("text") OWNER TO "postgres";