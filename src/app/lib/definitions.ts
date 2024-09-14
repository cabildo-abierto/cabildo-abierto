import { ContentType } from '@prisma/client';
import { z } from 'zod'


export type SmallUserProps = {
    id: string,
    name: string
}

export type ContentProps = {
    id: string
    createdAt: string | Date
    text: string
    author: SmallUserProps
    type: ContentType
    parentContents: {id: string}[]

    title: string | null

    categories?: string | null
    isUndo?: boolean
    undoMessage?: string | null
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

    childrenContents?: {id: string, createdAt: Date | string, type: ContentType}[],
    entityReferences?: {id: string, versions: {id: string, categories: string}[]}[]

    rootContentId: string
    ancestorContent?: {id: string}[]
}


export type EntityProps = {
    id: string
    name: string
    protection: string
    isPublic: boolean,
    versions: {
        id: string,
        categories: string,
        isUndo: boolean,
        undoMessage: string,
        createdAt: string | Date,
        text: string,
        authorId: string,
        childrenContents: {
            id: string
            type: ContentType
            _count: {childrenTree: number}
        }[]
    }[]
    referencedBy: SmallContentProps[]
    deleted: boolean
}


export type ContributionsArray = [string, number][][]


export type SmallEntityProps = {
    id: string,
    name: string,
    versions: {
        id: string,
        categories: string,
        createdAt: Date | string,
        isUndo: boolean,
        undoMessage: string,
        authorId: string,
        _count: {childrenTree: number, reactions: number}
    }[]
    _count: {referencedBy: number, reactions: number},
    views?: number,
    textLength?: number,
    childrenCount?: number,
    reactions?: number,
    uniqueViewsCount: number
}


export type SubscriptionProps = {
    id: string
    createdAt: string | Date
    boughtByUserId: string
    usedAt: string | Date | null
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
    _count: {notifications: number}
};


export const SignupFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Tiene que tener al menos 2 caracteres.' })
        .trim(),
    email: z.string().email({ message: 'Ingresá un email válido.' }).trim(),
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
    email: z.string().email({ message: 'Ingresá un email válido.' }).trim(),
    password: z
        .string()
        .min(1, { message: 'Ingresá tu contraseña' })
})


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
    entityAddedChars: number
    viewsInPosts: number
    viewsInEntities: number
}




export type SmallContentProps = {
    id: string
    type?: ContentType
    text?: string
    title?: string
    createdAt?: string | Date
    entityReferences?: {id: string, versions: {id: string, categories: string}[]}[]
    _count: {reactions: number, childrenTree: number}
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