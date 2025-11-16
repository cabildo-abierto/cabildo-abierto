import events from 'node:events'
import type http from 'node:http'
import express, {type Express} from 'express'
import {env} from '#/lib/env.js'
import {createRouter} from '#/routes/routes.js'
import cors from 'cors'
import {MirrorMachine} from "#/services/sync/mirror-machine.js";
import {AppContext, Role, setupAppContext} from "#/setup.js";
import morgan from "morgan"


export class Server {
    constructor(
        public app: express.Application,
        public server: http.Server,
        public ctx: AppContext
    ) {
    }

    static async create(roles: Role[]) {
        const {ctx} = await setupAppContext(roles)
        ctx.logger.pino.info("app context created")

        if(roles.includes("mirror")){
            const ingester = new MirrorMachine(ctx)
            ingester.run()
        }

        const app: Express = express()
        app.set('trust proxy', true)

        app.use(express.json({ limit: "50mb" })) // TO DO: Mejorar

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
        }))

        app.use(express.json())
        app.use(express.urlencoded({extended: true}))

        app.use(morgan('combined'))

        const router = createRouter(ctx)
        app.use(router)
        app.use(express.static('public'))
        app.use((_req, res) => res.sendStatus(404))
        ctx.logger.pino.info(`running listen on ${env.HOST}:${env.PORT}`)
        const server = app.listen(env.PORT, env.HOST)
        await events.once(server, 'listening')
        ctx.logger.pino.info(`Server (${env.NODE_ENV}) running on port http://${env.HOST}:${env.PORT}`)

        const serverInstance = new Server(app, server, ctx)

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
        return new Promise<void>((resolve) => {
            this.server.close(() => {
                this.ctx.kysely.destroy()
                this.ctx.logger.pino.info('server closed')
                resolve()
            })
        })
    }
}