/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `topic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "topic_title_key" ON "topic"("title");
