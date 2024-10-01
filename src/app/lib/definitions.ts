import { ContentType } from '@prisma/client';
import { z } from 'zod'


export type SmallUserProps = {
    id: string,
    name: string
}

export type ContentProps = {
    id: string
    createdAt: string | Date
    compressedText?: string
    author: SmallUserProps
    type: ContentType
    parentContents: {id: string}[]

    title: string | null

    categories?: string | null
    parentEntityId?: string | null
    charsAdded?: number,
    charsDeleted?: number,
    accCharsAdded?: number,
    contribution?: string,
    diff?: string

    fakeReportsCount?: number,
    reactions?: {id: string}[],
    views?: {id: string}[],
    _count?: {reactions: number, childrenTree: number},
    uniqueViewsCount: number,

    childrenContents?: {
        id: string
        createdAt: Date | string
        type: ContentType
        currentVersionOf?: {id: string} | null
    }[],
    entityReferences?: {id: string, versions: {id: string, categories: string}[]}[]

    rootContentId: string
    ancestorContent?: {id: string}[]

    currentVersionOf?: {id: string} | null

    claimsAuthorship?: boolean

    stallPaymentDate?: Date | string

    undos: {
        id: string
        reportsVandalism: boolean
        reportsOportunism: boolean
        authorId: string
        createdAt: Date | string
        compressedText?: string
    }[]
    contentUndoneId?: string
    reportsOportunism?: boolean
    reportsVandalism?: boolean
}


export type EntityProps = {
    id: string
    name: string
    protection: string
    isPublic: boolean,
    versions: {
        id: string,
        categories: string,
        createdAt: string | Date,
        confirmedById?: string,
        rejectedById?: string,
        compressedText?: string
        authorId: string,
        editPermission: boolean,
        accCharsAdded: number,
        contribution: string
        childrenContents: {
            id: string
            type: ContentType
            _count: {childrenTree: number}
            currentVersionOf: {id: (string | null)}
        }[]
        diff?: string
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
    }[]
    referencedBy: SmallContentProps[]
    deleted: boolean,
    currentVersionId: string
}


export type ContributionsArray = [string, number][][]


export type SmallEntityProps = {
    id: string,
    name: string,
    versions: {
        id: string,
        categories: string,
        createdAt: Date | string,
        authorId: string,
        _count: {childrenTree: number, reactions: number},
        numWords: number
    }[]
    _count: {referencedBy: number, reactions: number},
    views?: number,
    reactions?: number,
    uniqueViewsCount: number
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
    following: {id: string}[]
    followedBy: {id: string}[]
    authUser: {email: string | null} | null
    description: string | null
    _count: {notifications: number, contents: number}
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
        .trim(),
    betakey: z.literal("cabildo24", {
        errorMap: () => ({ message: "Clave incorrecta." })
    })
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

export type SmallContentProps = {
    id: string
    type?: ContentType
    compressedPlainText?: string
    title?: string
    createdAt?: string | Date
    entityReferences?: {id: string, versions: {id: string, categories: string}[]}[]
    _count: {reactions: number, childrenTree: number}
    currentVersionOf?: {id: (string | null)}
    fakeReportsCount?: number;
}

export type NotificationProps = {
    id: string
    contentId?: string
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