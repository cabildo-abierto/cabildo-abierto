import {EditorStatus} from '@prisma/client';


export type ATProtoStrongRef = {
    uri: string
    cid: string
}

export type RecordProps = {
    uri?: string
    cid?: string
    collection: string
    createdAt?: Date
    rkey?: string
    author: {
        did: string
        handle: string
        displayName?: string
        avatar?: string
        inCA?: boolean
    }
}

export type FastPostReplyProps = {
    parent: ATProtoStrongRef
    root: ATProtoStrongRef
}


export type TopicVersionProps = RecordProps & {
    content: {
        text: string
        format?: string
        textBlob: {
            cid: string,
            authorId: string
        },
        topicVersion: {
            topicId: string
            message: string
            title?: string

            diff?: string
            charsAdded?: number
            charsDeleted?: number
            accCharsAdded?: number
            contribution?: string

            authorship: boolean

            categories?: string
            synonyms?: string
        }
    }
}


export type TopicProps = {
    id: string
    protection: EditorStatus
    synonyms: string[]
    categories: {
        categoryId: string
    }[]
    currentVersion: {
        uri: string
        content: {
            text: string
            format?: string
            record: {
                cid: string
                author: {
                    did: string
                    handle: string
                    displayName?: string
                    avatar?: string
                }
                createdAt: Date
            }
        }
    }
}


export type TopicHistoryProps = {
    id: string
    versions: {
        uri: string
        cid: string
        collection: string
        author: {
            did: string
            handle: string
            displayName: string
            avatar: string
        }
        content: {
            hasText: boolean
            topicVersion: {
                charsAdded: number
                charsDeleted: number
                accCharsAdded: number
                contribution: string
                message: string
                diff: string
                title: string
                categories: string
                synonyms: string
            }
        }
        createdAt: Date
        uniqueAccepts: number
        uniqueRejects: number
    }[]
}


export type TopicVersionAuthorsProps = {
    text: string
}


export type SmallTopicProps = {
    id: string
    popularityScore?: number
    synonyms?: string[]
    categories: {
        categoryId: string
    }[]
    lastEdit?: Date
}


export type TopicSortOrder = "popular" | "recent"


export type TopicsGraph = {
    nodeIds: string[]
    edges: {x: string, y: string}[]
    nodeLabels?: {id: string, label: string}[]
}


export type ReasonProps = {
    reason?: {
        createdAt: Date
        collection: string
        by: SmallUserProps
    }
}
export type FeedContentProps = ((FastPostProps | ArticleProps | DatasetProps | VisualizationProps | TopicVersionOnFeedProps | {}) & RecordProps & EngagementProps & ReasonProps)
export type FeedContentPropsMaybe = FeedContentProps & {blocked?: boolean, notFound?: boolean}

export type SmallUserProps = {
    did: string
    handle: string
    displayName?: string
    avatar?: string
    inCA?: boolean
    CAProfileUri?: string
}


export type BothContributionsProps = {
    monetized: [string, number][]
    all: [string, number][]
}

export type ContributionsProps = [string, number][]


export type FeedEngagementProps = {
    likes: {likedRecordId: string; uri: string}[]
    reposts: {repostedRecordId: string; uri: string}[]
}



export type SubscriptionProps = {
    id: string
    userId?: string
    createdAt: Date
    boughtByUserId: string
    usedAt: Date | null
    endsAt: Date | null
    price: number
}


export type UserProps = {
    did: string
    handle: string
    displayName?: string
    avatar?: string
    banner?: string
    description?: string
    hasAccess: boolean
    email?: string
    inCA: boolean
    CAProfileUri?: string
    createdAt: Date
    editorStatus: EditorStatus
    platformAdmin: boolean
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
    viewer?: {following?: string, followed?: string}
    followersCount: number
    followsCount: number
    messagesSent: MessageProps[]
    messagesReceived: MessageProps[]
    usedInviteCode?: {
        code: string
    }
};


export type MessageProps = {
    createdAt: Date,
    id: string,
    text: string,
    fromUserId: string,
    toUserId: string,
    seen: boolean
}


export type UserStats = {
    posts: number
    entityEdits: number
    editedEntities: number
    reactionsInPosts: number
    reactionsInEntities: number
    income: number
    pendingConfirmationIncome: number
    pendingPayIncome: number
    entityAddedChars: number
    viewsInPosts: number
    viewsInEntities: number
}


export type ArticleProps = RecordProps & EngagementProps & {
    content: {
        text?: string
        numWords?: number
        article: {
            title: string
        }
        references: {
            referencedTopicId: string
            count: number
        }[]
    }
}

export type EngagementProps = {
    likeCount?: number
    repostCount?: number
    replyCount?: number
    viewer?: {like?: string, repost?: string}
    participantsCount?: number
    uniqueViewsCount?: number
    visualizationsUsingCount?: number
}

export type FastPostProps = RecordProps & EngagementProps & {
    content: {
        text: string
        post: {
            facets?: string
            embed?: string
            replyTo?: (FeedContentPropsMaybe | ATProtoStrongRef) & {collection?: string, uri: string, notFound?: boolean}
            root?: (FeedContentPropsMaybe | ATProtoStrongRef) & {collection?: string, uri: string, notFound?: boolean}
            grandparentAuthor?: SmallUserProps
            quote?: string
            visualization?: VisualizationProps
        }
    }
}


export type TopicVersionOnFeedProps = RecordProps & EngagementProps & {
    content: {
        numWords?: number
        topicVersion: {
            title?: string
            topic: {
                id: string
            }
            message?: string
            charsAdded?: number
            charsDeleted?: number
        }
    }
}


export type ThreadProps = {
    post: FeedContentProps
    replies?: FastPostProps[]
}

export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}


export type DatasetProps = RecordProps & {
    dataset: {
        title: string
        columns: string[]
        columnValues?: {column: string, values: any[]}[] | Map<string, any[]>
        description?: string
        dataBlocks: {
            record: RecordProps,
            format: string,
            blob: {
                cid: string
                authorId: string
            }
        }[]
    }
    visualizationsUsing: {
        uri: string
    }[]
}


export type PlotConfigProps = {
    datasetUri?: string
    filters?: FilterProps[]
    kind?: string
    [key: string]: any
}


export type FilterProps = {
    value: any
    op: string
    column: string
}


export type VisualizationProps = RecordProps & {
    visualization: {
        spec: string
        dataset?: {
            uri: string
            dataset: {
                title: string
            }
        }
        previewBlobCid?: string
    }
}



export type JetstreamEvent = {
    did: string
    kind: "commit" | "update" | "identity" | "account"
    time_us: number
}



export type CommitEvent = JetstreamEvent & {
    commit: {
        collection: string
        operation: "create" | "delete"
        rkey: string
        cid: string
        uri: string
        record?: {
            createdAt?: string
            reply?: any
        }
    }
}


export type SyncRecordProps = {
    did: string
    uri: string
    collection: string
    rkey: string
    cid: string
    record: any
}


export type UserRepo = {
    did: string
    uri: string
    collection: string
    rkey: string
    record: any
    cid: string
}[]


export type LexicalJSONNode = any