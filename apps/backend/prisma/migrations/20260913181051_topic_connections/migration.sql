-- CreateTable
CREATE TABLE "topic_connection" (
    "connection_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "topic_connection_pkey" PRIMARY KEY ("connection_id")
);

-- CreateIndex
CREATE INDEX "topic_connection_topic_id_expires_at_idx" ON "topic_connection"("topic_id", "expires_at");

-- CreateIndex
CREATE INDEX "topic_connection_topic_id_mode_expires_at_idx" ON "topic_connection"("topic_id", "mode", "expires_at");

-- CreateIndex
CREATE INDEX "topic_connection_viewer_id_idx" ON "topic_connection"("viewer_id");

-- AddForeignKey
ALTER TABLE "topic_connection" ADD CONSTRAINT "topic_connection_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
