/*setup.ts*/
import type {OAuthClient} from '@atproto/oauth-client-node'
import {createClient} from '#/auth/client.js'
import {BidirectionalResolver, createBidirectionalResolver, createIdResolver} from '#/id-resolver.js'
import {type Redis, Redis as IORedis} from "ioredis/built/index.js"
import {CAWorker, RedisCAWorker} from "#/jobs/worker.js";
import {Kysely, PostgresDialect} from 'kysely'
import {Pool} from 'pg'
import {DB} from '#/../prisma/generated/types.js'
import {RedisCache} from "#/services/redis/cache.js";
import {Logger} from "#/utils/logger.js";
import {env} from './lib/env.js';
import {S3Storage} from './services/storage/storage.js';
import {getCAUsersDids} from "#/services/user/users.js";
import * as dotenv from 'dotenv';
import {Effect} from "effect";
dotenv.config();

export type AppContext = {
    logger: Logger
    oauthClient: OAuthClient | undefined
    resolver: BidirectionalResolver
    ioredis: Redis
    redisCache: RedisCache
    mirrorId: string
    worker: CAWorker
    kysely: Kysely<DB>
    storage: S3Storage | undefined
}


export type Role = "worker" | "web" | "mirror"

export const redisUrl = env.REDIS_URL
const envName = env.NODE_ENV


export function setupKysely(dbUrl?: string, maxThreads?: number) {
    return new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: dbUrl ?? env.DATABASE_URL,
                max: maxThreads ?? env.MAX_CONNECTIONS,
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


async function addSyncUserJobsForAllUsers(ctx: AppContext, worker: CAWorker) {
    return Effect.runPromiseExit(Effect.gen(function* () {
        const caUsers = yield* getCAUsersDids(ctx)
        for(const u of caUsers){
            yield* ctx.redisCache.mirrorStatus.set(u, "InProcess", true)
            yield* worker.addJob("sync-user", {handleOrDid: u}, 21)
        }
    }).pipe(Effect.withSpan("addSyncUserJobsForAllUsers")))
}


export async function setupAppContext(roles: Role[]) {
    const logger = new Logger([...roles, envName].join(":"))
    const kysely = setupKysely()
    logger.pino.info("kysely client created")

    const storage = new S3Storage(logger)
    logger.pino.info("storage client created")

    const ioredis = setupRedis(0)
    logger.pino.info("redis client created")

    const oauthClient = await createClient(ioredis, logger)
    logger.pino.info("oauth client created")

    let worker: CAWorker = new RedisCAWorker(
        ioredis,
        roles.includes("worker"),
        logger
    )

    const mirrorId = `mirror-${envName}-${env.DEV_NAME}`
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
            await addSyncUserJobsForAllUsers(ctx, worker)
        }

        logger.pino.info("worker setup")
    }

    return {ctx, logger}
}