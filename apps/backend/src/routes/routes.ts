import express, {Router} from 'express'
import {cookieOptions, handler, Session, sessionAgent} from "#/utils/session-agent.js";
import {CAHandlerNoAuth, makeEffHandler, makeEffHandlerNoAuth, makeHandler, makeHandlerNoAuth} from "#/utils/handler.js";
import {searchTopics, searchUsers, searchUsersAndTopics} from "#/services/search/search.js";
import {createArticle} from "#/services/write/article.js";
import {getIronSession} from "iron-session";
import {env} from "#/lib/env.js";
import {createAccessRequest, getInviteCodesToShare, login} from "#/services/user/access.js";
import {getFeedByKind} from "#/services/feed/feed.js";
import {getProfileFeed} from "#/services/feed/profile/profile.js";
import {
    deleteSession,
    follow,
    getAccount,
    getProfile,
    getSession,
    saveNewEmail,
    setSeenTutorialHandler,
    unfollow,
    updateAlgorithmConfig,
    updateProfile
} from "#/services/user/users.js";
import {createPost} from "#/services/write/post.js";
import {addLike, removeLike, removeRepost, repost} from "#/services/reactions/reactions.js";
import {getThread} from "#/services/thread/thread.js";
import {getLikes, getReposts, getQuotes} from "#/services/thread/get-details.js";
import {
    getTopicHandler,
    getTopicVersionHandler,
    getTrendingTopics,
    getTopicsHandler,
    getCategories,
    getTopicsMentioned,
    getTopicsMentionedByContent
} from "#/services/wiki/topics.js";
import {
    getTopicDiscussion,
    getTopicFeed,
    getTopicMentionsInTopicsFeed,
    getTopicQuoteReplies
} from "#/services/feed/topic.js";
import {deleteCAProfile, deleteRecordHandler} from "#/services/delete.js";
import {getCategoriesGraph, getCategoryGraph} from "#/services/wiki/graph.js";
import {createTopicVersion} from "#/services/write/topic.js";
import path from "path";
import {cancelEditVoteHandler, getTopicVersionVotesHandler, voteEdit} from "#/services/wiki/votes.js";
import {adminRoutes} from './admin-routes.js';
import {fetchURLMetadataHandler, getContentMetadata} from '#/services/write/metadata.js';
import {getDatasetHandler, getDatasets, getTopicsDatasetHandler} from '#/services/dataset/read.js';
import {createDataset} from '#/services/dataset/write.js';
import {searchContents} from "#/services/feed/search.js";
import {addToEnDiscusion, removeFromEnDiscusion} from "#/services/feed/inicio/discusion.js";
import {
    attemptMPVerification,
    cancelValidationRequest,
    createValidationRequest,
    getValidationRequest
} from '#/services/user/validation.js';
import {
    createPreference,
    getDonationHistory,
    getFundingStateHandler,
    getMonthlyValueHandler,
    processPayment
} from '#/services/monetization/donations.js';
import {storeReadSessionHandler} from '#/services/monetization/read-tracking.js';
import {getTopicTitleHandler} from '#/services/wiki/current-version.js';
import {getTopicHistoryHandler} from "#/services/wiki/history.js";
import {getNewVersionDiff, getTopicVersionChanges} from '#/services/wiki/changes.js';
import {getNotifications, getUnreadNotificationsCount} from '#/services/notifications/notifications.js';
import {
    createConversation,
    getChatAvailability,
    getConversation,
    getConversations,
    markConversationRead,
    sendMessage
} from "#/services/messaging/conversations.js";
import {getDraft, getDrafts, saveDraft} from '#/services/write/drafts.js';
import {getNextMeeting} from '#/services/admin/meetings.js';
import {getAuthorDashboardHandler} from '#/services/monetization/author-dashboard.js';
import {getFollowSuggestions, setNotInterested} from '#/services/user/follow-suggestions.js';
import {AppContext} from "#/setup.js";
import {jobApplicationHandler} from '#/services/admin/jobs.js';
import {getTopicsDataForElectionVisualizationHandler} from "#/services/wiki/election.js";
import {getKnownPropsHandler} from "#/services/wiki/known-props.js";
import {syncHandler} from "#/services/sync/sync-user.js";
import {getInterestsHandler, newInterestHandler, removeInterestHandler} from "#/services/feed/discover/interests.js";
import {getCustomFeeds, getTopicFeeds} from "#/services/feed/feeds.js";
import {getCustomFeed} from "#/services/feed/custom-feed.js";
import {subscribeHandler, unsubscribeHandler, unsubscribeHandlerWithAuth} from "#/services/emails/subscriptions.js";
import {getFollowers, getFollows} from "#/services/user/follows.js";

