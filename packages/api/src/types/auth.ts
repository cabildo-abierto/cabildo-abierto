export type PublicUser = {
    id: string
    username: string
}

export type RegisterInput = {
    username: string
    email: string
    password: string
    registrationPassword: string
}

export type LoginInput = {
    identifier: string
    password: string
}

export type AuthOutput = {
    user: PublicUser
}

export type SessionOutput = {
    user: PublicUser | null
}
