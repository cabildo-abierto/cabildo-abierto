
-- CreateIndex
CREATE INDEX "HasReacted_reactionType_recordId_userId_idx" ON "HasReacted"("reactionType", "recordId", "userId");
