/*
  Warnings:

  - Added the required column `id` to the `TopicInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Reference" ALTER COLUMN "count" DROP DEFAULT,
ALTER COLUMN "relevance" DROP NOT NULL,
ALTER COLUMN "relevance" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."TopicInteraction" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "TopicInteraction_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."_ReferenceToTopicInteraction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReferenceToTopicInteraction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ReferenceToTopicInteraction_B_index" ON "public"."_ReferenceToTopicInteraction"("B");

-- AddForeignKey
ALTER TABLE "public"."_ReferenceToTopicInteraction" ADD CONSTRAINT "_ReferenceToTopicInteraction_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReferenceToTopicInteraction" ADD CONSTRAINT "_ReferenceToTopicInteraction_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TopicInteraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
