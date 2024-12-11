import {EditorStatus} from '@prisma/client';


export type TopicProps = {
    id: string
    versions: TopicVersionProps[]
    protection: EditorStatus
    currentVersion: {
        cid: string,
        synonyms: string[]
    }
}


export type TopicVersionProps = {
    topicId: string
    uri: string
    createdAt: Date
    text: string
    author: {did: string, handle: string}
    cid: string
    message: string
    title?: string

    diff?: string
    charsAdded?: number
    charsDeleted?: number
    accCharsAdded?: number
    contribution?: string

    authorship: boolean

    accepts: TopicVersionAccept[]
    rejects: TopicVersionReject[]

    categories?: string
    synonyms?: string[]
}


export type TopicVersionAccept = {
    uri: string
    cid: string
    createdAt: Date
    author: {
        did: string
        handle: string
    }
}


export type TopicVersionReject = {
    uri: string
    cid: string
    createdAt: Date
    text: string
    author: {
        did: string
        handle: string
    }
}


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

export type SmallTopicProps = {
    id: string
    currentVersion: {cid: string, synonyms: string[]}
    versions: {
        cid: string
        title: string
        categories: string
        createdAt: Date
        authorId: string
        numWords: number
        childrenTree: {authorId: string, createdAt: Date}[]
        synonyms: string[]
    }[]
    referencedBy: {
        isStrong: boolean
        referencingContent: {
            authorId: string
            reactions: {userById: string, createdAt: Date}[]
            childrenTree: {authorId: string, createdAt: Date, reactions: {userById: string, createdAt: Date}[]}[]
            createdAt: Date
        }
    }[]
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
    hasAccess: boolean
    email?: string
    createdAt: Date
    editorStatus: EditorStatus
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
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


export type FastPostProps = {
    uri: string
    cid: string
    author: {
        did: string;
        handle: string, displayName?: string, avatar?: string}
    record: {
        text: string,
        facets?: any[],
        title?: string,
        createdAt: string,
        $type: string
        reply?: {
            parent: FastPostProps
            root?: FastPostProps
        }
    }
    likeCount: number
    repostCount: number
    quoteCount: number
    replyCount: number
    viewer: {like?: string, repost?: string}
    embed?: EmbedProps
}


export type ArticleProps = FastPostProps


export type FeedContentReasonProps = {
    $type: string
    by: any
    indexedAt: string
}


export type FeedContentProps = {
    post: FastPostProps
    reason?: FeedContentReasonProps
}


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}