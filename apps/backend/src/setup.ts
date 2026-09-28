/*setup.ts*/
import {Kysely, PostgresDialect} from 'kysely'
import {Pool} from 'pg'
import type {DB} from '#/db/types.js'
import {Logger} from "#/utils/logger.js";
import {env} from './lib/env.js';
import * as dotenv from 'dotenv';
import {TopicConnections} from "#/services/topic-connections.js";
import {devDbLatencyPlugin} from "#/lib/dev-db-latency.js";
dotenv.config();

export type AppContext = {
    logger: Logger
    kysely: Kysely<DB>
    topicConnections: TopicConnections | null
}

export type Role = "worker" | "web" | "mirror"

const envName = env.NODE_ENV


export function setupKysely(dbUrl?: string, maxThreads?: number) {
    const delayMs = env.NODE_ENV === 'development' ? env.DEV_DB_LATENCY_MS : 0;
    return new Kysely<DB>({
        plugins: delayMs > 0 ? [devDbLatencyPlugin(delayMs)] : [],
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


export async function setupAppContext(roles: Role[]) {
    const logger = new Logger([...roles, envName].join(":"))
    const kysely = setupKysely()
    logger.pino.info("kysely client created")

    const topicConnections = roles.includes("web")
        ? new TopicConnections(kysely, env.DIRECT_URL || env.DATABASE_URL, logger)
        : null;

    const ctx: AppContext = {
        logger,
        kysely,
        topicConnections,
    }

    if (topicConnections) await topicConnections.start();

    return {ctx, logger}
}
