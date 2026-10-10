import {createHash, randomUUID} from 'node:crypto';
import {sql, type Kysely} from 'kysely';
import type {DatasetContent, DatasetSourceOptions} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';
import {ensureDatasetSource} from '#/services/datasets/sources.js';
import {validateRemoteDataset, waitSnapshot} from '#/services/datasets/snapshots.js';
import {S3Storage} from '#/services/storage/storage.js';
import {topicConvergence} from '#/services/topic-convergence.js';
import {lockSearchTopic} from '#/services/search/schema.js';
import {synchronizeTopicSearch} from '#/services/search/index.js';
import {notifyPreviousBlockAuthors} from '#/services/notifications.js';
import {notifyTopicChanged} from '#/services/topic-connections.js';

export type Mode = 'full' | 'metadata' | 'apply';
export type Options = {topicId: string; username: string; mode: Mode; limit?: number; resourceId?: string};
export type Candidate = {resourceId: string; blockNumber: string; title: string; description: string; url: string};
export type Change = {kind: 'add' | 'update'; candidate: Candidate; content: DatasetContent; previousId?: string};
export type TopicState = Awaited<ReturnType<ReturnType<typeof datasetImporter>['readTopicState']>>;

export function clean(value: unknown): string {
    return typeof value === 'string' ? value.replaceAll('\0', '').trim() : '';
}

export function importOptions(args: string[], usage: () => never): Options {
    let topicId: string | undefined;
    let username: string | undefined;
    let mode: Mode = 'full';
    let modeSpecified = false;
    let limit: number | undefined;
    let resourceId: string | undefined;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--topic' && args[i + 1]) topicId = args[++i];
        else if (arg === '--user' && args[i + 1]) username = args[++i];
        else if ((arg === '--limit' || arg.startsWith('--limit=')) && limit === undefined) {
            const raw = arg === '--limit' ? args[++i] : arg.slice('--limit='.length);
            if (!raw || !/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) usage();
            limit = Number(raw);
        }
        else if ((arg === '--resource' || arg.startsWith('--resource=')) && resourceId === undefined) {
            resourceId = (arg === '--resource' ? args[++i] : arg.slice('--resource='.length))?.trim();
            if (!resourceId || resourceId.startsWith('--')) usage();
        }
        else if (arg === '--apply' && !modeSpecified) { mode = 'apply'; modeSpecified = true; }
        else if ((arg === '--dry-run' || arg === '--dry-run=full') && !modeSpecified) { mode = 'full'; modeSpecified = true; }
        else if (arg === '--dry-run=metadata' && !modeSpecified) { mode = 'metadata'; modeSpecified = true; }
        else usage();
    }
    if (!topicId || !username || (resourceId !== undefined && limit !== undefined)) usage();
    return {topicId, username, mode, limit, resourceId};
}

export function sameDataset(left: DatasetContent, right: DatasetContent) {
    return left.sourceFormat === right.sourceFormat && left.jqFilter === right.jqFilter && left.title === right.title && left.description === right.description && left.sourceUrl === right.sourceUrl && left.fileId === right.fileId
        && JSON.stringify(left.columns) === JSON.stringify(right.columns)
        && JSON.stringify(left.csvOptions) === JSON.stringify(right.csvOptions);
}

