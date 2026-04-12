/*
  Warnings:

  - You are about to drop the column `label` on the `Event` table. All the data in the column will be lost.
  - Added the required column `eventTypeId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "label",
ADD COLUMN     "eventTypeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_eventTypeId_idx" ON "Event"("eventTypeId");

-- CreateIndex
CREATE INDEX "Event_userId_eventTypeId_idx" ON "Event"("userId", "eventTypeId");

-- CreateIndex
CREATE INDEX "UserConfigValue_userId_configId_idx" ON "UserConfigValue"("userId", "configId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
