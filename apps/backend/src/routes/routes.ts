import {withSession, currentUser} from '#/auth/middleware.js';
import {topicAccessContext, requireTopicAccess} from '#/services/topic-access.js';
import {TopicActionError} from '#/services/topic-title-edits.js';
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

    router.use(withSession(ctx));
    router.use((req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        topicAccessContext.run({userId: currentUser(req)?.id ?? null}, () => next());
    });
    router.use('/topics/:id', async (req, res, next) => {
        if (['search', 'events'].includes(req.params.id)) return next();
        // Recipients may answer an invitation before becoming members.
        if (/^\/invitations\/[^/]+\/(accept|decline)$/.test(req.path)) return next();
        try {
            const topic = await requireTopicAccess(ctx.kysely, req.params.id);
            topicAccessContext.getStore()!.topicId = topic.id;
            next();
        } catch (error) {
            if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
            next(error);
        }
    });
    router.use(authRoutes(ctx))
    router.use(imageRoutes(ctx))
    router.use(documentRoutes(ctx))
    router.use(datasetRoutes(ctx))
    router.use(lccaRoutes(ctx))
    router.use(notificationRoutes(ctx))
    router.use(topicRoutes(ctx))

    return router
}
