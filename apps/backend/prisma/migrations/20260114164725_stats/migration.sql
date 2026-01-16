/*
  Warnings:

  - You are about to drop the `DailyStat` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- DropTable
DROP TABLE "DailyStat";

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stat_date_idx" ON "Stat"("date");

-- CreateIndex
CREATE INDEX "Stat_label_date_idx" ON "Stat"("label", "date");
