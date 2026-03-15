-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Timestamps" ALTER COLUMN "date" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "userId" TEXT,
    "label" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;
