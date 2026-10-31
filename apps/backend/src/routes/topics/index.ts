import express from 'express';
import type {AppContext} from '#/setup.js';
import {topicContentRoutes} from './routes.js';
import {topicTitleEditRoutes} from './title-edits.js';
import {topicConnectionRoutes} from './connections.js';
import {discussionRoutes} from './discussions.js';
import {topicListRoutes} from './list.js';
import {topicSearchRoutes} from './search.js';

export function topicRoutes(ctx: AppContext): express.Router {
    const router = express.Router();
    router.use(topicListRoutes(ctx));
    router.use(topicSearchRoutes(ctx));
    router.use(topicConnectionRoutes(ctx));
    router.use(topicTitleEditRoutes(ctx));
    router.use(discussionRoutes(ctx));
    router.use(topicContentRoutes(ctx));
    return router;
}
