/*
  Warnings:

  - You are about to drop the column `pollId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `recordCreatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_parentRecordId_fkey";

-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pollId_fkey";

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "pollId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "recordCreatedAt";

-- DropTable
DROP TABLE "Poll";
