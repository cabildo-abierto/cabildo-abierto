/*
  Warnings:

  - You are about to drop the column `monthEnd_tz` on the `UserMonth` table. All the data in the column will be lost.
  - You are about to drop the column `monthStart_tz` on the `UserMonth` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentPromise" DROP CONSTRAINT "PaymentPromise_userMonthId_fkey";

-- AlterTable
ALTER TABLE "PaymentPromise" ALTER COLUMN "userMonthId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "UserMonth" DROP COLUMN "monthEnd_tz",
DROP COLUMN "monthStart_tz",
ALTER COLUMN "monthStart" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "monthEnd" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "AssignedPayment" (
    "id" TEXT NOT NULL,
    "created_at_tz" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PromiseStatus" NOT NULL DEFAULT 'Pending',
    "contentId" TEXT NOT NULL,
    "userMonthId" TEXT,

    CONSTRAINT "AssignedPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssignedPayment_contentId_idx" ON "AssignedPayment"("contentId");

-- CreateIndex
CREATE INDEX "AssignedPayment_userMonthId_idx" ON "AssignedPayment"("userMonthId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedPayment_contentId_userMonthId_key" ON "AssignedPayment"("contentId", "userMonthId");

-- AddForeignKey
ALTER TABLE "PaymentPromise" ADD CONSTRAINT "PaymentPromise_userMonthId_fkey" FOREIGN KEY ("userMonthId") REFERENCES "UserMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedPayment" ADD CONSTRAINT "AssignedPayment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedPayment" ADD CONSTRAINT "AssignedPayment_userMonthId_fkey" FOREIGN KEY ("userMonthId") REFERENCES "UserMonth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
