import { ContentType } from '@prisma/client';
import { z } from 'zod'
import { ShortDescriptionProps } from '../../components/comment-in-context';


export type SmallUserProps = {
    id: string,
    name: string,
    following?: {id: string}[],
    contents?: {
        _count: {reactions: number},    
        uniqueViewsCount: number
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
    createdAt: string | Date
    compressedText?: string
    compressedPlainText?: string
    author: SmallUserProps
    type: ContentType
    parentContents?: ShortDescriptionProps[]
    usersMentioned: {id: string}[]
    childrenTree: {authorId: string}[]

    title: string | null

    categories: string | null
    parentEntityId: string | null
    parentEntity: {id: string, isPublic: boolean, currentVersion: {searchkeys: string[]}}
    charsAdded: number,
    charsDeleted: number,
    accCharsAdded: number,
    contribution: string,
    diff: string

    fakeReportsCount: number,
    reactions?: {id: string}[],
    views?: {id: string}[],
    _count: {reactions: number, childrenTree: number},
    uniqueViewsCount: number,

    entityReferences: {id: string, versions: {id: string, categories: string}[]}[]

    rootContent?: ShortDescriptionProps
    ancestorContent: {id: string, authorId: string}[]

    currentVersionOf: {id: string} | null

    claimsAuthorship: boolean

    stallPaymentUntil: Date | string

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
    id: string | null
    createdAt: Date | string
    type: ContentType
    _count: {childrenTree: number}
}


export type ReferenceProps = {
    id: string
    createdAt: string | Date
    type: string
    author: {
        id: string
        name: string
    },
    _count: {
        reactions: number
        childrenTree: number
    },
    currentVersionOf: {
        id: string
    }
    parentEntityId?: string
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
    uniqueViewsCount: number
    weakReferences: ReferenceProps[]
    currentVersion: {
        categories: string
        searchkeys: string[]
        compressedText: string
    }
}


export type EntityVersionProps = {
    id: string,
    categories: string,
    createdAt: string | Date,
    confirmedById?: string,
    rejectedById?: string,
    compressedText?: string
    author: {
        id: string
        name: string
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
        createdAt: Date | string
        compressedText?: string
    }[]
    _count: {
        reactions: number
    }
    uniqueViewsCount: number
    editMsg?: string
    entityReferences: {id: string}[]
    weakReferences: {id: string}[]
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
        authorId: string
        reactions: {userById: string, createdAt: Date}[]
        childrenTree: {authorId: string, createdAt: Date, reactions: {userById: string, createdAt: Date}[]}[]
        createdAt: Date
    }[]
    weakReferences: {
        authorId: string
        createdAt: Date
        reactions: {userById: string, createdAt: Date}[]
        childrenTree: {authorId: string, createdAt: Date, reactions: {userById: string, createdAt: Date}[]}[]
    }[]
    views?: number,
    reactions?: {userById: string, createdAt: Date}[],
    uniqueViewsCount: number
    currentVersionId: string
    currentVersion: {searchkeys: string[]}
}


export type SubscriptionProps = {
    id: string
    userId?: string
    createdAt: string | Date
    boughtByUserId: string
    usedAt: string | Date | null
    endsAt: string | Date | null
    price: number
}


export type UserProps = {
    id: string
    name: string
    createdAt: string | Date
    authenticated: Boolean
    editorStatus: string
    subscriptionsUsed: SubscriptionProps[]
    subscriptionsBought: {id: string, price: number}[]
    following: {id: string}[]
    followedBy: {id: string}[]
    authUser: {email: string | null} | null
    description: string | null
    _count: {notifications: number, contents: number, views: number}
    closedFollowSuggestionsAt?: Date | string
};


export const SignupFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Tiene que tener al menos 2 caracteres.' })
        .trim(),
    email: z.string().email({ message: 'Ingresá un mail válido.' }).trim(),
    username: z
        .string()
        .min(2, { message: 'Tiene que tener al menos 2 caracteres.' })
        .regex(/^[a-zA-Z0-9]+$/, {
            message: 'Solo puede contener letras y números.',
        })
        .trim(),
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


export type SmallContentProps = {
    id: string
    author: {name: string, id: string}
    type: ContentType
    compressedPlainText?: string
    title?: string
    createdAt?: string | Date
    entityReferences?: {id: string, versions: {id: string, categories: string}[]}[]
    weakReferences?: {id: string, versions: {id: string, categories: string}[]}[]
    _count: {reactions: number, childrenTree: number}
    currentVersionOf?: {id: (string | null)}
    fakeReportsCount?: number;
    uniqueViewsCount?: number
    childrenTree: {authorId: string}[]
}


export type FeedContentProps = {
    id: string
    author: {id: string, name: string}
    createdAt: Date | string
    type: string
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
        id: string,
        authorId: string,
        type: string,
        contribution: string,
        parentEntityId: string
        parentContents: {
            id: string
            authorId: string,
            type: string,
            contribution: string,
            parentEntityId: string
        }[]
    }
    reactionId?: string
    createdAt: string | Date
    userById: string
    userNotifiedId: string
    viewed: boolean
    type: string
}


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}