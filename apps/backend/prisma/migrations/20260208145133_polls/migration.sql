
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
CREATE TABLE "PollVote" (
    "uri" TEXT NOT NULL,
    "pollId" TEXT,
    "choice" TEXT NOT NULL,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("uri")
);

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_parentRecordId_fkey" FOREIGN KEY ("parentRecordId") REFERENCES "Record"("uri") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_uri_fkey" FOREIGN KEY ("uri") REFERENCES "Record"("uri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
