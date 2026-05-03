-- CreateEnum
CREATE TYPE "MailingListSubscriptionStatus" AS ENUM ('Subscribed', 'Unsubscribed');

-- CreateEnum
CREATE TYPE "EditorStatus" AS ENUM ('Beginner', 'Editor', 'Administrator');

-- CreateEnum
CREATE TYPE "ModerationState" AS ENUM ('Ok', 'ShadowBan');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Reply', 'Mention', 'TopicEdit', 'TopicVersionVote');

-- CreateEnum
CREATE TYPE "PromiseStatus" AS ENUM ('Pending', 'Confirmed', 'Payed');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('Strong', 'Weak');

-- CreateEnum
CREATE TYPE "VerificationRequestResult" AS ENUM ('Aceptada', 'Rechazada', 'Pendiente');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('Persona', 'Organizacion');

-- CreateEnum
CREATE TYPE "Collection" AS ENUM ('ArCabildoabiertoFeedArticle', 'AppBskyFeedPost', 'AppBskyFeedRepost');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('MainFeedsSuspend');

-- CreateEnum
CREATE TYPE "ModerationMethod" AS ENUM ('Manual', 'Automatic');

-- CreateEnum
CREATE TYPE "ContentModerationStatus" AS ENUM ('Ok', 'MainFeedsSuspend');

