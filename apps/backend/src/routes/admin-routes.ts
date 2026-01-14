import express, {Router} from 'express'
import type {AppContext} from '#/setup.js'
import {CAHandler, CAHandlerNoAuth, makeHandler} from "#/utils/handler.js";
import {syncAllUsersHandler, syncUserHandler} from "#/services/sync/sync-user.js";
import {deleteCollectionHandler, deleteUserHandler} from "#/services/delete.js";
import {createInviteCodesHandler, getAccessRequests, markAccessRequestSent} from "#/services/user/access.js";
import {getUsers} from "#/services/user/users.js";
import {
    getAllTopics,
    getTopicsInCategoryForBatchEditing,
    getTopicsWhereTitleIsNotSetAsSynonym
} from "#/services/wiki/topics.js";
import {sessionAgent} from "#/utils/session-agent.js";
import {createAccountInCabildoPDS, finishMigrationToCA, migrateToCA} from "#/services/sync/migration/migration.js";
import {
    getPendingValidationRequests,
    setValidationRequestResultHandler
} from "#/services/user/validation.js";
import {updateTopicContributionsHandler} from "#/services/wiki/contributions.js";
import {getReadSessionsPlot, getStatsDashboard} from "#/services/admin/stats/stats.js";
import {getRepoCounts} from "#/services/admin/repo.js";
import {getRegisteredJobs, startJob} from "#/jobs/worker.js";

import {clearRedisHandler} from "#/services/redis/cache.js";
import {env} from "#/lib/env.js";
import {getServerStatus} from "#/services/admin/status.js";
import {getUserMonthPayments, getUserMonthsStats} from "#/services/monetization/user-months.js";
import {getTopAuthors} from "#/services/monetization/author-dashboard.js";
import {findUsersInFollows} from "#/services/admin/otros/find-users.js";
import {getAllCAFeed} from "#/services/feed/all.js";
import {updateAllFollowingFeeds} from "#/services/feed/following/update.js";
import {getMailSubscriptions, getSentEmails} from "#/services/emails/subscriptions.js"
import {getSMTP2GOStats} from "#/services/emails/smtp2go.js";
import {
    createEmailTemplate,
    deleteEmailTemplate,
    getEmailTemplates,
    updateEmailTemplate
} from "#/services/emails/template.js";
import {sendBulkEmails} from "#/services/emails/sending.js";


function isAdmin(did: string) {
    return [
        "did:plc:2356xofv4ntrbu42xeilxjnb",
        "did:plc:rup47j6oesjlf44wx4fizu4m",
        "did:plc:2dbz7h5m3iowpqc23ozltpje",
        "did:plc:2semihha42b7efhu4ywv7whi"
    ].includes(did)
}


function makeAdminHandler<P, Q>(ctx: AppContext, handler: CAHandler<P, Q>): express.Handler {

    const adminOnlyHandler: CAHandler<P, Q> = async (ctx, agent, params) => {
        if (isAdmin(agent.did)) {
            return handler(ctx, agent, params)
        } else {
            return {error: "Necesitás permisos de administrador para realizar esta acción."}
        }
    }

    return makeHandler(ctx, adminOnlyHandler)
}


function makeAdminHandlerNoAuth<P, Q>(ctx: AppContext, handler: CAHandlerNoAuth<P, Q>): express.Handler {

    return async (req, res) => {
        const params = {...req.body, params: req.params, query: req.query} as P
        const agent = await sessionAgent(req, res, ctx)

        const admin = agent.hasSession() && isAdmin(agent.did)
        const authHeader = req.headers.authorization || ''
        const token = authHeader.replace(/^Bearer\s+/i, '')
        const validToken = token == env.ADMIN_TOKEN

        if(admin || validToken) {
            const json = await handler(ctx, agent, params)
            return res.json(json)
        } else {
            return res.json({error: "No session"})
        }
    }
}


