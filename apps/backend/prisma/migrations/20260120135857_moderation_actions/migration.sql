-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('MainFeedsSuspend');

-- CreateEnum
CREATE TYPE "ContentModerationStatus" AS ENUM ('Ok', 'MainFeedsSuspend');

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "caModeration" "ContentModerationStatus" NOT NULL DEFAULT 'Ok';

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "userAffectedId" TEXT NOT NULL,
    "type" "ModerationActionType" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_start" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_end" TIMESTAMPTZ(3),

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_userAffectedId_fkey" FOREIGN KEY ("userAffectedId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;
