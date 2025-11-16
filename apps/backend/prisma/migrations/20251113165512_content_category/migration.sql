-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateTable
CREATE TABLE "ContentToCategory" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ContentToCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentToCategory_contentId_idx" ON "ContentToCategory"("contentId");

-- CreateIndex
CREATE INDEX "ContentToCategory_categoryId_idx" ON "ContentToCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentToCategory_contentId_categoryId_key" ON "ContentToCategory"("contentId", "categoryId");

-- AddForeignKey
ALTER TABLE "ContentToCategory" ADD CONSTRAINT "ContentToCategory_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentToCategory" ADD CONSTRAINT "ContentToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
