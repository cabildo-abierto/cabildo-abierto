import {randomUUID} from 'node:crypto';
import {sql, type Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {ObjectStorage} from '../storage/storage.js';
import {synchronizeTopicSearch} from './index.js';
import {searchTable, searchTablesDDL} from './schema.js';
import {claimSearchSource, processSearchSource} from './worker.js';

export async function reindexSearch(database: Kysely<DB>, getStorage: () => ObjectStorage, progress: (message: string) => void) {
    const started = Date.now();
    const schema = `search_rebuild_${randomUUID().replaceAll('-', '')}`;
    const ddl = await searchTablesDDL(schema);
    await database.connection().execute(async connection => {
        const lock = await sql<{locked: boolean}>`SELECT pg_try_advisory_lock(194827, 2) AS locked`.execute(connection);
        if (!lock.rows[0].locked) throw new Error('Hay escrituras o una reconstrucción en curso. Reintentá cuando terminen.');
        try {
            const migration = await sql<{applied: boolean}>`SELECT EXISTS (
                SELECT 1 FROM migration WHERE file_name = '0005_search_4_5.sql'
            ) AS applied`.execute(connection);
            if (!migration.rows[0].applied) throw new Error('Aplicá primero la migración 0005_search_4_5.sql.');
            await sql`CREATE SCHEMA ${sql.id(schema)}`.execute(connection);
            await sql.raw(ddl).execute(connection);
            const topics = await connection.selectFrom('topic').select('id').orderBy('id').execute();
            for (let index = 0; index < topics.length; index++) {
                await connection.transaction().execute(trx => synchronizeTopicSearch(trx, topics[index].id, schema));
                progress(`Temas: ${index + 1}/${topics.length}`);
            }
            let processed = 0;
            for (;;) {
                const source = await claimSearchSource(connection, schema);
                if (!source) break;
                try {
                    if (!await processSearchSource(connection, source, getStorage, schema)) throw new Error('El trabajo perdió su lease.');
                } catch (error) {
                    throw new Error(`No se pudo indexar la fuente ${source.id} (${source.kind}). Se conserva el índice anterior.`, {cause: error});
                }
                progress(`Fuentes de archivos/URL: ${++processed}`);
            }
            await connection.transaction().execute(async trx => {
                await sql`DROP TABLE public.search_reference, public.search_entry, public.search_source`.execute(trx);
                for (const table of ['source', 'entry', 'reference'] as const) {
                    await sql`ALTER TABLE ${searchTable(table, schema)} SET SCHEMA public`.execute(trx);
                    await sql`ANALYZE ${searchTable(table)}`.execute(trx);
                }
            });
            const stats = await sql<{entries: string; bytes: string}>`SELECT
                (SELECT count(*)::text FROM search_entry) AS entries,
                (pg_total_relation_size('search_source') + pg_total_relation_size('search_entry') + pg_total_relation_size('search_reference'))::text AS bytes`.execute(connection);
            progress(`Reconstrucción completa: ${stats.rows[0].entries} entradas, ${stats.rows[0].bytes} bytes, ${Math.round((Date.now() - started) / 1000)} segundos.`);
        } finally {
            try { await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(connection); }
            finally { await sql`SELECT pg_advisory_unlock(194827, 2)`.execute(connection); }
        }
    });
}
