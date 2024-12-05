import { ContentType, EditorStatus, NotificationType } from '@prisma/client';
import { z } from 'zod'


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

export type ParentContentProps = {
    id: string
    uri: string
    author: {did: string, handle: string}
    type: ContentType
    contribution: string,
    parentEntityId: string
}

export type ContentProps = {
    id: string
    createdAt: Date
    compressedText?: string
    compressedPlainText?: string
    author: SmallUserProps
    type: ContentType
    parentContent: ParentContentProps
    usersMentioned: {did: string}[]
    childrenTree: {authorId: string}[]

    title: string | null

    categories: string | null
    parentEntity: {id: string, isPublic: boolean, currentVersion: {searchkeys: string[]}}
    charsAdded: number,
    charsDeleted: number,
    accCharsAdded: number,
    contribution: string,
    diff: string

    fakeReportsCount: number,
    reactions: {userById: string}[],
    _count: {reactions: number, childrenTree: number},
    uniqueViewsCount: number,

    references: {entityReferenced: {id: string, versions: {id: string, categories: string}[]}}[]

    rootContent?: ParentContentProps
    ancestorContent: {id: string, authorId: string}[]

    currentVersionOf: {id: string} | null

    claimsAuthorship: boolean

    undos: {
        id: string
        reportsVandalism: boolean
        reportsOportunism: boolean
        authorId: string
        createdAt: Date | string
        compressedText?: string
    }[]
    contentUndoneId: string
    reportsOportunism: boolean
    reportsVandalism: boolean

    childrenContents: CommentProps[]

    isContentEdited: boolean

    isDraft?: boolean
}


export type CommentProps = {
    id: string
    createdAt: Date
    type: ContentType
    reactions: {userById: string}[]
    childrenTree: {authorId: string}[]
    author: {did: string}
    uniqueViewsCount: number
}


export type ReferenceProps = {
    isStrong: boolean
    referencingContent: {
        id: string
        createdAt: Date
        type: ContentType
        author: {
            id: string
        },
        uniqueViewsCount: number
        childrenTree: {authorId: string, createdAt: Date}[]
        reactions: {userById: string, createdAt: Date}[]
        currentVersionOf: {
            id: string
        }
        parentEntityId: string
    }
}


export type BothContributionsProps = {
    monetized: [string, number][]
    all: [string, number][]
}


export type EntityProps = {
    id: string
    name: string
    protection: string
    isPublic: boolean,
    versions: EntityVersionProps[]
    referencedBy: ReferenceProps[]
    deleted: boolean,
    currentVersionId: string
    currentVersion: {
        categories: string
        searchkeys: string[]
        compressedText: string
    }
}


export type EntityVersionProps = {
    id: string,
    type: ContentType
    categories: string,
    createdAt: Date,
    confirmedById?: string,
    rejectedById?: string,
    compressedText?: string
    author: {
        did: string
        handle: string
        displayName: string
    }
    editPermission: boolean,
    accCharsAdded: number,
    charsAdded: number
    charsDeleted: number
    contribution: string
    childrenContents: CommentProps[]
    diff: string
    claimsAuthorship: boolean,
    undos: {
        id: string
        reportsVandalism: boolean
        reportsOportunism: boolean
        authorId: string
        createdAt: Date
        compressedText: string
    }[]
    uniqueViewsCount: number
    editMsg?: string
    references: {entityReferenced: {id: string}}[]
}

export type ContributionsProps = [string, number][]

export type SmallEntityProps = {
    id: string,
    name: string,
    versions: {
        id: string,
        categories: string,
        createdAt: Date,
        authorId: string
        numWords: number
        childrenTree: {authorId: string, createdAt: Date}[]
        reactions: {userById: string}[]
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
    views?: number,
    reactions?: {userById: string, createdAt: Date}[]
    currentVersionId: string
    currentVersion: {searchkeys: string[]}
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
    email?: string
    createdAt: Date
    editorStatus: EditorStatus
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
    _count: {notifications: number, contents: number}
    closedFollowSuggestionsAt?: Date | string
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

export type NotificationProps = {
    id: string
    content: {
        id: string
        author: {id: string, handle: string}
        type: ContentType
        contribution: string
        parentEntityId: string
        uri: string
        parentContent: ParentContentProps
    }
    reactionId?: string
    createdAt: Date
    userById: string
    userNotifiedId: string
    viewed: boolean
    type: NotificationType
}


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}