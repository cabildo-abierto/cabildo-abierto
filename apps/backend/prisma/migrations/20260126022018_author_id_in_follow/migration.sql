-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "referencingContentCreatedAt" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastSeenNotifications_tz" SET DEFAULT '1970-01-01 00:00:00+00'::timestamptz;

-- CreateIndex
CREATE INDEX "Follow_authorId_userFollowedId_idx" ON "Follow"("authorId", "userFollowedId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;
