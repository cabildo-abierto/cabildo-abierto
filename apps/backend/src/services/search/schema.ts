import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {sql, type Kysely, type Transaction} from 'kysely';
import type {DB} from '#/db/types.js';

export type SearchDatabase = Kysely<DB> | Transaction<DB>;
export function searchTable(name: 'source' | 'entry' | 'reference', schema = 'public') {
    if (!/^(public|search_rebuild_[a-f0-9]+)$/.test(schema)) throw new Error('Invalid search schema');
    return sql.table(`${schema}.search_${name}`);
}
export async function searchTablesDDL(schema: string) {
    searchTable('source', schema);
    const path = [resolve('schema/search-tables.sql'), resolve('apps/backend/schema/search-tables.sql')].find(existsSync);
    if (!path) throw new Error('Search table definitions not found');
    return (await readFile(path, 'utf8')).replaceAll('__SEARCH_SCHEMA__', schema);
}
export async function lockSearchMutation(database: SearchDatabase) {
    await sql`SELECT pg_advisory_xact_lock_shared(194827, 2)`.execute(database);
}
export async function lockSearchTopic(database: SearchDatabase, topicId: string) {
    await lockSearchMutation(database);
    await sql`SELECT pg_advisory_xact_lock(hashtext(${`search:${topicId}`}))`.execute(database);
}
