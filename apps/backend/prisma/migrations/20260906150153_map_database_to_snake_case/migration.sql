-- Rename tables in place so the mapping change preserves all existing data.
ALTER TABLE "User" RENAME TO "user";
ALTER TABLE "Session" RENAME TO "session";
ALTER TABLE "Topic" RENAME TO "topic";
ALTER TABLE "Record" RENAME TO "record";
ALTER TABLE "Block" RENAME TO "block";
ALTER TABLE "Comment" RENAME TO "comment";
ALTER TABLE "Reaction" RENAME TO "reaction";

-- These legacy physical columns were still using camelCase.
ALTER TABLE "reaction" RENAME COLUMN "subjectId" TO "subject_id";
ALTER TABLE "reaction" RENAME COLUMN "reasonId" TO "reason_id";

ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";
ALTER TABLE "session" RENAME CONSTRAINT "Session_pkey" TO "session_pkey";
ALTER TABLE "topic" RENAME CONSTRAINT "Topic_pkey" TO "topic_pkey";
ALTER TABLE "record" RENAME CONSTRAINT "Record_pkey" TO "record_pkey";
ALTER TABLE "block" RENAME CONSTRAINT "Block_pkey" TO "block_pkey";
ALTER TABLE "comment" RENAME CONSTRAINT "Comment_pkey" TO "comment_pkey";
ALTER TABLE "reaction" RENAME CONSTRAINT "Reaction_pkey" TO "reaction_pkey";

ALTER INDEX "User_username_key" RENAME TO "user_username_key";
ALTER INDEX "User_email_key" RENAME TO "user_email_key";
ALTER INDEX "Session_user_id_idx" RENAME TO "session_user_id_idx";
ALTER INDEX "Session_expires_at_idx" RENAME TO "session_expires_at_idx";
ALTER INDEX "Block_topic_id_block_number_key" RENAME TO "block_topic_id_block_number_key";
ALTER INDEX "Comment_topic_id_comment_number_key" RENAME TO "comment_topic_id_comment_number_key";

ALTER TABLE "session" RENAME CONSTRAINT "Session_user_id_fkey" TO "session_user_id_fkey";
ALTER TABLE "record" RENAME CONSTRAINT "Record_author_id_fkey" TO "record_author_id_fkey";
ALTER TABLE "record" RENAME CONSTRAINT "Record_topic_id_fkey" TO "record_topic_id_fkey";
ALTER TABLE "block" RENAME CONSTRAINT "Block_topic_id_fkey" TO "block_topic_id_fkey";
ALTER TABLE "block" RENAME CONSTRAINT "Block_id_fkey" TO "block_id_fkey";
ALTER TABLE "comment" RENAME CONSTRAINT "Comment_topic_id_fkey" TO "comment_topic_id_fkey";
ALTER TABLE "comment" RENAME CONSTRAINT "Comment_reply_to_id_fkey" TO "comment_reply_to_id_fkey";
ALTER TABLE "comment" RENAME CONSTRAINT "Comment_id_fkey" TO "comment_id_fkey";
ALTER TABLE "reaction" RENAME CONSTRAINT "Reaction_subjectId_fkey" TO "reaction_subject_id_fkey";
ALTER TABLE "reaction" RENAME CONSTRAINT "Reaction_reasonId_fkey" TO "reaction_reason_id_fkey";
ALTER TABLE "reaction" RENAME CONSTRAINT "Reaction_id_fkey" TO "reaction_id_fkey";
