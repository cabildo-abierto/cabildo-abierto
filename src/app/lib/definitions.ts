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
    versions: TopicVersionProps[]
    protection: EditorStatus
    currentVersion: {
        uri: string
    }
}


export type TrendingTopicProps = {
    id: string
    score: number[]
    currentVersion: {
        uri: string
    }
    versions: {
        uri: string
        title?: string
        categories?: string
        content: {
            numWords: number
            record: {
                createdAt: Date,
                author: {
                    handle?: string
                }
            }
        }
    }[]
}


export type FeedContentProps = FeedContentPropsNoRepost | RepostProps

export type FeedContentPropsNoRepost = (FastPostProps | ArticleProps | DatasetProps | VisualizationProps | TopicVersionOnFeedProps) & EngagementProps

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
    createdAt: Date
    editorStatus: EditorStatus
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
    viewer?: {following?: string, followed?: string}
    followersCount: number
    followsCount: number
};


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
        text: string
        numWords?: number
        article: {
            title: string
            format: string
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
}

export type FastPostProps = RecordProps & EngagementProps & {
    content: {
        text: string
        post: {
            facets?: string
            embed?: string
            replyTo?: {uri: string, cid: string}
            root?: {uri: string, cid: string}
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
            topicId: string
            message?: string
            charsAdded?: number
            charsDeleted?: number
        }
    }
}


export type RepostProps = RecordProps & {
    reaction: {
        reactsTo: FeedContentPropsNoRepost
    }
}


export type ThreadProps = {
    post: FeedContentProps
    replies: FastPostProps[]
}


export type FeedContentReasonProps = {
    $type: string
    by: any
    indexedAt: string
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
        dataBlocks: {
            record: RecordProps,
            format: string,
            blob: {
                cid: string
                authorId: string
            }
        }[]
    }
}


export type PlotConfigProps = {
    dataset?: DatasetProps
    filters?: FilterProps[]
    kind?: string
    [key: string]: any
}


export type FilterProps = {
    value: any
    op: "igual a" | "distinto de"
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