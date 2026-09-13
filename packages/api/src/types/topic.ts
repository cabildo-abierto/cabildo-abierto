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

export type TopicConnectionMode = "reading" | "editing"

export type TopicConnectionCounts = {
    reading: number
    editing: number
}

export type TopicConnectionsChangedEvent = {
    type: "connections.changed"
    topicId: string
    connections: TopicConnectionCounts
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
    editId: string
    createdAt: string
    message: string | null
    rejected: boolean
    current: boolean
    acceptCount: number
    rejectCount: number
    replicatedRejectCount: number
    userReaction: "accept" | "reject" | null
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
    rejection: boolean
    suggestedVote: "accept" | "reject" | null
    replicaDepth: number | null
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
    reject?: boolean
    replica?: boolean
}

export type CreateBlockReactionInput = {
    type: "accept"
}

export type DeleteBlockReactionInput = {
    deleteReason?: boolean
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
