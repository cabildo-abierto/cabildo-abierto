-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "VoteReject" ADD COLUMN     "reasonId" TEXT;

-- AddForeignKey
ALTER TABLE "VoteReject" ADD CONSTRAINT "VoteReject_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "Post"("uri") ON DELETE SET NULL ON UPDATE CASCADE;
