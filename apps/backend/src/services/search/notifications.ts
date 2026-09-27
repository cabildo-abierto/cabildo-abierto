import {sql} from 'kysely';
import type {SearchDatabase} from './schema.js';

export const SEARCH_NOTIFICATION_CHANNEL = 'search_pending';

export async function notifySearchPending(database: SearchDatabase) {
    await sql`SELECT pg_notify(${SEARCH_NOTIFICATION_CHANNEL}, '')`.execute(database);
}
