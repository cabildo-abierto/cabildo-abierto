export type TopicSummary = {
    id: string
    title: string
}

export type CreateTopicInput = {
    title: string
}

export type CreateTopicOutput = {
    topic: TopicSummary
}

export type SearchTopicsOutput = {
    topics: TopicSummary[]
}

export type TopicOutput = {
    topic: TopicSummary
}

export type BlockType = {
    id: "parrafo" | "h1" | "h2"
    name: string
}

export type TopicBlock = {
    id: string
    blockNumber: string
    typeId: BlockType["id"]
    content: string
    order: string
    commentCount: number
}

export type TopicBlocksOutput = {
    blocks: TopicBlock[]
    blockTypes: BlockType[]
}

export type TopicBlockVersion = TopicBlock & {
    createdAt: string
    message: string | null
    author: {
        id: string
        username: string
    }
}

export type BlockComment = {
    id: string
    commentNumber: string
    blockVersionId: string
    rootId: string
    replyToId: string
    directReplyCount: number
    deleted: boolean
    content: string
    createdAt: string
    author: {
        id: string
        username: string
    }
}

export type BlockCommentsOutput = {
    comments: BlockComment[]
}

export type CreateBlockCommentInput = {
    blockVersionId: string
    replyToId?: string
    content: string
}

export type CreateBlockCommentOutput = {
    comment: BlockComment
}

export type TopicBlockVersionsOutput = {
    versions: TopicBlockVersion[]
}

export type SaveTopicEditBlockInput = {
    id: string | null
    blockNumber: string | null
    typeId: BlockType["id"]
    content: string
    order: string
    deleted: boolean
}

export type SaveTopicEditInput = {
    blocks: SaveTopicEditBlockInput[]
    message?: string | null
}

export type SaveTopicEditOutput = {
    blocks: TopicBlock[]
}
