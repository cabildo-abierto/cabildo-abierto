import {randomUUID} from 'node:crypto';
import {sql, type Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {ObjectStorage} from '../storage/storage.js';
import {extractSearchSource} from './extract.js';
import {replaceSearchSegments} from './index.js';
import {searchTable} from './schema.js';
import type {SearchSource} from './types.js';

export async function processSearchSource(database: Kysely<DB>, source: SearchSource, getStorage: () => ObjectStorage, schema = 'public') {
    const extracted = await extractSearchSource(database, source, getStorage);
    return database.transaction().execute(async trx => {
        const lock = await sql<{locked: boolean}>`SELECT pg_try_advisory_xact_lock_shared(194827, 2) AS locked`.execute(trx);
        if (!lock.rows[0].locked && schema === 'public') return false;
        const current = await sql<{id: string}>`SELECT id FROM ${searchTable('source', schema)}
            WHERE id = ${source.id} AND generation = ${source.generation} AND lease_token = ${source.lease_token}::uuid FOR UPDATE`.execute(trx);
        if (!current.rows.length) return false;
        if (extracted.segments) await replaceSearchSegments(trx, source.id, extracted.segments, schema);
        await sql`UPDATE ${searchTable('source', schema)} SET content_hash = ${extracted.hash}, indexed_at = now(), last_checked_at = now(),
            indexed_generation = generation, status = 'ready', attempts = 0, last_error = NULL, lease_token = NULL, lease_until = NULL
            WHERE id = ${source.id}`.execute(trx);
        return true;
    });
}

export async function claimSearchSource(database: Kysely<DB>, schema = 'public'): Promise<SearchSource | null> {
    return database.transaction().execute(async trx => {
        const lock = await sql<{locked: boolean}>`SELECT pg_try_advisory_xact_lock_shared(194827, 2) AS locked`.execute(trx);
        if (!lock.rows[0].locked && schema === 'public') return null;
        const table = searchTable('source', schema);
        const token = randomUUID();
        const result = await sql<SearchSource>`UPDATE ${table} SET lease_token = ${token}::uuid, lease_until = now() + interval '3 minutes', attempts = attempts + 1
            WHERE id = (SELECT s.id FROM ${table} s
                WHERE kind IN ('document_file', 'dataset_file', 'dataset_url') AND indexed_generation < generation
                    AND attempts < 5 AND retry_at <= now() AND (lease_until IS NULL OR lease_until < now())
                    AND EXISTS (SELECT 1 FROM ${searchTable('reference', schema)} r WHERE r.source_id = s.id AND r.is_visible)
                ORDER BY retry_at, id FOR UPDATE SKIP LOCKED LIMIT 1)
            RETURNING id, kind, file_id, source_url, generation, lease_token, content_hash, attempts`.execute(trx);
        return result.rows[0] ?? null;
    });
}
