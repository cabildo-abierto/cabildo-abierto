import { ContentType } from '@prisma/client';
import { z } from 'zod'


export type SmallUserProps = {
    id: string,
    name: string
}

export type ContentProps = {
    id: string
    createdAt: string
    text: string
    author: SmallUserProps
    _count: {
        reactions: number
        views: number
    }
    type: ContentType
    isDraft: boolean | null
    childrenContents: {id: string, createdAt: string, type: string}[]
    parentContents: {id: string}[]
    title: string | null
    categories: string | null
    isUndo: boolean
    undoMessage: string | null
}


export type EntityProps = {
    id: string
    name: string
    versions: {id: string, categories: string, isUndo: boolean, undoMessage: string, createdAt: string}[]
    protection: string
    isPublic: boolean,
    referencedBy: {id: string, createdAt: string}[]
    _count: {reactions: number}
}


export type SmallEntityProps = {
    id: string,
    name: string,
    versions: {id: string, categories: string, createdAt: string}[]
    _count: {reactions: number, referencedBy: number}
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
    reactions: {contentId: string | null, entityId: string | null}[]
    followedBy: {id: string}[]
    authUser: {email: string | null} | null
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
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Tiene que tener al menos un caracter especial.',
        })
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