-- CreateTable
CREATE TABLE "Record" (
    "uri" TEXT NOT NULL,
    "cid" TEXT,
    "collection" TEXT NOT NULL,
    "rkey" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "indexedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "record" JSONB,
    "consensusId" TEXT,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "Blob" (
    "cid" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Blob_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "Consensus" (
    "id" TEXT NOT NULL,
    "currentVersionUri" TEXT NOT NULL,
    "datasetUri" TEXT,

    CONSTRAINT "Consensus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsensusVersion" (
    "uri" TEXT NOT NULL,
    "consensusId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "labels" TEXT[],
    "eventDate" DATE NOT NULL,

    CONSTRAINT "ConsensusVersion_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "Comment" (
    "uri" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "replyToId" TEXT,
    "replyToCid" TEXT,
    "rootId" TEXT,
    "rootCid" TEXT,
    "isChallenge" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "Embed" (
    "id" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "contentId" TEXT NOT NULL,
    "datasetUri" TEXT,

    CONSTRAINT "Embed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "uri" TEXT,
    "body" TEXT NOT NULL,
    "facets" JSONB[],

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "uri" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "description" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "url" TEXT,
    "blobCid" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "uri" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "columns" TEXT[],
    "format" TEXT,
    "url" TEXT,
    "blobCid" TEXT,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "userById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "amount" INTEGER NOT NULL,
    "mpPreferenceId" TEXT,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "title" TEXT,
    "contentId" TEXT,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasReacted" (
    "userId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "HasReacted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteCode" (
    "code" TEXT NOT NULL,
    "usedByDid" TEXT,
    "usedAt" TIMESTAMPTZ(3),
    "recommenderId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdsInvite" TEXT,
    "uses" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "InviteCodeUsedBy" (
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteCodeUsedBy_pkey" PRIMARY KEY ("code","userId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "userNotifiedId" TEXT NOT NULL,
    "causedByRecordId" TEXT NOT NULL,
    "message" TEXT,
    "moreContext" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reasonSubject" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "uri" TEXT NOT NULL,
    "subjectId" TEXT,
    "subjectCid" TEXT,
    "pollId" TEXT,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "currentVersionId" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicCategory" (
    "id" TEXT NOT NULL,

    CONSTRAINT "TopicCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicToCategory" (
    "topicId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "TopicToCategory_pkey" PRIMARY KEY ("topicId","categoryId")
);

-- CreateTable
CREATE TABLE "TopicProp" (
    "id" TEXT NOT NULL,
    "topicVersionUri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" INTEGER,
    "booleanValue" BOOLEAN,
    "stringListValue" TEXT[],
    "datetimeValue" TIMESTAMPTZ(3) NOT NULL,
    "dateValue" DATE NOT NULL,

    CONSTRAINT "TopicProp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicVersion" (
    "uri" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "TopicVersion_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicCategoryId" TEXT NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "did" VARCHAR(255) NOT NULL,
    "handle" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasAccess" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" DATE,
    "avatar" TEXT,
    "description" TEXT,
    "displayName" TEXT,
    "inCA" BOOLEAN NOT NULL DEFAULT false,
    "platformAdmin" BOOLEAN NOT NULL DEFAULT false,
    "CAProfileUri" TEXT,
    "orgValidation" TEXT,
    "userValidationHash" TEXT,
    "moderationState" "ModerationState" NOT NULL DEFAULT 'Ok',

    CONSTRAINT "User_pkey" PRIMARY KEY ("did")
);

-- CreateTable
CREATE TABLE "UserConfig" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "default" TEXT NOT NULL,

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConfigValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    CONSTRAINT "UserConfigValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "userId" TEXT NOT NULL,
    "dniFrente" TEXT,
    "dniDorso" TEXT,
    "comentarios" TEXT,
    "documentacion" TEXT[],
    "email" TEXT,
    "sitioWeb" TEXT,
    "tipoOrg" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectReason" TEXT,
    "result" "VerificationRequestResult" NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timestamps" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Timestamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "userId" TEXT,
    "eventTypeId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "cv" TEXT,
    "job" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailingListSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailOriginal" TEXT,
    "status" "MailingListSubscriptionStatus" NOT NULL DEFAULT 'Subscribed',
    "userId" TEXT,
    "subscribedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),

    CONSTRAINT "MailingListSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSent" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "from" TEXT NOT NULL,
    "replyTo" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "EmailSent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "userAffectedId" TEXT NOT NULL,
    "type" "ModerationActionType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateStart" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEnd" TIMESTAMPTZ(3),

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordModerationProcess" (
    "id" TEXT NOT NULL,
    "recordId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(3),
    "result" "ContentModerationStatus",
    "processedById" TEXT,
    "method" "ModerationMethod",

    CONSTRAINT "RecordModerationProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "choices" TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL,
    "topicId" TEXT,
    "parentRecordId" TEXT,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Record_uri_key" ON "Record"("uri");

-- CreateIndex
CREATE INDEX "Record_authorId_collection_indexedAt_idx" ON "Record"("authorId", "collection", "indexedAt" DESC);

-- CreateIndex
CREATE INDEX "Record_authorId_indexedAt_idx" ON "Record"("authorId", "indexedAt" DESC);

-- CreateIndex
CREATE INDEX "Record_indexedAt_idx" ON "Record"("indexedAt" DESC);

-- CreateIndex
CREATE INDEX "Blob_authorId_idx" ON "Blob"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Consensus_currentVersionUri_key" ON "Consensus"("currentVersionUri");

-- CreateIndex
CREATE UNIQUE INDEX "ConsensusVersion_contentId_key" ON "ConsensusVersion"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_contentId_key" ON "Comment"("contentId");

-- CreateIndex
CREATE INDEX "Comment_replyToId_idx" ON "Comment"("replyToId");

-- CreateIndex
CREATE INDEX "Comment_rootId_idx" ON "Comment"("rootId");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_blobCid_key" ON "Dataset"("blobCid");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_mpPreferenceId_key" ON "Donation"("mpPreferenceId");

-- CreateIndex
CREATE INDEX "Donation_userById_idx" ON "Donation"("userById");

-- CreateIndex
CREATE INDEX "Draft_authorId_idx" ON "Draft"("authorId");

-- CreateIndex
CREATE INDEX "HasReacted_recordId_idx" ON "HasReacted"("recordId");

-- CreateIndex
CREATE INDEX "HasReacted_reactionType_recordId_userId_idx" ON "HasReacted"("reactionType", "recordId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "HasReacted_userId_recordId_reactionType_key" ON "HasReacted"("userId", "recordId", "reactionType");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_usedByDid_key" ON "InviteCode"("usedByDid");

-- CreateIndex
CREATE INDEX "InviteCode_recommenderId_idx" ON "InviteCode"("recommenderId");

-- CreateIndex
CREATE INDEX "InviteCode_usedByDid_idx" ON "InviteCode"("usedByDid");

-- CreateIndex
CREATE INDEX "Notification_userNotifiedId_createdAt_idx" ON "Notification"("userNotifiedId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_causedByRecordId_userNotifiedId_type_key" ON "Notification"("causedByRecordId", "userNotifiedId", "type");

-- CreateIndex
CREATE INDEX "Reaction_subjectId_idx" ON "Reaction"("subjectId");

-- CreateIndex
CREATE INDEX "Reaction_uri_subjectId_idx" ON "Reaction"("uri", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_currentVersionId_key" ON "Topic"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicProp_topicVersionUri_name_key" ON "TopicProp"("topicVersionUri", "name");

-- CreateIndex
CREATE INDEX "TopicVersion_topicId_idx" ON "TopicVersion"("topicId");

-- CreateIndex
CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");

-- CreateIndex
CREATE INDEX "UserInterest_topicCategoryId_idx" ON "UserInterest"("topicCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_topicCategoryId_key" ON "UserInterest"("userId", "topicCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_CAProfileUri_key" ON "User"("CAProfileUri");

-- CreateIndex
CREATE UNIQUE INDEX "User_userValidationHash_key" ON "User"("userValidationHash");

-- CreateIndex
CREATE INDEX "User_CAProfileUri_idx" ON "User"("CAProfileUri");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_did_inCA_idx" ON "User"("did", "inCA");

-- CreateIndex
CREATE INDEX "User_handle_idx" ON "User"("handle");

-- CreateIndex
CREATE INDEX "User_inCA_did_idx" ON "User"("inCA", "did");

-- CreateIndex
CREATE INDEX "UserConfigValue_userId_configId_idx" ON "UserConfigValue"("userId", "configId");

-- CreateIndex
CREATE UNIQUE INDEX "UserConfigValue_configId_userId_key" ON "UserConfigValue"("configId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_userId_key" ON "VerificationRequest"("userId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_eventTypeId_idx" ON "Event"("eventTypeId");

-- CreateIndex
CREATE INDEX "Event_userId_eventTypeId_idx" ON "Event"("userId", "eventTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "MailingListSubscription_email_key" ON "MailingListSubscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MailingListSubscription_userId_key" ON "MailingListSubscription"("userId");

-- CreateIndex
CREATE INDEX "EmailSent_recipientId_idx" ON "EmailSent"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE INDEX "Stat_date_idx" ON "Stat"("date");

-- CreateIndex
CREATE INDEX "Stat_label_date_idx" ON "Stat"("label", "date");

-- CreateIndex
CREATE INDEX "ModerationAction_userAffectedId_idx" ON "ModerationAction"("userAffectedId");

-- CreateIndex
CREATE UNIQUE INDEX "RecordModerationProcess_recordId_key" ON "RecordModerationProcess"("recordId");

-- CreateIndex
CREATE INDEX "RecordModerationProcess_recordId_idx" ON "RecordModerationProcess"("recordId");

-- CreateIndex
CREATE INDEX "RecordModerationProcess_processedById_idx" ON "RecordModerationProcess"("processedById");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Token_userId_idx" ON "Token"("userId");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "Token"("token");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_consensusId_fkey" FOREIGN KEY ("consensusId") REFERENCES "Consensus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blob" ADD CONSTRAINT "Blob_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consensus" ADD CONSTRAINT "Consensus_currentVersionUri_fkey" FOREIGN KEY ("currentVersionUri") REFERENCES "ConsensusVersion"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consensus" ADD CONSTRAINT "Consensus_datasetUri_fkey" FOREIGN KEY ("datasetUri") REFERENCES "Dataset"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusVersion" ADD CONSTRAINT "ConsensusVersion_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusVersion" ADD CONSTRAINT "ConsensusVersion_consensusId_fkey" FOREIGN KEY ("consensusId") REFERENCES "Consensus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsensusVersion" ADD CONSTRAINT "ConsensusVersion_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embed" ADD CONSTRAINT "Embed_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embed" ADD CONSTRAINT "Embed_datasetUri_fkey" FOREIGN KEY ("datasetUri") REFERENCES "Dataset"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_blobCid_fkey" FOREIGN KEY ("blobCid") REFERENCES "Blob"("cid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_blobCid_fkey" FOREIGN KEY ("blobCid") REFERENCES "Blob"("cid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userById_fkey" FOREIGN KEY ("userById") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasReacted" ADD CONSTRAINT "HasReacted_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasReacted" ADD CONSTRAINT "HasReacted_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_usedByDid_fkey" FOREIGN KEY ("usedByDid") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCodeUsedBy" ADD CONSTRAINT "InviteCodeUsedBy_code_fkey" FOREIGN KEY ("code") REFERENCES "InviteCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCodeUsedBy" ADD CONSTRAINT "InviteCodeUsedBy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_causedByRecordId_fkey" FOREIGN KEY ("causedByRecordId") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userNotifiedId_fkey" FOREIGN KEY ("userNotifiedId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "TopicVersion"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicToCategory" ADD CONSTRAINT "TopicToCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicToCategory" ADD CONSTRAINT "TopicToCategory_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProp" ADD CONSTRAINT "TopicProp_topicVersionUri_fkey" FOREIGN KEY ("topicVersionUri") REFERENCES "TopicVersion"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersion" ADD CONSTRAINT "TopicVersion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersion" ADD CONSTRAINT "TopicVersion_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_topicCategoryId_fkey" FOREIGN KEY ("topicCategoryId") REFERENCES "TopicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_CAProfileUri_fkey" FOREIGN KEY ("CAProfileUri") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfigValue" ADD CONSTRAINT "UserConfigValue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfigValue" ADD CONSTRAINT "UserConfigValue_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailingListSubscription" ADD CONSTRAINT "MailingListSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSent" ADD CONSTRAINT "EmailSent_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "MailingListSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSent" ADD CONSTRAINT "EmailSent_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_userAffectedId_fkey" FOREIGN KEY ("userAffectedId") REFERENCES "User"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordModerationProcess" ADD CONSTRAINT "RecordModerationProcess_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordModerationProcess" ADD CONSTRAINT "RecordModerationProcess_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("did") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_parentRecordId_fkey" FOREIGN KEY ("parentRecordId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("did") ON DELETE CASCADE ON UPDATE CASCADE;


insert into "User" ("did", "inCA", "hasAccess", "platformAdmin")
values ('did:plc:2semihha42b7efhu4ywv7whi', true, true, true)
on conflict do nothing;


insert into "UserConfig" ("id", "label", "default")
values ('at_scope', 'at_scope', 'atproto transition:generic transition:email')
on conflict do nothing;