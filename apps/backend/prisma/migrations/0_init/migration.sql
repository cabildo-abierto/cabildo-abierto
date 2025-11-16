-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."EditorStatus" AS ENUM ('Beginner', 'Editor', 'Administrator');

-- CreateEnum
CREATE TYPE "public"."ModerationState" AS ENUM ('Ok', 'ShadowBan');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('Reply', 'Mention', 'TopicEdit', 'TopicVersionVote');

-- CreateEnum
CREATE TYPE "public"."PromiseStatus" AS ENUM ('Pending', 'Confirmed', 'Payed');

-- CreateEnum
CREATE TYPE "public"."ReferenceType" AS ENUM ('Strong', 'Weak');

-- CreateEnum
CREATE TYPE "public"."ValidationRequestResult" AS ENUM ('Aceptada', 'Rechazada', 'Pendiente');

-- CreateEnum
CREATE TYPE "public"."ValidationType" AS ENUM ('Persona', 'Organizacion');

-- CreateTable
CREATE TABLE "public"."AccessRequest" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "sentInviteAt" TIMESTAMP(3),
    "inviteCodeId" TEXT,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "title" TEXT NOT NULL,
    "uri" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."AuthSession" (
    "key" TEXT NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."AuthState" (
    "key" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "AuthState_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."Blob" (
    "cid" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Blob_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "public"."CategoryLink" (
    "idCategoryA" TEXT NOT NULL,
    "idCategoryB" TEXT NOT NULL,

    CONSTRAINT "CategoryLink_pkey" PRIMARY KEY ("idCategoryA","idCategoryB")
);

-- CreateTable
CREATE TABLE "public"."Content" (
    "text" TEXT,
    "numWords" INTEGER,
    "uri" TEXT NOT NULL,
    "format" TEXT,
    "textBlobId" TEXT,
    "lastReferencesUpdate" TIMESTAMP(3),
    "selfLabels" TEXT[],
    "embeds" JSONB[],
    "dbFormat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interactionsScore" INTEGER,
    "likesScore" INTEGER,
    "relativePopularityScore" DOUBLE PRECISION,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."DataBlock" (
    "cid" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "format" TEXT,

    CONSTRAINT "DataBlock_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "public"."Dataset" (
    "columns" TEXT[],
    "title" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."Donation" (
    "id" TEXT NOT NULL,
    "userById" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "amount" INTEGER NOT NULL,
    "mpPreferenceId" TEXT,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Draft" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "embeds" JSONB,
    "text" TEXT NOT NULL,
    "title" TEXT,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Follow" (
    "userFollowedId" TEXT,
    "uri" TEXT NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."HasReacted" (
    "userId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "HasReacted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InviteCode" (
    "code" TEXT NOT NULL,
    "usedByDid" TEXT,
    "usedAt" TIMESTAMP(3),
    "recommenderId" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "public"."Meeting" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "show" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotInterested" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "NotInterested_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "userNotifiedId" TEXT NOT NULL,
    "causedByRecordId" TEXT NOT NULL,
    "message" TEXT,
    "moreContext" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasonSubject" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentPromise" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PromiseStatus" NOT NULL DEFAULT 'Pending',
    "contentId" TEXT NOT NULL,
    "userMonthId" TEXT NOT NULL,

    CONSTRAINT "PaymentPromise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "facets" TEXT,
    "embed" TEXT,
    "replyToId" TEXT,
    "rootId" TEXT,
    "uri" TEXT NOT NULL,
    "langs" TEXT[],
    "quoteToId" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."Reaction" (
    "uri" TEXT NOT NULL,
    "subjectId" TEXT,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."ReadSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readContentId" TEXT,
    "readChunks" JSONB NOT NULL,
    "contentAuthorId" TEXT NOT NULL,
    "topicId" TEXT,

    CONSTRAINT "ReadSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Record" (
    "uri" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "rkey" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "record" TEXT,
    "cid" TEXT,
    "uniqueLikesCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueRepostsCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueAcceptsCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueRejectsCount" INTEGER NOT NULL DEFAULT 0,
    "CAIndexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."Reference" (
    "id" TEXT NOT NULL,
    "type" "public"."ReferenceType" NOT NULL,
    "referencedTopicId" TEXT NOT NULL,
    "referencingContentId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" TEXT NOT NULL,
    "protection" "public"."EditorStatus" NOT NULL DEFAULT 'Beginner',
    "currentVersionId" TEXT,
    "popularityScore" INTEGER DEFAULT 1,
    "lastEdit" TIMESTAMP(3),
    "popularityScoreLastDay" INTEGER NOT NULL DEFAULT 0,
    "popularityScoreLastMonth" INTEGER NOT NULL DEFAULT 0,
    "popularityScoreLastWeek" INTEGER NOT NULL DEFAULT 0,
    "lastContentChange" TIMESTAMP(3),

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopicCategory" (
    "id" TEXT NOT NULL,

    CONSTRAINT "TopicCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopicInteraction" (
    "recordId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "touched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "public"."TopicToCategory" (
    "topicId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "TopicToCategory_pkey" PRIMARY KEY ("topicId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."TopicVersion" (
    "topicId" TEXT NOT NULL,
    "accCharsAdded" INTEGER,
    "authorship" BOOLEAN NOT NULL DEFAULT true,
    "categories" TEXT,
    "charsAdded" INTEGER,
    "charsDeleted" INTEGER,
    "contribution" TEXT,
    "diff" TEXT,
    "message" TEXT NOT NULL DEFAULT '',
    "title" TEXT,
    "synonyms" TEXT,
    "uri" TEXT NOT NULL,
    "props" JSONB,
    "prevAcceptedUri" TEXT,

    CONSTRAINT "TopicVersion_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "did" VARCHAR(255) NOT NULL,
    "handle" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editorStatus" "public"."EditorStatus" NOT NULL DEFAULT 'Beginner',
    "hasAccess" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "displayName" TEXT,
    "inCA" BOOLEAN NOT NULL DEFAULT false,
    "platformAdmin" BOOLEAN NOT NULL DEFAULT false,
    "CAProfileUri" TEXT,
    "seenTutorial" BOOLEAN NOT NULL DEFAULT false,
    "orgValidation" TEXT,
    "userValidationHash" TEXT,
    "lastSeenNotifications" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01 00:00:00'::timestamp without time zone,
    "moderationState" "public"."ModerationState" NOT NULL DEFAULT 'Ok',
    "seenTopicMaximizedTutorial" BOOLEAN NOT NULL DEFAULT false,
    "seenTopicMinimizedTutorial" BOOLEAN NOT NULL DEFAULT false,
    "seenTopicsTutorial" BOOLEAN NOT NULL DEFAULT false,
    "algorithmConfig" JSONB,
    "authorStatus" JSONB,
    "articleLastMonth" BOOLEAN NOT NULL DEFAULT false,
    "postLastTwoWeeks" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("did")
);

-- CreateTable
CREATE TABLE "public"."UserMonth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "monthEnd" TIMESTAMP(3) NOT NULL,
    "wasActive" BOOLEAN NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "promisesCreated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ValidationRequest" (
    "id" TEXT NOT NULL,
    "type" "public"."ValidationType" NOT NULL,
    "userId" TEXT NOT NULL,
    "dniFrente" TEXT,
    "dniDorso" TEXT,
    "comentarios" TEXT,
    "documentacion" TEXT[],
    "email" TEXT,
    "sitioWeb" TEXT,
    "tipoOrg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectReason" TEXT,
    "result" "public"."ValidationRequestResult" NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "ValidationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoteReject" (
    "uri" TEXT NOT NULL,
    "labels" TEXT[],
    "message" TEXT,

    CONSTRAINT "VoteReject_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "public"."pgbench_accounts" (
    "aid" INTEGER NOT NULL,
    "bid" INTEGER,
    "abalance" INTEGER,
    "filler" CHAR(84),

    CONSTRAINT "pgbench_accounts_pkey" PRIMARY KEY ("aid")
);

-- CreateTable
CREATE TABLE "public"."pgbench_branches" (
    "bid" INTEGER NOT NULL,
    "bbalance" INTEGER,
    "filler" CHAR(88),

    CONSTRAINT "pgbench_branches_pkey" PRIMARY KEY ("bid")
);

-- CreateTable
CREATE TABLE "public"."pgbench_history" (
    "tid" INTEGER,
    "bid" INTEGER,
    "aid" INTEGER,
    "delta" INTEGER,
    "mtime" TIMESTAMP(6),
    "filler" CHAR(22)
);

-- CreateTable
CREATE TABLE "public"."pgbench_tellers" (
    "tid" INTEGER NOT NULL,
    "bid" INTEGER,
    "tbalance" INTEGER,
    "filler" CHAR(84),

    CONSTRAINT "pgbench_tellers_pkey" PRIMARY KEY ("tid")
);

-- CreateTable
CREATE TABLE "public"."_ContentToDataset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContentToDataset_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessRequest_inviteCodeId_key" ON "public"."AccessRequest"("inviteCodeId");

-- CreateIndex
CREATE INDEX "AccessRequest_inviteCodeId_idx" ON "public"."AccessRequest"("inviteCodeId");

-- CreateIndex
CREATE INDEX "Content_created_at_idx" ON "public"."Content"("created_at" DESC);

-- CreateIndex
CREATE INDEX "Content_interactionsScore_created_at_idx" ON "public"."Content"("interactionsScore" DESC, "created_at" DESC);

-- CreateIndex
CREATE INDEX "Content_likesScore_created_at_idx" ON "public"."Content"("likesScore" DESC, "created_at" DESC);

-- CreateIndex
CREATE INDEX "Content_relativePopularityScore_created_at_idx" ON "public"."Content"("relativePopularityScore" DESC, "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_mpPreferenceId_key" ON "public"."Donation"("mpPreferenceId");

-- CreateIndex
CREATE INDEX "Donation_userById_idx" ON "public"."Donation"("userById");

-- CreateIndex
CREATE INDEX "Draft_authorId_idx" ON "public"."Draft"("authorId");

-- CreateIndex
CREATE INDEX "Follow_userFollowedId_idx" ON "public"."Follow"("userFollowedId");

-- CreateIndex
CREATE INDEX "HasReacted_recordId_idx" ON "public"."HasReacted"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "HasReacted_userId_recordId_reactionType_key" ON "public"."HasReacted"("userId", "recordId", "reactionType");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_usedByDid_key" ON "public"."InviteCode"("usedByDid");

-- CreateIndex
CREATE INDEX "InviteCode_recommenderId_idx" ON "public"."InviteCode"("recommenderId");

-- CreateIndex
CREATE INDEX "InviteCode_usedByDid_idx" ON "public"."InviteCode"("usedByDid");

-- CreateIndex
CREATE INDEX "Meeting_show_idx" ON "public"."Meeting"("show");

-- CreateIndex
CREATE INDEX "NotInterested_authorId_idx" ON "public"."NotInterested"("authorId");

-- CreateIndex
CREATE INDEX "NotInterested_authorId_subjectId_idx" ON "public"."NotInterested"("authorId", "subjectId");

-- CreateIndex
CREATE INDEX "NotInterested_subjectId_idx" ON "public"."NotInterested"("subjectId");

-- CreateIndex
CREATE INDEX "Notification_userNotifiedId_idx" ON "public"."Notification"("userNotifiedId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_causedByRecordId_userNotifiedId_key" ON "public"."Notification"("causedByRecordId", "userNotifiedId");

-- CreateIndex
CREATE INDEX "PaymentPromise_contentId_idx" ON "public"."PaymentPromise"("contentId");

-- CreateIndex
CREATE INDEX "PaymentPromise_userMonthId_idx" ON "public"."PaymentPromise"("userMonthId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentPromise_contentId_userMonthId_key" ON "public"."PaymentPromise"("contentId", "userMonthId");

-- CreateIndex
CREATE INDEX "Post_quoteToId_idx" ON "public"."Post"("quoteToId");

-- CreateIndex
CREATE INDEX "Post_replyToId_idx" ON "public"."Post"("replyToId");

-- CreateIndex
CREATE INDEX "Post_rootId_idx" ON "public"."Post"("rootId");

-- CreateIndex
CREATE INDEX "Reaction_subjectId_idx" ON "public"."Reaction"("subjectId");

-- CreateIndex
CREATE INDEX "Reaction_uri_subjectId_idx" ON "public"."Reaction"("uri", "subjectId");

-- CreateIndex
CREATE INDEX "ReadSession_readContentId_idx" ON "public"."ReadSession"("readContentId");

-- CreateIndex
CREATE INDEX "ReadSession_userId_idx" ON "public"."ReadSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Record_uri_key" ON "public"."Record"("uri");

-- CreateIndex
CREATE INDEX "Record_authorId_collection_created_at_idx" ON "public"."Record"("authorId", "collection", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Record_authorId_created_at_idx" ON "public"."Record"("authorId", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Record_collection_authorId_created_at_idx" ON "public"."Record"("collection", "authorId", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Record_collection_created_at_idx" ON "public"."Record"("collection", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Record_created_at_idx" ON "public"."Record"("created_at" DESC);

-- CreateIndex
CREATE INDEX "Reference_referencedTopicId_idx" ON "public"."Reference"("referencedTopicId");

-- CreateIndex
CREATE INDEX "Reference_referencingContentId_idx" ON "public"."Reference"("referencingContentId");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_referencingContentId_referencedTopicId_key" ON "public"."Reference"("referencingContentId", "referencedTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_currentVersionId_key" ON "public"."Topic"("currentVersionId");

-- CreateIndex
CREATE INDEX "Topic_lastEdit_idx" ON "public"."Topic"("lastEdit" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastDay_idx" ON "public"."Topic"("popularityScoreLastDay" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastMonth_idx" ON "public"."Topic"("popularityScoreLastMonth" DESC);

-- CreateIndex
CREATE INDEX "Topic_popularityScoreLastWeek_idx" ON "public"."Topic"("popularityScoreLastWeek" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TopicInteraction_recordId_topicId_key" ON "public"."TopicInteraction"("recordId", "topicId");

-- CreateIndex
CREATE INDEX "TopicVersion_topicId_idx" ON "public"."TopicVersion"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_CAProfileUri_key" ON "public"."User"("CAProfileUri");

-- CreateIndex
CREATE UNIQUE INDEX "User_userValidationHash_key" ON "public"."User"("userValidationHash");

-- CreateIndex
CREATE INDEX "User_CAProfileUri_idx" ON "public"."User"("CAProfileUri");

-- CreateIndex
CREATE INDEX "User_articleLastMonth_did_idx" ON "public"."User"("articleLastMonth", "did");

-- CreateIndex
CREATE INDEX "User_created_at_idx" ON "public"."User"("created_at");

-- CreateIndex
CREATE INDEX "User_did_inCA_idx" ON "public"."User"("did", "inCA");

-- CreateIndex
CREATE INDEX "User_handle_idx" ON "public"."User"("handle");

-- CreateIndex
CREATE INDEX "User_inCA_did_idx" ON "public"."User"("inCA", "did");

-- CreateIndex
CREATE INDEX "User_postLastTwoWeeks_did_idx" ON "public"."User"("postLastTwoWeeks", "did");

-- CreateIndex
CREATE INDEX "UserMonth_userId_idx" ON "public"."UserMonth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationRequest_userId_key" ON "public"."ValidationRequest"("userId");

-- CreateIndex
CREATE INDEX "_ContentToDataset_B_index" ON "public"."_ContentToDataset"("B");

-- AddForeignKey
ALTER TABLE "public"."AccessRequest" ADD CONSTRAINT "AccessRequest_inviteCodeId_fkey" FOREIGN KEY ("inviteCodeId") REFERENCES "public"."InviteCode"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Blob" ADD CONSTRAINT "Blob_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryLink" ADD CONSTRAINT "CategoryLink_idCategoryA_fkey" FOREIGN KEY ("idCategoryA") REFERENCES "public"."TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryLink" ADD CONSTRAINT "CategoryLink_idCategoryB_fkey" FOREIGN KEY ("idCategoryB") REFERENCES "public"."TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_textBlobId_fkey" FOREIGN KEY ("textBlobId") REFERENCES "public"."Blob"("cid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataBlock" ADD CONSTRAINT "DataBlock_cid_fkey" FOREIGN KEY ("cid") REFERENCES "public"."Blob"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataBlock" ADD CONSTRAINT "DataBlock_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "public"."Dataset"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dataset" ADD CONSTRAINT "Dataset_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Donation" ADD CONSTRAINT "Donation_userById_fkey" FOREIGN KEY ("userById") REFERENCES "public"."User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Draft" ADD CONSTRAINT "Draft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_userFollowedId_fkey" FOREIGN KEY ("userFollowedId") REFERENCES "public"."User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HasReacted" ADD CONSTRAINT "HasReacted_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HasReacted" ADD CONSTRAINT "HasReacted_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InviteCode" ADD CONSTRAINT "InviteCode_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "public"."User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InviteCode" ADD CONSTRAINT "InviteCode_usedByDid_fkey" FOREIGN KEY ("usedByDid") REFERENCES "public"."User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotInterested" ADD CONSTRAINT "NotInterested_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotInterested" ADD CONSTRAINT "NotInterested_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_causedByRecordId_fkey" FOREIGN KEY ("causedByRecordId") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userNotifiedId_fkey" FOREIGN KEY ("userNotifiedId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentPromise" ADD CONSTRAINT "PaymentPromise_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentPromise" ADD CONSTRAINT "PaymentPromise_userMonthId_fkey" FOREIGN KEY ("userMonthId") REFERENCES "public"."UserMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_quoteToId_fkey" FOREIGN KEY ("quoteToId") REFERENCES "public"."Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "public"."Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "public"."Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reaction" ADD CONSTRAINT "Reaction_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reaction" ADD CONSTRAINT "Reaction_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadSession" ADD CONSTRAINT "ReadSession_contentAuthorId_fkey" FOREIGN KEY ("contentAuthorId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadSession" ADD CONSTRAINT "ReadSession_readContentId_fkey" FOREIGN KEY ("readContentId") REFERENCES "public"."Content"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadSession" ADD CONSTRAINT "ReadSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadSession" ADD CONSTRAINT "ReadSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reference" ADD CONSTRAINT "Reference_referencedTopicId_fkey" FOREIGN KEY ("referencedTopicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reference" ADD CONSTRAINT "Reference_referencingContentId_fkey" FOREIGN KEY ("referencingContentId") REFERENCES "public"."Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "public"."TopicVersion"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicInteraction" ADD CONSTRAINT "TopicInteraction_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "public"."Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicInteraction" ADD CONSTRAINT "TopicInteraction_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicToCategory" ADD CONSTRAINT "TopicToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicToCategory" ADD CONSTRAINT "TopicToCategory_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicVersion" ADD CONSTRAINT "TopicVersion_prevAcceptedUri_fkey" FOREIGN KEY ("prevAcceptedUri") REFERENCES "public"."TopicVersion"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicVersion" ADD CONSTRAINT "TopicVersion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicVersion" ADD CONSTRAINT "TopicVersion_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Content"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_CAProfileUri_fkey" FOREIGN KEY ("CAProfileUri") REFERENCES "public"."Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserMonth" ADD CONSTRAINT "UserMonth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ValidationRequest" ADD CONSTRAINT "ValidationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoteReject" ADD CONSTRAINT "VoteReject_uri_fkey" FOREIGN KEY ("uri") REFERENCES "public"."Reaction"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ContentToDataset" ADD CONSTRAINT "_ContentToDataset_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Content"("uri") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ContentToDataset" ADD CONSTRAINT "_ContentToDataset_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Dataset"("uri") ON DELETE CASCADE ON UPDATE CASCADE;

