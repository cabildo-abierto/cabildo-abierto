import express, {Router} from 'express'
import {adminRoutes} from './admin-routes.js';
import {AppContext} from "#/setup.js";
import {authRoutes} from "./auth-routes.js";



export const createRouter = (ctx: AppContext): Router => {
    const router = express.Router()

    router.use(authRoutes(ctx))
    router.use(adminRoutes(ctx))

    return router
}