export const adminRoutes = (ctx: AppContext): Router => {
    const router = express.Router()

    router.post(
        "/sync-user/:handleOrDid",
        makeAdminHandler(ctx, syncUserHandler)
    )
    router.post(
        "/user/delete/:handleOrDid",
        makeAdminHandler(ctx, deleteUserHandler)
    )

    router.post(
        "/invite-code/create",
        makeAdminHandler(ctx, createInviteCodesHandler)
    )

    router.post(
        "/delete-collection/:collection",
        makeAdminHandler(ctx, deleteCollectionHandler)
    )

    router.get(
        "/users",
        makeAdminHandler(ctx, getUsers)
    )

    router.get(
        "/category-topics/:cat",
        makeAdminHandlerNoAuth(ctx, getTopicsInCategoryForBatchEditing)
    )

    router.get(
        "/topics-not-selfsynonym",
        makeAdminHandlerNoAuth(ctx, getTopicsWhereTitleIsNotSetAsSynonym)
    )

    router.post(
        "/sync-all-users",
        makeAdminHandler(ctx, syncAllUsersHandler)
    )

    router.get(
        "/topics",
        makeAdminHandlerNoAuth(ctx, getAllTopics)
    )

    router.post(
        "/migrate-to-ca-pds",
        makeAdminHandler(ctx, migrateToCA)
    )

    router.post(
        "/finish-migration-to-ca-pds",
        makeAdminHandler(ctx, finishMigrationToCA)
    )

    router.post(
        "/signup-cabildo",
        makeAdminHandler(ctx, createAccountInCabildoPDS)
    )

    router.get("/pending-validation-requests", makeAdminHandler(ctx, getPendingValidationRequests))

    router.post(
        "/validation-request/result", makeAdminHandler(ctx, setValidationRequestResultHandler)
    )

    router.post('/update-topic-contributions/:id', makeHandler(ctx, updateTopicContributionsHandler))

    router.get("/stats-dashboard", makeAdminHandler(ctx, getStatsDashboard))

    router.get("/repo/:handleOrDid", makeAdminHandler(ctx, getRepoCounts))

    router.post(
        "/job/:id", makeAdminHandler(ctx, startJob)
    )

    router.get("/access-requests", makeAdminHandler(ctx, getAccessRequests))

    router.post("/access-request-sent/:id", makeAdminHandler(ctx, markAccessRequestSent))

    router.post("/clear-redis/:prefix", makeAdminHandler(ctx, clearRedisHandler))

    router.get("/status", makeAdminHandler(ctx, getServerStatus))

    router.get("/user-months", makeAdminHandler(ctx, getUserMonthsStats))

    router.get("/user-month-payments/:id", makeAdminHandler(ctx, getUserMonthPayments))

    router.get("/read-sessions-plot", makeAdminHandler(ctx, getReadSessionsPlot))

    router.get("/registered-jobs", makeAdminHandler(ctx, getRegisteredJobs))

    router.get("/top-authors", makeAdminHandler(ctx, getTopAuthors))

    router.get("/all-ca-feed", makeAdminHandler(ctx, getAllCAFeed))

    router.post("/find-users/:handle", makeAdminHandler(ctx, findUsersInFollows))

    router.get("/mail-subscriptions", makeAdminHandler(ctx, getMailSubscriptions))

    router.get("/sent-emails", makeAdminHandler(ctx, getSentEmails))

    // Email templates CRUD
    router.get("/email-templates", makeAdminHandler(ctx, getEmailTemplates))
    router.post("/email-template", makeAdminHandler(ctx, createEmailTemplate))
    router.post("/email-template/:id/update", makeAdminHandler(ctx, updateEmailTemplate))
    router.post("/email-template/:id/delete", makeAdminHandler(ctx, deleteEmailTemplate))

    // Send emails
    router.post("/send-emails", makeAdminHandler(ctx, sendBulkEmails))

    // SMTP2GO stats
    router.get("/smtp2go-stats", makeAdminHandler(ctx, getSMTP2GOStats))

    return router
}