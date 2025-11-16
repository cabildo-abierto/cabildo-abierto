-- CreateIndex
CREATE INDEX "content_text_fts_idx" ON "public"."Content" USING GIN ("text_tsv");
