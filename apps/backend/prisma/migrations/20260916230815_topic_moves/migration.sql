BEGIN;

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_root_id_topic_id_fkey";

-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "edit_id" TEXT,
ALTER COLUMN "block_number" DROP NOT NULL;

-- Preserve the edit association independently of the generic record root.
UPDATE "comment" SET "edit_id" = "root_id";

-- AlterTable
ALTER TABLE "topic" ADD COLUMN     "original_title" TEXT,
ADD COLUMN     "slug" TEXT;

-- Keep stable identifiers and the original spelling of every existing title.
UPDATE "topic" SET "original_title" = "title", "slug" = "id";

ALTER TABLE "topic" ALTER COLUMN "original_title" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

INSERT INTO "record_type" ("id", "name") VALUES ('topic_move', 'Movimiento de tema')
ON CONFLICT ("id") DO NOTHING;

-- CreateTable
CREATE TABLE "topic_move" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "from_title" TEXT NOT NULL,
    "from_slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "topic_move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_redirect" (
    "slug" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "topic_move_id" TEXT,

    CONSTRAINT "topic_redirect_pkey" PRIMARY KEY ("slug")
);

-- Reserve each original URL without creating a synthetic movement.
INSERT INTO "topic_redirect" ("slug", "topic_id", "topic_move_id")
SELECT "slug", "id", NULL FROM "topic";

-- A topic has at most one original URL; later aliases reference a movement.
CREATE UNIQUE INDEX "topic_redirect_original_topic_id_key"
ON "topic_redirect"("topic_id") WHERE "topic_move_id" IS NULL;

-- CreateIndex
CREATE INDEX "topic_move_topic_id_idx" ON "topic_move"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "topic_move_id_topic_id_key" ON "topic_move"("id", "topic_id");

-- CreateIndex
CREATE INDEX "topic_redirect_topic_id_idx" ON "topic_redirect"("topic_id");

-- CreateIndex
CREATE INDEX "topic_redirect_topic_move_id_topic_id_idx" ON "topic_redirect"("topic_move_id", "topic_id");

-- CreateIndex
CREATE INDEX "comment_edit_id_topic_id_idx" ON "comment"("edit_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "topic_slug_key" ON "topic"("slug");

-- AddForeignKey
ALTER TABLE "topic_move" ADD CONSTRAINT "topic_move_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_move" ADD CONSTRAINT "topic_move_id_fkey" FOREIGN KEY ("id") REFERENCES "record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_redirect" ADD CONSTRAINT "topic_redirect_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_redirect" ADD CONSTRAINT "topic_redirect_topic_move_id_topic_id_fkey" FOREIGN KEY ("topic_move_id", "topic_id") REFERENCES "topic_move"("id", "topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_edit_id_topic_id_fkey" FOREIGN KEY ("edit_id", "topic_id") REFERENCES "edit"("id", "topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
