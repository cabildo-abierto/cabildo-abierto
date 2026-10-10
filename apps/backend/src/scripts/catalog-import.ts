import type {Kysely} from 'kysely';
import {parseDatasetBlock} from '@cabildo-abierto/utils';
import type {DB} from '#/db/types.js';
import {env} from '#/lib/env.js';
import {setupKysely} from '#/setup.js';
import {Logger} from '#/utils/logger.js';
import {S3Storage} from '#/services/storage/storage.js';
import type {DatasetSourceOptions} from '@cabildo-abierto/api';
import {datasetImporter, importOptions, prepareImportedDataset, sameDataset, type Candidate, type Change, type Mode, type TopicState} from './dataset-import.js';
import {importTracking} from './dataset-import-tracking.js';

export type ImportOutcome = {status: 'obtenido' | 'falló' | 'conflicto' | 'no_verificado'; detail: string};
type CatalogImportConfig<Resource> = {
    prefix: string; editMessage: string; scriptName: string; resourceUsage: string; label: string;
    catalog: (limit?: number, resourceId?: string) => Promise<{resources: Resource[]; total: number; limited: boolean}>;
    candidate: (item: Resource) => Omit<Candidate, 'blockNumber'> & DatasetSourceOptions;
    resourceError: (item: Resource) => string | null;
    tracking: {headers: string[]; filename: string; title: string; description: string;
        row: (item: Resource, outcome: ImportOutcome, processedAt: string) => string[]};
};

