/*setup.ts*/
import {Kysely, PostgresDialect} from 'kysely'
import {Pool} from 'pg'
import type {DB} from '#/db/types.js'
import {Logger} from "#/utils/logger.js";
import {env} from './lib/env.js';
import * as dotenv from 'dotenv';
dotenv.config();

export type AppContext = {
    logger: Logger
    kysely: Kysely<DB>
}

export type Role = "worker" | "web" | "mirror"

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


export async function setupAppContext(roles: Role[]) {
    const logger = new Logger([...roles, envName].join(":"))
    const kysely = setupKysely()
    logger.pino.info("kysely client created")

    const ctx: AppContext = {
        logger,
        kysely
    }

    return {ctx, logger}
}
