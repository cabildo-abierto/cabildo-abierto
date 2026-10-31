import {startSearchWorker} from "./services/search/runner.js";
/*server.ts*/
import events from 'node:events'
import type http from 'node:http'
import express, {type Express} from 'express'
import {env} from '#/lib/env.js'
import {createRouter} from '#/routes/routes.js'
import cors from 'cors'
import {AppContext, Role, setupAppContext} from "#/setup.js";
import morgan from "morgan"
import {documentationRoutes} from './routes/documentation-routes.js';
import {createOpenApiErrorHandler, openApiValidation} from './openapi/middleware.js';
import {createOpenApiDocument} from './openapi/document.js';
import {createApiRateLimits} from './auth/rate-limits.js';
import {startRateLimitCleanup} from './auth/postgres-rate-limit-store.js';

export class Server {
    constructor(
        public app: express.Application,
        public server: http.Server,
        public ctx: AppContext,
        private stopSearchWorker: () => Promise<void>,
        private stopRateLimitCleanup: () => Promise<void>,
    ) {
    }

    static async create(roles: Role[]) {
        const app: Express = express()

        const {ctx} = await setupAppContext(roles)
        ctx.logger.pino.info("app context created")

        app.set('trust proxy', env.TRUST_PROXY.trim()
            ? env.TRUST_PROXY.split(',').map(proxy => proxy.trim()).filter(Boolean)
            : false)

        const allowedOrigins = [
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3002',
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'https://cabildoabierto.ar',
            'https://cabildoabierto.com.ar',
            'https://www.cabildoabierto.ar',
            'https://www.cabildoabierto.com.ar',
            'https://dev.cabildoabierto.ar',
            'https://test.cabildoabierto.ar',
            'https://ca-withered-wind.fly.dev',
            'https://api.cabildoabierto.ar',
            'https://dev0.cabildoabierto.ar',
            'https://fly-ca-withered-wind-redis.upstash.io',
            'http://192.168.0.10:3000',
            'http://192.168.0.11:3000',
            'http://192.168.0.34:3000',
            'http://192.168.1.4:3000',
            'http://0.0.0.0:3000'
        ]

        app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            },
            credentials: true,
            exposedHeaders: ['RateLimit', 'RateLimit-Policy', 'Retry-After'],
        }))

        app.use(morgan('combined'))
        app.use(createApiRateLimits(ctx, {
            requestsPerMinute: env.API_RATE_LIMIT_PER_MINUTE,
            authAttemptsPerQuarterHour: env.AUTH_RATE_LIMIT_PER_15_MINUTES,
            tokensPerHour: env.API_TOKEN_RATE_LIMIT_PER_HOUR,
        }))
        app.use(express.json({limit: '50mb'}))
        app.use(express.urlencoded({extended: true}))

        const router = createRouter(ctx)
        const openApiDocument = createOpenApiDocument({includeInternal: true})
        app.use(documentationRoutes(createOpenApiDocument()))
        app.use(openApiValidation(openApiDocument))
        app.use(router)
        app.use(createOpenApiErrorHandler(ctx.logger))
        app.use(express.static('public'))
        app.use((_req, res) => res.sendStatus(404))
        ctx.logger.pino.info(`running listen on ${env.HOST}:${env.PORT}`)
        const server = app.listen(env.PORT, env.HOST)
        await events.once(server, 'listening')
        ctx.logger.pino.info(`Server (${env.NODE_ENV}) running on port http://${env.HOST}:${env.PORT}`)

        const serverInstance = new Server(app, server, ctx, startSearchWorker(ctx), startRateLimitCleanup(ctx))

        process.on('SIGINT', async () => {
            await serverInstance.close()
            process.exit(0)
        })

        if(process.send) {
            process.send("ready")
            ctx.logger.pino.info("process is ready")
        }

        return serverInstance
    }

    async close() {
        this.ctx.logger.pino.info('sigint received, shutting down')
        await this.stopSearchWorker()
        await this.stopRateLimitCleanup()
        await this.ctx.topicConnections?.close()
        return new Promise<void>((resolve) => {
            this.server.close(async () => {
                await this.ctx.kysely.destroy()
                this.ctx.logger.pino.info('server closed')
                resolve()
            })
        })
    }
}
