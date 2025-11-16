-- AlterTable
ALTER TABLE "public"."AccessRequest" ALTER COLUMN "created_at_tz" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;


-- Actualización de content.created_at_tz en base a record.created_at_tz

UPDATE "Content" c
SET created_at_tz = r.created_at_tz
    FROM "Record" r
WHERE c."uri" = r."uri";

CREATE OR REPLACE FUNCTION sync_content_created_at_tz_from_record()
RETURNS TRIGGER AS $$
BEGIN
UPDATE "Content"
SET created_at_tz = NEW.created_at_tz
WHERE "uri" = NEW."uri";

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_after_insert_or_update_sync_content_timestamp
    AFTER INSERT OR UPDATE ON "Record"
                        FOR EACH ROW
                        EXECUTE FUNCTION sync_content_created_at_tz_from_record();
