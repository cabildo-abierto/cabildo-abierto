/*
  Warnings:

  - You are about to drop the column `articleLastMonth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `postLastTwoWeeks` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_articleLastMonth_did_idx";

-- DropIndex
DROP INDEX "User_postLastTwoWeeks_did_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "articleLastMonth",
DROP COLUMN "postLastTwoWeeks";

-- CreateTable
CREATE TABLE "UserConfig" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "default" TEXT NOT NULL,

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConfigValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "UserConfigValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfigValue_configId_userId_key" ON "UserConfigValue"("configId", "userId");

-- AddForeignKey
ALTER TABLE "UserConfigValue" ADD CONSTRAINT "UserConfigValue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfigValue" ADD CONSTRAINT "UserConfigValue_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