export function catalogImporter<Resource>(config: CatalogImportConfig<Resource>) {
    const importer = datasetImporter(config.prefix, config.editMessage);
    const trackingBlockNumber = `${config.prefix}catalog`;
    const trackingTitle = config.tracking.title;
    const tracking = importTracking({...config.tracking, idColumn: config.tracking.headers[0]});

    function usage(): never {
        throw new Error(`Uso: pnpm --filter backend run ${config.scriptName} --topic <id> --user <username> [--dry-run=full|--dry-run=metadata|--apply] [--limit N | --resource ${config.resourceUsage}]`);
    }

    async function planImport(database: Kysely<DB>, resources: Resource[], state: TopicState, mode: Mode) {
        const changes: Change[] = [];
        const outcomes = new Map<string, ImportOutcome>();
        let next = 0, processed = 0;
        async function processResource(item: Resource) {
            const error = config.resourceError(item);
            if (error) return {status: 'falló', detail: error} as const;
            const source = config.candidate(item);
            const candidate = {...source, blockNumber: importer.blockNumber(source.resourceId)};
            const reason = importer.conflict(state, candidate.blockNumber);
            if (reason) return {status: 'conflicto', detail: reason} as const;
            const previous = state.byNumber.get(candidate.blockNumber);
            const previousContent = previous ? parseDatasetBlock(previous.content) : null;
            if (previous && !previousContent) return {status: 'conflicto', detail: 'El dataset vigente es inválido.'} as const;
            if (mode === 'metadata') return {status: 'no_verificado', detail: 'Requiere descargar el recurso para verificar los datos y las columnas.'} as const;
            try {
                const content = await prepareImportedDataset(database, candidate, mode, source);
                if (previousContent && sameDataset(previousContent, content)) return {status: 'obtenido', detail: 'Sin cambios en ficha, URL ni columnas.'} as const;
                changes.push({kind: previous ? 'update' : 'add', candidate, content, previousId: previous?.id});
                return {status: 'obtenido', detail: previous ? 'Recurso obtenido y preparado para actualizar.' : 'Recurso obtenido y preparado para importar.'} as const;
            } catch (error) { return {status: 'falló', detail: error instanceof Error ? error.message : 'No se pudo validar el recurso.'} as const; }
        }
        async function worker() {
            while (next < resources.length) {
                const item = resources[next++];
                outcomes.set(config.candidate(item).resourceId, await processResource(item));
                processed++;
                if (processed % 100 === 0) console.log(`${config.label}: ${processed}/${resources.length} recursos procesados.`);
            }
        }
        await Promise.all(Array.from({length: Math.min(4, resources.length)}, () => worker()));
        changes.sort((a, b) => a.candidate.blockNumber.localeCompare(b.candidate.blockNumber));
        return {changes, outcomes};
    }

    async function run(args: string[]) {
        const {topicId, username, mode, limit, resourceId} = importOptions(args, usage);
        const database = setupKysely(env.DIRECT_URL || env.DATABASE_URL, 1);
        const ctx = {kysely: database, logger: new Logger(config.scriptName), topicConnections: null};
        try {
            const [topic, user] = await Promise.all([
                database.selectFrom('topic').select(['id', 'title']).where('id', '=', topicId).executeTakeFirst(),
                database.selectFrom('user').select(['id', 'username']).where('username', '=', username).executeTakeFirst(),
            ]);
            if (!topic) throw new Error(`No existe el tema ${topicId}.`);
            if (!user) throw new Error(`No existe el usuario ${username}.`);
            console.log(`Tema: ${topic.title} (${topicId}); autor: ${username}; modo: ${mode}.`);
            const [source, state] = await Promise.all([config.catalog(limit, resourceId), importer.readTopicState(database, topicId)]);
            const trackingConflict = importer.conflict(state, trackingBlockNumber);
            if (trackingConflict) throw new Error(`No se puede actualizar el catálogo: ${trackingConflict}`);
            const previousTracking = state.byNumber.get(trackingBlockNumber);
            const previousContent = previousTracking ? parseDatasetBlock(previousTracking.content) : null;
            if (previousTracking && !previousContent) throw new Error('El catálogo vigente es inválido.');
            console.log(`${config.label}: ${source.resources.length}/${source.total} recursos seleccionados${source.limited ? ' (ejecución parcial)' : ''}.`);
            const result = await planImport(database, source.resources, state, mode);
            const count = (status: ImportOutcome['status']) => [...result.outcomes.values()].filter(item => item.status === status).length;
            console.log(`Resultado: ${result.changes.filter(item => item.kind === 'add').length} altas, ${result.changes.filter(item => item.kind === 'update').length} actualizaciones, ${count('obtenido')} obtenidos, ${count('falló')} fallidos, ${count('conflicto')} conflictos, ${count('no_verificado')} sin verificar.`);
            const changesByPath = new Map(result.changes.map(change => [change.candidate.resourceId, change]));
            const processedAt = new Date().toISOString();
            let rows = source.resources.map(item => {
                const outcome = result.outcomes.get(config.candidate(item).resourceId)!;
                const change = changesByPath.get(config.candidate(item).resourceId);
                const label = change ? change.kind === 'add' ? 'ALTA' : 'ACTUALIZAR' : outcome.status.toUpperCase();
                const candidate = config.candidate(item);
                console.log(`${label} ${candidate.resourceId}: ${change ? candidate.title : outcome.detail}\n  URL: ${candidate.url}`);
                return config.tracking.row(item, outcome, processedAt);
            });
            if (!source.limited) {
                const present = new Set(source.resources.map(item => importer.blockNumber(config.candidate(item).resourceId)));
                for (const number of state.stored.keys()) {
                    if (number !== trackingBlockNumber && !present.has(number)) console.log(`AUSENTE ${number}: ya no figura en el catálogo de origen; se conserva.`);
                }
            }
            const storage = mode === 'apply' || (source.limited && previousContent) ? new S3Storage() : null;
            if (source.limited && previousContent && storage) rows = await tracking.mergeTrackingRows(ctx, storage, previousContent, rows);
            console.log(`Catálogo: ${previousTracking ? 'actualizar' : 'crear'} ${trackingTitle}; ${rows.length} filas.`);
            if (mode !== 'apply') { console.log('Dry-run terminado; no se escribió en la base ni en el almacenamiento.'); return; }
            const content = await tracking.prepareTrackingDataset(ctx, storage!, user.id, rows);
            try {
                const changes: Change[] = [...result.changes, {kind: previousTracking ? 'update' : 'add', content,
                    candidate: {resourceId: trackingBlockNumber, blockNumber: trackingBlockNumber, title: trackingTitle, description: content.description, url: ''}, previousId: previousTracking?.id}];
                const editId = await importer.apply(database, topicId, user.id, state, changes);
                console.log(`Edición publicada: ${editId}`);
            } catch (error) {
                await tracking.removeUnpublishedTrackingFile(ctx, storage!, content.fileId!).catch(cleanupError => ctx.logger.pino.error({cleanupError, fileId: content.fileId}, 'tracking cleanup failed'));
                throw error;
            }
        } finally { await database.destroy(); }
    }

    return {run, planImport};
}
