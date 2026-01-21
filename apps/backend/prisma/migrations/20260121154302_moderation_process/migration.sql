-- CreateEnum
CREATE TYPE "ModerationMethod" AS ENUM ('Manual');

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateTable
CREATE TABLE "RecordModerationProcess" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "result" "ContentModerationStatus",
    "processedById" TEXT,
    "method" "ModerationMethod" NOT NULL,

    CONSTRAINT "RecordModerationProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecordModerationProcess_recordId_key" ON "RecordModerationProcess"("recordId");

-- AddForeignKey
ALTER TABLE "RecordModerationProcess" ADD CONSTRAINT "RecordModerationProcess_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordModerationProcess" ADD CONSTRAINT "RecordModerationProcess_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;
