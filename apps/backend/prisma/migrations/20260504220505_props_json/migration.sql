/*
  Warnings:

  - Added the required column `props` to the `TopicVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TopicVersion" ADD COLUMN     "props" JSONB NOT NULL;
