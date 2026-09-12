-- DropForeignKey
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_reason_id_fkey";

-- AlterTable
ALTER TABLE "reaction" ALTER COLUMN "reason_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
