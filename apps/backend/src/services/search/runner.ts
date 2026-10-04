import {Client} from 'pg';
import {sql} from 'kysely';
import {env} from '#/lib/env.js';
import type {AppContext} from '#/setup.js';
import {R2Storage, type ObjectStorage} from '../storage/storage.js';
import {claimSearchSource, processSearchSource} from './worker.js';
import {notifySearchPending, SEARCH_NOTIFICATION_CHANNEL} from './notifications.js';
import type {SearchSource} from './types.js';

const RECOVERY_INTERVAL_MS = 60_000;

export function startSearchWorker(ctx: AppContext) {
    let stopped = false;
    let storage: ObjectStorage | undefined;
    let listener: Client | null = null;
    let connecting: Promise<void> | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let wakeTimer: NodeJS.Timeout | null = null;
    let draining: Promise<void> | null = null;
    let wakeRequested = false;
    const active = new Set<Promise<void>>();
    const getStorage = () => storage ??= new R2Storage();
    const logError = (error: unknown, message: string) => ctx.logger.pino.error({error}, message);

    async function process(source: SearchSource) {
        try {
            await processSearchSource(ctx.kysely, source, getStorage);
        } catch (error) {
            ctx.logger.pino.error({sourceId: source.id, error}, 'search indexing failed');
            await ctx.kysely.transaction().execute(async trx => {
                const lock = await sql<{locked: boolean}>`SELECT pg_try_advisory_xact_lock_shared(194827, 2) AS locked`.execute(trx);
                if (!lock.rows[0].locked) return;
                const updated = await sql`UPDATE search_source SET status = 'failed', last_error = 'No pudimos indexar el contenido.',
                    last_checked_at = now(), retry_at = now() + ${Math.min(300, 15 * 2 ** source.attempts)} * interval '1 second',
                    lease_token = NULL, lease_until = NULL WHERE id = ${source.id} AND lease_token = ${source.lease_token}::uuid
                    RETURNING id`.execute(trx);
                if (updated.rows.length) await notifySearchPending(trx);
            }).catch(failure => logError(failure, 'search failure update failed'));
        }
    }

    async function scheduleWake() {
        let delay = RECOVERY_INTERVAL_MS;
        // Finishing a job wakes the worker; there is no need to inspect the queue while both slots are occupied.
        if (active.size < 2) {
            const next = await sql<{delay: number | null}>`SELECT extract(epoch FROM (
                min(greatest(s.retry_at, coalesce(s.lease_until, s.retry_at))) - now()
            )) * 1000 AS delay FROM search_source s
            WHERE s.kind IN ('document_file', 'dataset') AND s.indexed_generation < s.generation AND s.attempts < 5
                AND EXISTS (SELECT 1 FROM search_reference r WHERE r.source_id = s.id AND r.is_visible)`.execute(ctx.kysely);
            // A short lower bound prevents spinning when another worker or a rebuild holds a lock.
            delay = Math.min(RECOVERY_INTERVAL_MS, Math.max(1000, Number(next.rows[0].delay ?? RECOVERY_INTERVAL_MS)));
        }
        if (stopped) return;
        if (wakeTimer) clearTimeout(wakeTimer);
        wakeTimer = setTimeout(wake, delay);
        wakeTimer.unref();
    }

    function wake() {
        if (stopped) return;
        wakeRequested = true;
        if (draining) return;
        if (wakeTimer) clearTimeout(wakeTimer);
        draining = (async () => {
            do {
                wakeRequested = false;
                while (!stopped && active.size < 2) {
                    const source = await claimSearchSource(ctx.kysely);
                    if (!source || stopped) break;
                    const task = process(source);
                    active.add(task);
                    void task.finally(() => { active.delete(task); wake(); });
                }
            } while (wakeRequested && !stopped);
            await scheduleWake();
        })().catch(error => {
            logError(error, 'search queue drain failed');
            if (!stopped) {
                wakeTimer = setTimeout(wake, RECOVERY_INTERVAL_MS);
                wakeTimer.unref();
            }
        }).finally(() => {
            draining = null;
            if (wakeRequested && !stopped) wake();
        });
    }

    function reconnect() {
        if (stopped || reconnectTimer) return;
        reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, 2000);
        reconnectTimer.unref();
    }

    function connect() {
        if (stopped || connecting) return;
        connecting = (async () => {
            if (!env.DIRECT_URL) throw new Error('El listener de búsqueda requiere DIRECT_URL.');
            const client = new Client({connectionString: env.DIRECT_URL, connectionTimeoutMillis: 10_000, application_name: 'search-index-listener'});
            listener = client;
            client.on('notification', notification => { if (notification.channel === SEARCH_NOTIFICATION_CHANNEL) wake(); });
            const disconnected = () => {
                if (listener !== client) return;
                listener = null;
                void client.end().catch(() => undefined);
                reconnect();
            };
            client.on('error', error => { logError(error, 'search listener failed'); disconnected(); });
            client.on('end', disconnected);
            try {
                await client.connect();
                await client.query(`LISTEN ${SEARCH_NOTIFICATION_CHANNEL}`);
                // LISTEN must be active before checking pending jobs to avoid losing a notification.
                wake();
            } catch (error) { disconnected(); throw error; }
        })().catch(error => { logError(error, 'search listener connection failed'); reconnect(); })
            .finally(() => { connecting = null; });
    }

    connect();
    wake();
    return async () => {
        stopped = true;
        if (wakeTimer) clearTimeout(wakeTimer);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        await connecting;
        await listener?.end().catch(() => undefined);
        await draining;
        await Promise.allSettled(active);
    };
}
