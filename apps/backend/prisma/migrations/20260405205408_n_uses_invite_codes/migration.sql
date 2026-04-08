-- AlterTable
ALTER TABLE "InviteCode" ADD COLUMN     "uses" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "InviteCodeUsedBy" (
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InviteCodeUsedBy_pkey" PRIMARY KEY ("code","userId")
);

-- AddForeignKey
ALTER TABLE "InviteCodeUsedBy" ADD CONSTRAINT "InviteCodeUsedBy_code_fkey" FOREIGN KEY ("code") REFERENCES "InviteCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCodeUsedBy" ADD CONSTRAINT "InviteCodeUsedBy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;
