import { ContentType, EditorStatus, NotificationType } from '@prisma/client';
import { z } from 'zod'
import { ShortDescriptionProps } from '../../components/comment-in-context';


export type SmallUserProps = {
    id: string
    displayName: string
    handle: string
    contents?: {
        _count: {reactions: number}
    }[]
}


export type UserMonthDistributionProps = {
    userId: string
    reactions: {createdAt: Date, id: string}[],
    views: {createdAt: Date, id: string}[]
    start: Date
    end: Date
}

export type ContentProps = {
    id: string
    createdAt: Date
    compressedText?: string
    compressedPlainText?: string
    author: SmallUserProps
    type: ContentType
    parentContents?: ShortDescriptionProps[]
    usersMentioned: {id: string}[]
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

    rootContent?: ShortDescriptionProps
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
    author: {id: string}
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
        id: string
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

export type ContributionsArray = ContributionsProps[]

export type ErrorProps = {error: string}

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
    id: string
    handle: string
    displayName: string
    description: string
    avatar: string
    banner: string
    email: string
    createdAt: Date
    following: {id: string}[]
    followers: {id: string}[]
    editorStatus: EditorStatus
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
    _count: {notifications: number, contents: number}
    closedFollowSuggestionsAt?: Date | string
};


export const UsernameFormSchema = z.object({
    username: z
        .string()
        .min(2, { message: 'Tiene que tener al menos 2 caracteres.' })
        .regex(/^[a-zA-Z0-9]+$/, {
            message: 'Solo puede contener letras y números.',
        })
        .trim()
})

const nameReqs = z
    .string()
    .min(2, { message: 'Tiene que tener al menos 2 caracteres.' })
    .max(60, { message: 'Como máximo 60 caracteres.' })
    .trim()

export const NameFormSchema = z.object({
    name: nameReqs
})


export const SignupFormSchema = z.object({
    name: nameReqs,
    email: z.string().email({ message: 'Ingresá un mail válido.' }).trim(),
    password: z
        .string()
        .min(8, { message: 'Tiene que tener al menos 8 caracteres.' })
        .regex(/[a-zA-Z]/, { message: 'Tiene que tener al menos una letra.' })
        .regex(/[0-9]/, { message: 'Tiene que tener al menos un número.' })
        .trim()
});


export const LoginFormSchema = z.object({
    email: z.string().email({ message: 'Ingresá un mail válido.' }).trim(),
    password: z
        .string()
        .min(1, { message: 'Ingresá tu contraseña' })
})


export const RecoverPwFormSchema = z.object({
    email: z.string().email({ message: 'Ingresá un mail válido.' }).trim()
});


export const UpdatePwFormSchema = z.object({
    password: z
        .string()
        .min(8, { message: 'Tiene que tener al menos 8 caracteres.' })
        .regex(/[a-zA-Z]/, { message: 'Tiene que tener al menos una letra.' })
        .regex(/[0-9]/, { message: 'Tiene que tener al menos un número.' })
        .trim(),
});


export type LoadingUser = {
    user: UserProps,
    isLoading: boolean,
    isError: boolean
}


export type LoadingEntities = {
    entities: EntityProps[]
    isLoading: boolean
    isError: boolean
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


export type SearchkeysProps = {
    id: string
    keys: string[]
}[]


export type FeedContentProps = {
    id: string
    author: {id: string, name: string}
    createdAt: Date | string
    type: ContentType
    compressedText: string
    compressedPlainText: string
    title?: string
    childrenTree: {id: string, authorId: string}[]
    childrenContents: CommentProps[]
    _count: {reactions: number}
    uniqueViewsCount: number
    parentEntityId?: string
}

export type NotificationProps = {
    id: string
    content: {
        id: string
        authorId: string
        type: ContentType
        contribution: string
        parentEntityId: string
        parentContents: {
            id: string
            authorId: string
            type: ContentType
            contribution: string,
            parentEntityId: string
        }[]
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