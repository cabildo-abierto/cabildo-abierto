
-- CreateIndex
CREATE INDEX "SearchableContent_collection_created_at_idx" ON "SearchableContent"("collection", "created_at");

-- CreateIndex
CREATE INDEX "SearchableContent_created_at_idx" ON "SearchableContent"("created_at");
