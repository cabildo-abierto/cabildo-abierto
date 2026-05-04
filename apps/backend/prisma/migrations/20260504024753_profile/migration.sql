/*
  Warnings:

  - You are about to drop the column `CAProfileUri` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_CAProfileUri_fkey";

-- DropIndex
DROP INDEX "User_CAProfileUri_idx";

-- DropIndex
DROP INDEX "User_CAProfileUri_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "CAProfileUri",
DROP COLUMN "avatar",
DROP COLUMN "description",
DROP COLUMN "displayName";

-- CreateTable
CREATE TABLE "Profile" (
    "uri" TEXT NOT NULL,
    "did" VARCHAR(255) NOT NULL,
    "avatar" TEXT,
    "description" TEXT,
    "displayName" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("uri")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_did_key" ON "Profile"("did");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_did_fkey" FOREIGN KEY ("did") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;
