import {documentRoutes} from "./document-routes.js";
import express, {Router} from 'express'
import {adminRoutes} from './admin-routes.js';
import {AppContext} from "#/setup.js";
import {authRoutes} from "./auth-routes.js";
import {topicTitleEditRoutes} from "./topic-title-edit-routes.js";
import {discussionRoutes} from "./discussion-routes.js";
import {topicRoutes} from "./topic-routes.js";
import {topicConnectionRoutes} from "./topic-connection-routes.js";



export const createRouter = (ctx: AppContext): Router => {
    const router = express.Router()

    router.use(authRoutes(ctx))
    router.use(documentRoutes(ctx))
    router.use(topicConnectionRoutes(ctx))
    router.use(topicTitleEditRoutes(ctx))
    router.use(discussionRoutes(ctx))
    router.use(topicRoutes(ctx))
    router.use(adminRoutes(ctx))

    return router
}
