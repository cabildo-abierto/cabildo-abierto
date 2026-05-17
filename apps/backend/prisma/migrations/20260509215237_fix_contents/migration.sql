/*
  Warnings:

  - A unique constraint covering the columns `[uri]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contentId]` on the table `Draft` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Content_uri_key" ON "Content"("uri");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_contentId_key" ON "Draft"("contentId");
