/** Host PDS for password-recovery UX (cabildo vs Bluesky vs other). */
export type RecoveryPdsType = "cabildo" | "bsky" | "other"

/** GET /recover-password-token success payload */
export type RecoverPasswordTokenData = {
    handle: string
    pdsType: RecoveryPdsType
}

/** POST /request-password-recovery */
export type RequestPasswordRecoveryBody = {
    account: string
}

/** POST /reset-password */
export type ResetPasswordBody = {
    token: string
    newPassword: string
}

/** POST /send-account-recovery-email */
export type SendAccountRecoveryEmailBody = {
    email: string
}

/** Query for GET /recover-password-token (Express merges into params for handlers). */
export type RecoverPasswordTokenQuery = {
    token?: string
}
