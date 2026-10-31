import {sql, type Kysely} from 'kysely';
import type {Store} from 'express-rate-limit';
import type {DB} from '#/db/types.js';
import type {AppContext} from '#/setup.js';

export class PostgresRateLimitStore implements Store {
    readonly localKeys = false;

    constructor(
        private readonly db: Kysely<DB>,
        readonly prefix: string,
        private readonly windowMs: number,
    ) {}

    async increment(key: string) {
        // One atomic upsert shares a fixed window across replicas, using the database clock.
        const row = await this.db.insertInto('api_rate_limit').values({
            policy: this.prefix,
            client_key: key,
            hits: 1,
            expires_at: sql<Date>`statement_timestamp() + ${this.windowMs} * interval '1 millisecond'`,
        }).onConflict(conflict => conflict.columns(['policy', 'client_key']).doUpdateSet({
            hits: sql<number>`CASE WHEN api_rate_limit.expires_at <= statement_timestamp() THEN 1
                ELSE least(api_rate_limit.hits, 2147483646) + 1 END`,
            expires_at: sql<Date>`CASE WHEN api_rate_limit.expires_at <= statement_timestamp()
                THEN excluded.expires_at ELSE api_rate_limit.expires_at END`,
        })).returning(['hits', 'expires_at']).executeTakeFirstOrThrow();
        return {totalHits: row.hits, resetTime: row.expires_at};
    }

    async decrement(key: string) {
        await this.db.updateTable('api_rate_limit')
            .set({hits: sql<number>`greatest(hits - 1, 0)`})
            .where('policy', '=', this.prefix).where('client_key', '=', key)
            .where('expires_at', '>', sql<Date>`statement_timestamp()`).execute();
    }

    async resetKey(key: string) {
        await this.db.deleteFrom('api_rate_limit')
            .where('policy', '=', this.prefix).where('client_key', '=', key).execute();
    }
}

export async function cleanupExpiredRateLimits(db: Kysely<DB>) {
    // Bounded batches and SKIP LOCKED let replicas clean without waiting on active requests.
    await sql`DELETE FROM api_rate_limit WHERE (policy, client_key) IN (
        SELECT policy, client_key FROM api_rate_limit
        WHERE expires_at <= statement_timestamp() ORDER BY expires_at
        LIMIT 5000 FOR UPDATE SKIP LOCKED
    )`.execute(db);
}

export function startRateLimitCleanup(ctx: AppContext) {
    let pending: Promise<void> | undefined;
    const cleanup = () => {
        if (pending) return;
        pending = cleanupExpiredRateLimits(ctx.kysely)
            .catch(error => ctx.logger.pino.error({error}, 'rate limit cleanup failed'))
            .finally(() => { pending = undefined; });
    };
    const timer = setInterval(cleanup, 60_000);
    timer.unref();
    cleanup();
    return async () => { clearInterval(timer); await pending; };
}
