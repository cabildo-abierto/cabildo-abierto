import type {TopicSummary, BlockComment} from "./topic";

export type TopicTitleEdit = {
    id: string
    topic: TopicSummary
    title: string
    slug: string
    message: string | null
    initial: boolean
    createdAt: string
    author: {id: string; username: string}
    status: "current" | "accepted" | "rejected" | "deleted"
    acceptCount: number
    rejectCount: number
    replicatedRejectCount: number
    commentCount: number
    userReaction: "accept" | "reject" | null
};
export type CreateTopicTitleEditInput = {title: string; message: string};
export type TopicTitleEditOutput = {edit: TopicTitleEdit};
export type TopicTitleEditsOutput = {edits: TopicTitleEdit[]; nextCursor: string | null};
export type DiscussionComment = Omit<BlockComment, "blockVersionId">;
export type DiscussionCommentsOutput = {comments: DiscussionComment[]};
export type CreateDiscussionCommentInput = {content: string; replyToId?: string; reject?: boolean; replica?: boolean};
