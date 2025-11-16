-- CreateEnum
CREATE TYPE "MailingListSubscriptionStatus" AS ENUM ('Subscribed', 'Unsubscribed');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateTable
CREATE TABLE "MailingListSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "MailingListSubscriptionStatus" NOT NULL DEFAULT 'Subscribed',
    "userId" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MailingListSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailingListSubscription_email_key" ON "MailingListSubscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MailingListSubscription_userId_key" ON "MailingListSubscription"("userId");

-- AddForeignKey
ALTER TABLE "MailingListSubscription" ADD CONSTRAINT "MailingListSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;
