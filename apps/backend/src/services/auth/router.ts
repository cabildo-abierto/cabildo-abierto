import {AppContext} from "#/setup.js";
import express, {Router} from "express";
import path from "path";
import {makeEffHandler, makeEffHandlerNoAuth} from "#/utils/handler.js";
import {
    loginHandler,
    oauthCallbackHandler,
    signupHandler
} from "#/services/user/access.js";
import {handler, sessionAgent} from "#/utils/session-agent.js";
import {deleteSession, saveNewEmail} from "#/services/user/users.js";
import {
    requestPasswordRecovery,
    resetPassword,
    sendAccountRecoveryEmail,
    verifyRecoverPasswordToken
} from "#/services/user/recovery.js";
import {sendVerificationEmail, verifyEmailFromToken} from "#/services/user/email-verification.js";
import {changeHandle, verifyCustomDomainHandle} from "#/services/user/handle.js";


export const authRouter = (ctx: AppContext): Router => {
    const router = express.Router()

    router.get('/client-metadata.json', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json')
        return res.sendFile(path.join(process.cwd(), 'public', 'client-metadata.json'))
    })

    router.post('/login', makeEffHandlerNoAuth(ctx, loginHandler))

    router.get('/oauth/callback', oauthCallbackHandler(ctx))

    router.post('/logout', async (req, res) => {
        const agent = await sessionAgent(req, res, ctx)
        if (agent.hasSession()) {
            await deleteSession(ctx, agent)
        }

        return res.status(200).json({})
    })

    router.post("/signup", makeEffHandlerNoAuth(ctx, signupHandler))

    router.post("/email", makeEffHandler(ctx, saveNewEmail))

    router.post("/handle", makeEffHandler(ctx, changeHandle))

    router.post("/handle/verify-domain", makeEffHandler(ctx, verifyCustomDomainHandle))

    router.post("/send-verification-email", makeEffHandler(ctx, sendVerificationEmail))

    router.get("/verify-email", makeEffHandler(ctx, verifyEmailFromToken))

    router.post("/request-password-recovery", handler(makeEffHandlerNoAuth(ctx, requestPasswordRecovery)))

    router.get("/recover-password-token", handler(makeEffHandlerNoAuth(ctx, verifyRecoverPasswordToken)))

    router.post("/reset-password", handler(makeEffHandlerNoAuth(ctx, resetPassword)))

    router.post("/send-account-recovery-email", handler(makeEffHandlerNoAuth(ctx, sendAccountRecoveryEmail)))


    return router
}