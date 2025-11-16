/*
  Warnings:

  - You are about to drop the column `created_at_tz` on the `AssignedPayment` table. All the data in the column will be lost.
  - You are about to drop the column `promisesCreated` on the `UserMonth` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssignedPayment" DROP COLUMN "created_at_tz",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "UserMonth" DROP COLUMN "promisesCreated";
