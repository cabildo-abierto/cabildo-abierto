import type {OAuthClient} from '@atproto/oauth-client-node'
import {createClient} from '#/auth/client.js'
import {BidirectionalResolver, createBidirectionalResolver, createIdResolver} from '#/id-resolver.js'
import {type Redis, Redis as IORedis} from "ioredis/built/index.js"
import {CAWorker, RedisCAWorker} from "#/jobs/worker.js";
import {Kysely, PostgresDialect} from 'kysely'
import {Pool} from 'pg'
import {DB} from '#/../prisma/generated/types.js'
import 'dotenv/config'
import {RedisCache} from "#/services/redis/cache.js";
import {Logger} from "#/utils/logger.js";
import {env} from './lib/env.js';
import {S3Storage} from './services/storage/storage.js';
import {getCAUsersDids} from "#/services/user/users.js";


export type AppContext = {
    logger: Logger
    oauthClient: OAuthClient | undefined
    resolver: BidirectionalResolver
    ioredis: Redis
    redisCache: RedisCache
    mirrorId: string
    worker: CAWorker | undefined
    kysely: Kysely<DB>
    storage: S3Storage | undefined
}


export type Role = "worker" | "web" | "mirror"

export const redisUrl = env.REDIS_URL
const envName = env.NODE_ENV


export function setupKysely(dbUrl?: string) {
    return new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: dbUrl ?? env.DATABASE_URL,
                max: env.MAX_CONNECTIONS,
                idleTimeoutMillis: 30000,
                keepAlive: true,
            })
        })
    })
}


export function setupRedis(db: number) {
    return new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        db
    })
}


export function setupResolver(redis: RedisCache) {
    const baseIdResolver = createIdResolver()
    return createBidirectionalResolver(baseIdResolver, redis)
}


export async function setupAppContext(roles: Role[]) {
    const logger = new Logger([...roles, envName].join(":"))

    const kysely = setupKysely()
    logger.pino.info("kysely client created")

    const storage = new S3Storage(logger)
    logger.pino.info("storage client created")

    const ioredis = setupRedis(0)
    logger.pino.info("redis client created")

    const oauthClient = await createClient(ioredis)
    logger.pino.info("oauth client created")

    let worker: CAWorker | undefined
    if(roles.length > 0){
        worker = new RedisCAWorker(
            ioredis,
            roles.includes("worker"),
            logger
        )
    }

    const mirrorId = `mirror-${envName}`
    logger.pino.info({mirrorId}, "Mirror ID")

    const redisCache = new RedisCache(ioredis, mirrorId, logger)
    logger.pino.info("redis cache created")

    const resolver = setupResolver(redisCache)

    const ctx: AppContext = {
        logger,
        oauthClient,
        resolver,
        ioredis,
        redisCache,
        kysely,
        worker,
        storage,
        mirrorId
    }

    if(worker){
        await worker.setup(ctx)

        if(env.RUN_CRONS){
            ctx.logger.pino.info("adding sync ca users jobs")
            const caUsers = await getCAUsersDids(ctx)
            for(const u of caUsers){
                await ctx.redisCache.mirrorStatus.set(u, "InProcess", true)
                await worker.addJob("sync-user", {handleOrDid: u}, 21)
            }
        }


        logger.pino.info("worker setup")
    }

    return {ctx, logger}
}