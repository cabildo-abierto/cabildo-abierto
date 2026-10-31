import {imageRoutes} from './image-routes.js';
import {lccaRoutes} from './lcca-routes.js';
import {datasetRoutes} from './dataset-routes.js';
import {documentRoutes} from "./document-routes.js";
import express, {Router} from 'express'
import {AppContext} from "#/setup.js";
import {authRoutes} from "./auth-routes.js";
import {topicRoutes} from "./topics/index.js";
import {notificationRoutes} from "./notification-routes.js";



export const createRouter = (ctx: AppContext): Router => {
    const router = express.Router()

    router.use(authRoutes(ctx))
    router.use(imageRoutes(ctx))
    router.use(documentRoutes(ctx))
    router.use(datasetRoutes(ctx))
    router.use(lccaRoutes(ctx))
    router.use(notificationRoutes(ctx))
    router.use(topicRoutes(ctx))

    return router
}
