import {handler} from "#/utils/session-agent.js";
import {makeEffHandlerNoAuth} from "#/utils/handler.js";
import {searchUsers, searchUsersAndTopics} from "#/services/search/users.js";
import {AppContext} from "#/setup.js";
import express, {Router} from "express";



export const searchRouter = (ctx: AppContext): Router => {
    const router = express.Router()

    router.get(
        '/search-users/:query',
        handler(makeEffHandlerNoAuth(ctx, searchUsers))
    )

    router.get(
        '/search-users-and-topics/:query',
        handler(makeEffHandlerNoAuth(ctx, searchUsersAndTopics))
    )

    return router
}
