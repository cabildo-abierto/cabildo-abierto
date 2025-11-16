ALTER TABLE "public"."TopicInteraction" ADD COLUMN "touched" TIMESTAMP(3);

UPDATE "public"."TopicInteraction" SET "touched" = '1970-01-01T00:00:00.000Z';

ALTER TABLE "public"."TopicInteraction" ALTER COLUMN "touched" SET NOT NULL;
