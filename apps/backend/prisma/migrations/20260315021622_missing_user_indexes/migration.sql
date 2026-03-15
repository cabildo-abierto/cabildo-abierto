-- CreateIndex
CREATE INDEX "Blob_authorId_idx" ON "Blob"("authorId");

-- CreateIndex
CREATE INDEX "EmailSent_recipientId_idx" ON "EmailSent"("recipientId");

-- CreateIndex
CREATE INDEX "ModerationAction_userAffectedId_idx" ON "ModerationAction"("userAffectedId");