const serverStatusRouteHandler: CAHandlerNoAuth<{}, string> = async (ctx, agent, {}) => {
    return {data: "live"}
}


export const createRouter = (ctx: AppContext): Router => {
    const router = express.Router()

    router.get('/client-metadata.json', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json')
        return res.sendFile(path.join(process.cwd(), 'public', 'client-metadata.json'))
    })

    router.get('/version.txt', (req, res, next) => {
        res.setHeader('Content-Type', 'text/plain')
        return res.sendFile(path.join(process.cwd(), 'public', 'version.txt'))
    })

    router.post('/login', makeHandlerNoAuth(ctx, login))

    router.get('/oauth/callback', async (req, res) => {
        if (!ctx.oauthClient) return
        const params = new URLSearchParams(req.originalUrl.split('?')[1])
        try {
            const {session} = await ctx.oauthClient.callback(params)
            const clientSession = await getIronSession<Session>(req, res, cookieOptions)
            clientSession.did = session.did
            await clientSession.save()
        } catch (err) {
            ctx.logger.pino.error({error: err, params}, 'oauth callback failed')
            return res.redirect(env.FRONTEND_URL + '/login/error')
        }
        return res.redirect(env.FRONTEND_URL + '/login/ok')
    })

    router.post('/logout', async (req, res) => {
        const agent = await sessionAgent(req, res, ctx)
        if (agent.hasSession()) {
            await deleteSession(ctx, agent)
        }

        return res.status(200).json({})
    })

    router.get(
        '/feed/:kind',
        handler(makeEffHandlerNoAuth(ctx, getFeedByKind))
    )

    router.get(
        '/profile-feed/:handleOrDid/:kind',
        handler(makeEffHandlerNoAuth(ctx, getProfileFeed))
    )

    router.post(
        '/follow',
        handler(makeHandler(ctx, follow))
    )

    router.post(
        '/unfollow',
        handler(makeHandler(ctx, unfollow))
    )

    router.post(
        '/article',
        handler(makeEffHandler(ctx, createArticle))
    )

    router.post(
        '/post',
        handler(makeEffHandler(ctx, createPost))
    )

    router.get(
        '/search-users/:query',
        handler(makeHandlerNoAuth(ctx, searchUsers))
    )

    router.get(
        '/search-users-and-topics/:query',
        handler(makeHandlerNoAuth(ctx, searchUsersAndTopics))
    )

    router.post(
        '/like',
        handler(makeEffHandler(ctx, addLike))
    )

    router.post(
        '/remove-like/:rkey',
        handler(makeEffHandler(ctx, removeLike))
    )

    router.post(
        '/repost',
        handler(makeEffHandler(ctx, repost))
    )

    router.post(
        '/remove-repost/:rkey',
        handler(makeEffHandler(ctx, removeRepost))
    )

    router.get(
        '/thread/:handleOrDid/:collection/:rkey',
        handler(makeEffHandlerNoAuth(ctx, getThread))
    )

    router.get(
        '/trending-topics/:time',
        handler(makeEffHandlerNoAuth(ctx, getTrendingTopics))
    )

    router.get(
        '/profile/:handleOrDid',
        handler(makeEffHandlerNoAuth(ctx, getProfile))
    )

    router.get("/test", makeHandlerNoAuth(ctx, serverStatusRouteHandler))

    router.get(
        '/session',
        handler(makeEffHandlerNoAuth(ctx, getSession))
    )

    router.get(
        '/session/:code',
        handler(makeEffHandlerNoAuth(ctx, getSession))
    )

    router.get(
        '/account',
        handler(makeEffHandler(ctx, getAccount))
    )

    router.get(
        '/follows/:handleOrDid',
        makeEffHandlerNoAuth(ctx, getFollows)
    )

    router.get(
        '/followers/:handleOrDid',
        makeEffHandlerNoAuth(ctx, getFollowers)
    )

    router.get(
        '/topic',
        makeHandlerNoAuth(ctx, getTopicHandler)
    )

    router.post(
        '/topic-version',
        makeEffHandler(ctx, createTopicVersion)
    )

    router.get(
        '/topic-version/:did/:rkey',
        makeHandlerNoAuth(ctx, getTopicVersionHandler)
    )

    router.get(
        '/topic-feed',
        makeEffHandlerNoAuth(ctx, getTopicFeed)
    )

    router.get(
        '/topic-discussion',
        makeEffHandlerNoAuth(ctx, getTopicDiscussion)
    )

    router.get(
        '/topic-mentions-in-topics-feed',
        makeHandlerNoAuth(ctx, getTopicMentionsInTopicsFeed)
    )

    router.get(
        '/topic-quote-replies/:did/:rkey',
        makeHandlerNoAuth(ctx, getTopicQuoteReplies)
    )


    router.get(
        '/topic-history/:id',
        makeHandlerNoAuth(ctx, getTopicHistoryHandler)
    )

    router.get(
        '/topic-version-changes/:curDid/:curRkey/:prevDid/:prevRkey',
        makeHandlerNoAuth(ctx, getTopicVersionChanges)
    )

    router.post(
        '/diff',
        makeHandlerNoAuth(ctx, getNewVersionDiff)
    )

    router.post(
        '/delete-record/:collection/:rkey',
        makeEffHandler(ctx, deleteRecordHandler)
    )

    router.get(
        '/categories-graph',
        makeHandlerNoAuth(ctx, getCategoriesGraph)
    )

    router.get(
        '/category-graph',
        makeHandlerNoAuth(ctx, getCategoryGraph)
    )

    router.get(
        '/categories',
        makeHandlerNoAuth(ctx, getCategories)
    )

    router.get(
        '/topics/:sort/:time',
        makeEffHandlerNoAuth(ctx, getTopicsHandler)
    )

    router.get(
        '/search-topics/:q',
        makeEffHandlerNoAuth(ctx, searchTopics)
    )

    router.get(
        '/search-contents/:q',
        makeEffHandlerNoAuth(ctx, searchContents)
    )

    router.post(
        '/vote-edit/:vote/:did/:rkey/:cid',
        makeEffHandler(ctx, voteEdit)
    )

    router.post(
        '/cancel-edit-vote/:collection/:rkey',
        makeEffHandler(ctx, cancelEditVoteHandler)
    )

    router.post('/seen-tutorial/:tutorial',
        makeHandler(ctx, setSeenTutorialHandler)
    )

    router.get('/datasets',
        makeHandlerNoAuth(ctx, getDatasets)
    )

    router.get('/dataset/:did/:collection/:rkey',
        makeHandlerNoAuth(ctx, getDatasetHandler)
    )

    router.post('/topics-dataset',
        makeHandlerNoAuth(ctx, getTopicsDatasetHandler)
    )

    router.post('/dataset',
        makeEffHandler(ctx, createDataset)
    )

    router.post('/set-en-discusion/:collection/:rkey',
        makeEffHandler(ctx, addToEnDiscusion)
    )

    router.post('/unset-en-discusion/:collection/:rkey',
        makeHandler(ctx, removeFromEnDiscusion)
    )

    router.post(
        '/get-topics-mentioned',
        makeHandlerNoAuth(ctx, getTopicsMentioned)
    )

    router.get(
        '/topics-mentioned/:did/:collection/:rkey',
        makeHandlerNoAuth(ctx, getTopicsMentionedByContent)
    )

    router.post(
        '/profile',
        handler(makeEffHandler(ctx, updateProfile))
    )

    router.post(
        '/validation-request',
        handler(makeHandler(ctx, createValidationRequest))
    )

    router.get(
        '/validation-request',
        handler(makeHandler(ctx, getValidationRequest))
    )

    router.post(
        '/validation-request/cancel',
        handler(makeHandler(ctx, cancelValidationRequest))
    )

    router.post('/metadata', makeHandler(ctx, fetchURLMetadataHandler))

    router.get('/donation-history', makeHandler(ctx, getDonationHistory))

    router.get('/monthly-value', makeHandlerNoAuth(ctx, getMonthlyValueHandler))

    router.get('/funding-state', makeHandlerNoAuth(ctx, getFundingStateHandler))

    router.post('/donate/create-preference', makeHandlerNoAuth(ctx, createPreference))

    router.post('/notify-payment', makeHandlerNoAuth(ctx, processPayment))

    router.post('/read-session/:did/:collection/:rkey', makeHandlerNoAuth(ctx, storeReadSessionHandler))

    router.get("/topic-title/:id", makeHandlerNoAuth(ctx, getTopicTitleHandler))

    router.get("/notifications/list", makeHandler(ctx, getNotifications))

    router.get("/notifications/unread-count", makeHandler(ctx, getUnreadNotificationsCount))

    router.get("/conversations/list", makeHandler(ctx, getConversations))

    router.get("/conversation/:convoIdOrHandle", makeEffHandler(ctx, getConversation))

    router.post("/send-message", makeHandler(ctx, sendMessage))

    router.post("/conversation/create/:did", makeHandler(ctx, createConversation))

    router.post("/conversation/read/:convoId", makeHandler(ctx, markConversationRead))

    router.post("/access-request", makeHandlerNoAuth(ctx, createAccessRequest))

    router.get('/drafts', makeHandler(ctx, getDrafts))

    router.get('/draft/:id', makeHandler(ctx, getDraft))

    router.post('/draft', makeEffHandler(ctx, saveDraft))

    router.get("/next-meeting", makeHandlerNoAuth(ctx, getNextMeeting))

    router.get("/invite-codes-to-share", makeHandler(ctx, getInviteCodesToShare))

    router.get("/content-metadata/:did/:collection/:rkey", makeHandlerNoAuth(ctx, getContentMetadata))

    router.post("/algorithm-config", makeHandler(ctx, updateAlgorithmConfig))

    router.get("/author-dashboard", makeHandler(ctx, getAuthorDashboardHandler))

    router.post("/delete-ca-profile", makeHandler(ctx, deleteCAProfile))

    router.get("/follow-suggestions/:limit/:cursor", makeHandler(ctx, getFollowSuggestions))

    router.get("/likes/:did/:collection/:rkey", makeHandlerNoAuth(ctx, getLikes))

    router.get("/reposts/:did/:collection/:rkey", makeHandlerNoAuth(ctx, getReposts))

    router.get("/quotes/:did/:collection/:rkey", makeHandlerNoAuth(ctx, getQuotes))

    router.post("/not-interested/:subject", makeHandler(ctx, setNotInterested))

    router.post("/job-application", makeHandlerNoAuth(
        ctx,
        jobApplicationHandler
    ))

    router.post("/unsubscribe/:code", makeHandlerNoAuth(ctx, unsubscribeHandler))

    router.post("/unsubscribe", makeHandler(ctx, unsubscribeHandlerWithAuth))

    router.post("/subscribe", makeEffHandler(ctx, subscribeHandler))

    router.get("/votes/:did/:rkey", makeHandlerNoAuth(ctx, getTopicVersionVotesHandler))

    router.post("/election", makeHandlerNoAuth(ctx, getTopicsDataForElectionVisualizationHandler))

    router.get("/known-props", makeHandlerNoAuth(ctx, getKnownPropsHandler))

    router.get("/chat-availability/:handle", makeHandlerNoAuth(
        ctx,
        getChatAvailability
    ))

    router.post("/attempt-mp-verification", makeHandler(ctx, attemptMPVerification))

    router.post("/sync", makeEffHandler(ctx, syncHandler))

    router.get("/interests", makeHandler(ctx, getInterestsHandler))

    router.post("/interest/:id", makeHandler(ctx, newInterestHandler))

    router.post("/remove-interest/:id", makeHandler(ctx, removeInterestHandler))

    router.get("/healthz", (req, res) => {
        res.status(200).json({
            status: "ok",
            uptime: process.uptime(),
            timestamp: Date.now()
        })
    })

    router.post("/email", makeEffHandler(ctx, saveNewEmail))

    router.get("/custom-feeds", makeHandlerNoAuth(ctx, getCustomFeeds))

    router.get("/topic-feeds", makeEffHandler(ctx, getTopicFeeds))

    router.get("/custom-feed/:did/:rkey", makeHandler(ctx, getCustomFeed))

    router.use(adminRoutes(ctx))

    return router
}
