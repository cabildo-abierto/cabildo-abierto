UPDATE "Reference" SET "touched" = '1970-01-01T00:00:00.000Z' WHERE "touched" IS NULL;

ALTER TABLE "public"."Reference" ALTER COLUMN "touched" SET NOT NULL,
ALTER COLUMN "touched" SET DEFAULT '1970-01-01 00:00:00 +00:00';
