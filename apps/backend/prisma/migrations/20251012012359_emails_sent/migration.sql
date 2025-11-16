-- AlterTable
ALTER TABLE "MailingListSubscription" ALTER COLUMN "subscribedAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateTable
CREATE TABLE "EmailSent" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "EmailSent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailSent" ADD CONSTRAINT "EmailSent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "MailingListSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
