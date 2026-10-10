import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parse} from 'csv-parse/sync';
import type {DatasetContent} from '@cabildo-abierto/api';
import type {AppContext} from '#/setup.js';
import {ensureDatasetSource} from '#/services/datasets/sources.js';
import {waitSnapshot} from '#/services/datasets/snapshots.js';
import {storeFile, removeUnattachedFile} from '#/services/storage/files.js';
import type {ObjectStorage} from '#/services/storage/storage.js';

export function importTracking({headers, idColumn, filename, title, description}: {headers: string[]; idColumn: string; filename: string; title: string; description: string}) {
    const resourceIdColumn = headers.indexOf(idColumn);
    if (resourceIdColumn < 0) throw new Error('El catálogo necesita una columna de identificador.');
    async function mergeTrackingRows(ctx: AppContext, storage: ObjectStorage, previous: DatasetContent | null, rows: string[][]) {
        if (!previous) return rows;
        if (!previous.fileId || previous.sourceFormat !== 'csv') throw new Error('El seguimiento existente no tiene un archivo CSV válido.');
        const file = await ctx.kysely.selectFrom('file').selectAll().where('id', '=', previous.fileId).executeTakeFirstOrThrow();
        const stored = parse(Buffer.from(await storage.read(file)), {bom: true}) as string[][];
        if (JSON.stringify(stored[0]) !== JSON.stringify(headers)) throw new Error('El seguimiento existente tiene columnas inesperadas.');
        const merged = new Map<string, string[]>();
        for (const row of stored.slice(1)) {
            const id = row[resourceIdColumn];
            if (row.length !== headers.length || !id || merged.has(id)) throw new Error('El seguimiento existente tiene filas inválidas o duplicadas.');
            merged.set(id, row);
        }
        for (const row of rows) merged.set(row[resourceIdColumn], row);
        return [...merged.values()];
    }

    function trackingCSV(rows: string[][]) {
        const sorted = [...rows].sort((a, b) => a[resourceIdColumn].localeCompare(b[resourceIdColumn]));
        return [headers, ...sorted].map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n';
    }

    async function removeUnpublishedTrackingFile(ctx: AppContext, storage: ObjectStorage, fileId: string) {
        const attached = await ctx.kysely.selectFrom('dataset').innerJoin('dataset_source', 'dataset_source.id', 'dataset.source_id')
            .select('dataset.id').where('dataset_source.file_id', '=', fileId).executeTakeFirst();
        if (!attached) await removeUnattachedFile(ctx, storage, fileId);
    }

    async function prepareTrackingDataset(ctx: AppContext, storage: ObjectStorage, userId: string, rows: string[][]): Promise<DatasetContent> {
        const directory = await mkdtemp(join(tmpdir(), 'ca-import-tracking-'));
        let fileId: string | undefined;
        try {
            const path = join(directory, filename);
            await writeFile(path, trackingCSV(rows), 'utf8');
            const file = await storeFile(ctx, storage, path, filename, 'text/csv', userId);
            fileId = file.id;
            await ctx.kysely.updateTable('file').set({format: 'csv', preview_status: 'ready'}).where('id', '=', file.id).execute();
            const sourceId = await ensureDatasetSource(ctx.kysely, {file_id: file.id, source_url: null, source_format: 'csv', jq_filter: null});
            const snapshot = await waitSnapshot(ctx.kysely, sourceId, storage);
            return {title, description,
                sourceFormat: 'csv', jqFilter: null, sourceUrl: null, fileId: file.id, columns: snapshot.columns, csvOptions: snapshot.csv_options};
        } catch (error) {
            if (fileId) await removeUnpublishedTrackingFile(ctx, storage, fileId).catch(cleanupError => ctx.logger.pino.error({cleanupError, fileId}, 'tracking cleanup failed'));
            throw error;
        } finally { await rm(directory, {recursive: true, force: true}); }
    }

    return {mergeTrackingRows, trackingCSV, removeUnpublishedTrackingFile, prepareTrackingDataset};
}
