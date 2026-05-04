export type RecoveryPdsType = "cabildo" | "bsky" | "other"

export type RecoverPasswordTokenData = {
    handle: string
    pdsType: RecoveryPdsType
}

export type RequestPasswordRecoveryBody = {
    account: string
}

export type ResetPasswordBody = {
    token: string
    newPassword: string
}

export type SendAccountRecoveryEmailBody = {
    email: string
}

export type RecoverPasswordTokenQuery = {
    token?: string
}
