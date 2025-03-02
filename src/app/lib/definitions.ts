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


export type BasicUserProps = {
    did: string
    handle: string
    avatar?: string
    displayName?: string
}


export type TopicVersionContentProps = {
    text?: string
    textBlob?: {
        cid: string,
        authorId: string
    }
    format: string
    record: {
        uri: string
        cid: string
        author: BasicUserProps
        createdAt: Date
        reactions?: {
            record: {
                authorId: string
                collection: string
            }
        }[]
        replies?: {
            content: {
                text: string
                record: RecordProps
            }
        }[]
    }
}


export type TopicVersionProps = {
    uri: string
    content: TopicVersionContentProps

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


export type TopicProps = {
    id: string
    referencedBy: {
        referencingContent: {
            topicVersion: {
                topicId: string
            }
        }
    }[]
    versions: TopicVersionProps[]
    protection: EditorStatus
}


export type TrendingTopicProps = {
    id: string
    score: number[]
    categories: string[]
}


export type SmallTopicProps = {
    id: string
    score?: number[]
    versions: {
        uri: string
        title?: string
        categories?: string
        content: {
            numWords?: number
            record: {
                createdAt: Date,
                author: {
                    handle?: string
                }
            }
        }
    }[]
}

export type MapTopicProps = {
    id: string
    versions: {
        categories: string
    }[]
    referencedBy: {
        referencingContent: {
            topicVersion: {
                topicId: string
            }
        }
    }[]
    score?: number[]
    lastEdit?: Date
}


export type TopicsGraph = {
    nodeIds: string[]
    edges: {x: string, y: string}[]
    nodeLabels?: {id: string, label: string}[]
}


type ReactionProps = {
    reactions?: {
        record: {
            uri: string,
            collection: string
            author: {did: string, handle: string, displayName?: string}
            createdAt: Date
        }
    }[]
}
export type ReasonProps = {
    reason?: {
        createdAt: Date
        collection: string
        by: SmallUserProps
    }
}
export type FeedContentProps = ((FastPostProps | ArticleProps | DatasetProps | VisualizationProps | TopicVersionOnFeedProps | {}) & RecordProps & EngagementProps & ReactionProps & ReasonProps)
export type FeedContentPropsMaybe = FeedContentProps & {blocked?: boolean, notFound?: boolean}

export type SmallUserProps = {
    did: string
    handle: string
    displayName?: string
    avatar?: string
}


export type UserMonthDistributionProps = {
    userId: string
    reactions: {createdAt: Date, id: string}[],
    views: {createdAt: Date, id: string}[]
    start: Date
    end: Date
}


export type BothContributionsProps = {
    monetized: [string, number][]
    all: [string, number][]
}

export type ContributionsProps = [string, number][]


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
    createdAt: Date
    editorStatus: EditorStatus
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
    viewer?: {following?: string, followed?: string}
    followersCount: number
    followsCount: number
    messagesSent: MessageProps[]
    messagesReceived: MessageProps[]
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


export type EmbedProps = {
    $type: string,
    images?: {thumb: string, fullsize: string, aspectRatio?: {width: number, height: number}, alt: string}[]
    media?: {images?:
            {thumb: string, fullsize: string, aspectRatio?: {width: number, height: number}, alt: string}[]
    }
    record?: {
        uri: string
        value?: {
            createdAt: string;
            $type: string
            text: string;
            facets?: any[]
            embed?: EmbedProps
        }
        $type: string
        text: string
        facets?: any[]
        author: {displayName?: string, handle: string, avatar?: string}
    }
}


/*export type FastPostProps = {
    facets?: string
    embed?: string
    content: {
        text: string
        record: {
            cid: string
            uri: string
            createdAt: Date
            author: SmallUserProps
            collection: string
        }
    }
    likeCount: number
    repostCount: number
    replyCount: number
    viewer?: {like?: string, repost?: string}
}*/


export type ArticleProps = RecordProps & EngagementProps & {
    content: {
        text?: string
        numWords?: number
        article: {
            title: string
        }
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
                versions: {
                    uri: string
                    title: string
                }[]
            }
            message?: string
            charsAdded?: number
            charsDeleted?: number
        }
    }
}


export type RepostProps = RecordProps & {
    reaction: {
        reactsTo: FeedContentProps
    }
}


export type ThreadProps = {
    post: FeedContentProps
    replies: FastPostProps[]
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
        columnValues?: Map<string, any[]>
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

export type FilterOption = "igual a" | "distinto de" | "uno de"

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