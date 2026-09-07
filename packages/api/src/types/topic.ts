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
}

export type TopicBlocksOutput = {
    blocks: TopicBlock[]
    blockTypes: BlockType[]
}

export type TopicBlockVersion = TopicBlock & {
    createdAt: string
    author: {
        id: string
        username: string
    }
}

export type TopicBlockVersionsOutput = {
    versions: TopicBlockVersion[]
}

export type SaveBlockInput = {
    typeId: BlockType["id"]
    content: string
}

export type SaveBlockOutput = {
    block: TopicBlock
}
