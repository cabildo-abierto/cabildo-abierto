-- DropForeignKey
ALTER TABLE "public"."TopicInteraction" DROP CONSTRAINT "TopicInteraction_referenceId_fkey";

-- AddForeignKey
ALTER TABLE "public"."TopicInteraction" ADD CONSTRAINT "TopicInteraction_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