export function datasetImporter(blockPrefix: string, editMessage: string) {
    async function readTopicState(database: Kysely<DB>, topicId: string) {
        const [blocks, latestRows, storedBlocks] = await Promise.all([
            topicConvergence(database, topicId),
            database.selectFrom('block_version')
                .innerJoin('edit', 'edit.id', 'block_version.edit_id')
                .innerJoin('record', 'record.id', 'edit.id')
                .select(['block_version.id', 'block_version.block_number as blockNumber', 'edit.message'])
                .where('block_version.topic_id', '=', topicId)
                .where('block_version.block_number', 'like', `${blockPrefix}%`)
                .where('record.deleted', '=', false)
                .orderBy('record.created_at', 'desc').orderBy('record.id', 'desc').execute(),
            database.selectFrom('block').select(['block_number', 'type_id']).where('topic_id', '=', topicId)
                .where('block_number', 'like', `${blockPrefix}%`).execute(),
        ]);
        const latest = new Map<string, (typeof latestRows)[number]>();
        for (const row of latestRows) if (!latest.has(row.blockNumber)) latest.set(row.blockNumber, row);
        return {blocks, byNumber: new Map(blocks.map(block => [block.blockNumber, block])), latest,
            stored: new Map(storedBlocks.map(block => [block.block_number, block]))};
    }

    function conflict(state: TopicState, blockId: string): string | null {
        const stored = state.stored.get(blockId);
        if (!stored) return null;
        if (stored.type_id !== 'dataset') return 'El número de bloque pertenece a otro tipo.';
        const current = state.byNumber.get(blockId);
        const latest = state.latest.get(blockId);
        if (!current || !latest || current.deleted || current.id !== latest.id || latest.message !== editMessage) {
            return 'El bloque fue modificado, eliminado o rechazado fuera del importador.';
        }
        return null;
    }

    async function insertBatches<T>(values: T[], insert: (batch: T[]) => Promise<unknown>) {
        for (let i = 0; i < values.length; i += 100) await insert(values.slice(i, i + 100));
    }

    async function apply(database: Kysely<DB>, topicId: string, userId: string, expected: TopicState, changes: Change[]) {
        if (!changes.length) return null;
        const editId = randomUUID();
        await database.transaction().execute(async trx => {
            await lockSearchTopic(trx, topicId);
            await sql`select pg_advisory_xact_lock(hashtext(${`${topicId}:edit`}))`.execute(trx);
            const current = await readTopicState(trx, topicId);
            if (current.blocks.length !== expected.blocks.length || current.blocks.some((block, i) => block.id !== expected.blocks[i].id
                || block.blockNumber !== expected.blocks[i].blockNumber) || changes.some(change => conflict(current, change.candidate.blockNumber))) {
                throw new Error('El tema cambió durante la importación. Repetí el comando.');
            }
            await trx.insertInto('record').values({id: editId, type_id: 'edit', author_id: userId}).execute();
            await trx.insertInto('edit').values({id: editId, topic_id: topicId, message: editMessage}).execute();
            const additions = changes.filter(change => change.kind === 'add');
            await insertBatches(additions, batch => trx.insertInto('block').values(batch.map(change => ({
                topic_id: topicId, block_number: change.candidate.blockNumber, type_id: 'dataset',
            }))).execute());
            const versions = changes.map(change => ({id: randomUUID(), topic_id: topicId,
                block_number: change.candidate.blockNumber, content: '', order: 'n', edit_id: editId, deleted: false}));
            await insertBatches(versions, batch => trx.insertInto('block_version').values(batch).execute());
            await notifyPreviousBlockAuthors(trx, {topicId, editId, actorId: userId,
                previousBlocks: changes.flatMap(change => change.previousId ? [{id: change.previousId, blockNumber: change.candidate.blockNumber}] : [])});
            const datasets = await Promise.all(changes.map(async (change, index) => ({
                id: versions[index].id, title: change.content.title, description: change.content.description,
                source_id: await ensureDatasetSource(trx,{file_id:change.content.fileId,source_url:change.content.sourceUrl,source_format:change.content.sourceFormat,jq_filter:change.content.jqFilter}),
                columns: JSON.stringify(change.content.columns), csv_options: JSON.stringify(change.content.csvOptions),
            })));
            await insertBatches(datasets, batch => trx.insertInto('dataset').values(batch).execute());
            await synchronizeTopicSearch(trx, topicId);
        });
        await notifyTopicChanged(database, topicId, 'edit');
        return editId;
    }


    return {readTopicState, conflict, apply, blockNumber: (id: string) => blockPrefix + createHash('sha256').update(id).digest('hex')};
}

export async function prepareImportedDataset(database: Kysely<DB>, item: Candidate, mode: Mode, options: DatasetSourceOptions): Promise<DatasetContent> {
    const snapshot = mode === 'apply' ? await waitSnapshot(database,
        await ensureDatasetSource(database, {file_id: null, source_url: item.url, source_format: options.sourceFormat, jq_filter: options.jqFilter}), new S3Storage(), false) : null;
    const parsed = snapshot ? {columns: snapshot.columns, csvOptions: snapshot.csv_options} : await validateRemoteDataset(item.url, options);
    return {sourceFormat: options.sourceFormat, jqFilter: options.jqFilter, title: item.title, description: item.description, sourceUrl: item.url,
        fileId: null, columns: parsed.columns, csvOptions: parsed.csvOptions};
}
export async function prepareImportedCSV(database: Kysely<DB>, item: Candidate, mode: Mode): Promise<DatasetContent> {
    return prepareImportedDataset(database, item, mode, {sourceFormat: 'csv', jqFilter: null});
}
