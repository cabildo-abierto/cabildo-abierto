-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "document_block_id" TEXT;

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "format" TEXT,
    "preview_file_id" TEXT,
    "preview_status" TEXT NOT NULL DEFAULT 'ready',
    "preview_error" TEXT,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_block" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "document_block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_key_key" ON "file"("key");

-- CreateIndex
CREATE INDEX "document_file_id_idx" ON "document"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_block_file_id_position_key" ON "document_block"("file_id", "position");

-- CreateIndex
CREATE INDEX "comment_document_block_id_idx" ON "comment"("document_block_id");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_document_block_id_fkey" FOREIGN KEY ("document_block_id") REFERENCES "document_block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_preview_file_id_fkey" FOREIGN KEY ("preview_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_id_fkey" FOREIGN KEY ("id") REFERENCES "block_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_block" ADD CONSTRAINT "document_block_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
