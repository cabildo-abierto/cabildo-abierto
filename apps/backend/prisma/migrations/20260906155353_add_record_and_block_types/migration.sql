-- Create the normalized type tables.
CREATE TABLE "record_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "record_type_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "block_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "block_type_pkey" PRIMARY KEY ("id")
);

-- Seed the initial supported types.
INSERT INTO "record_type" ("id", "name") VALUES
    ('block', 'Bloque'),
    ('comment', 'Comentario'),
    ('reaction', 'Reacción');

INSERT INTO "block_type" ("id", "name") VALUES
    ('parrafo', 'Párrafo'),
    ('h1', 'Título de sección'),
    ('h2', 'Título de subsección');

-- Preserve any historical type values before adding the foreign keys.
INSERT INTO "record_type" ("id", "name")
SELECT DISTINCT "type", "type" FROM "record"
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "block_type" ("id", "name")
SELECT DISTINCT "type", "type" FROM "block"
ON CONFLICT ("id") DO NOTHING;

-- Rename the existing columns in place so no record or block data is lost.
ALTER TABLE "record" RENAME COLUMN "type" TO "type_id";
ALTER TABLE "block" RENAME COLUMN "type" TO "type_id";

ALTER TABLE "record"
ADD CONSTRAINT "record_type_id_fkey"
FOREIGN KEY ("type_id") REFERENCES "record_type"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "block"
ADD CONSTRAINT "block_type_id_fkey"
FOREIGN KEY ("type_id") REFERENCES "block_type"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
