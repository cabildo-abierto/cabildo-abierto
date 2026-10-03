import {ensureDatasetSource} from '#/services/datasets/sources.js';
import {createHash, randomUUID} from 'node:crypto';
import {sql, type Kysely} from 'kysely';
import type {DatasetContent} from '@cabildo-abierto/api';
import {parseDatasetBlock, validDatasetUrl} from '@cabildo-abierto/utils';
import type {DB} from '#/db/types.js';
import {env} from '#/lib/env.js';
import {setupKysely} from '#/setup.js';
import {validateRemoteCSV,waitSnapshot} from '#/services/datasets/snapshots.js';
import {R2Storage} from '#/services/storage/storage.js';
import {topicConvergence} from '#/services/topic-convergence.js';
import {lockSearchTopic} from '#/services/search/schema.js';
import {synchronizeTopicSearch} from '#/services/search/index.js';
import {notifyPreviousBlockAuthors} from '#/services/notifications.js';
import {notifyTopicChanged} from '#/services/topic-connections.js';

const catalogUrl = 'https://datos.gob.ar/api/3/action/package_search';
const blockPrefix = 'ds-datos-gob-ar-';
const editMessage = '[datos.gob.ar:sync:v1] Importación de recursos CSV';
const pageSize = 10;

type Mode = 'full' | 'metadata' | 'apply';
type Options = {topicId: string; username: string; mode: Mode; limit?: number};
type CatalogResource = {id: string; name?: string; description?: string; format?: string; url?: string};
type CatalogPackage = {
    id: string; name: string; title?: string; notes?: string; license_title?: string;
    organization?: {title?: string}; resources: CatalogResource[];
};
type Candidate = {resourceId: string; blockNumber: string; title: string; description: string; url: string};
type Change = {kind: 'add' | 'update'; candidate: Candidate; content: DatasetContent; previousId?: string};
type Finding = {kind: 'omit' | 'conflict' | 'missing' | 'candidate' | 'unchanged'; resourceId: string; reason: string};
type TopicState = Awaited<ReturnType<typeof readTopicState>>;

function usage(): never {
    throw new Error('Uso: pnpm --filter backend run script:import-datos-gob-ar --topic <id> --user <username> [--dry-run=full|--dry-run=metadata|--apply] [--limit N]');
}

function options(args: string[]): Options {
    let topicId: string | undefined;
    let username: string | undefined;
    let mode: Mode = 'full';
    let modeSpecified = false;
    let limit: number | undefined;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--topic' && args[i + 1]) topicId = args[++i];
        else if (arg === '--user' && args[i + 1]) username = args[++i];
        else if ((arg === '--limit' || arg.startsWith('--limit=')) && limit === undefined) {
            const raw = arg === '--limit' ? args[++i] : arg.slice('--limit='.length);
            if (!raw || !/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) usage();
            limit = Number(raw);
        }
        else if (arg === '--apply' && !modeSpecified) { mode = 'apply'; modeSpecified = true; }
        else if ((arg === '--dry-run' || arg === '--dry-run=full') && !modeSpecified) { mode = 'full'; modeSpecified = true; }
        else if (arg === '--dry-run=metadata' && !modeSpecified) { mode = 'metadata'; modeSpecified = true; }
        else usage();
    }
    if (!topicId || !username) usage();
    return {topicId, username, mode, limit};
}

function blockNumber(resourceId: string) {
    return blockPrefix + createHash('sha256').update(resourceId).digest('hex');
}

function clean(value: unknown): string {
    return typeof value === 'string' ? value.replaceAll('\0', '').trim() : '';
}

function isCsv(resource: CatalogResource) {
    return /^(csv|text\/csv)$/i.test(clean(resource.format));
}

function candidate(pkg: CatalogPackage, resource: CatalogResource): Candidate | null {
    const resourceId = clean(resource.id);
    const url = clean(resource.url);
    if (!validDatasetUrl(url) || url.length > 4096) return null;
    const packageTitle = clean(pkg.title) || pkg.name;
    const resourceTitle = clean(resource.name) || resourceId;
    const title = `${packageTitle}: ${resourceTitle}`.slice(0, 200).trim();
    const source = `https://datos.gob.ar/dataset/${encodeURIComponent(pkg.name)}`;
    const details = [
        clean(resource.description),
        clean(pkg.notes),
        `Fuente: ${source}`,
        clean(pkg.organization?.title) && `Organismo: ${clean(pkg.organization?.title)}`,
        clean(pkg.license_title) && `Licencia: ${clean(pkg.license_title)}`,
    ].filter(Boolean);
    return {resourceId, blockNumber: blockNumber(resourceId), title,
        description: details.join('\n\n').slice(0, 5000), url};
}

async function catalogPage(start: number, maximumRows: number): Promise<unknown> {
    let rows = maximumRows;
    let lastError: unknown;
    while (rows >= 1) {
        const url = new URL(catalogUrl);
        url.searchParams.set('q', '*:*');
        url.searchParams.set('rows', String(rows));
        url.searchParams.set('start', String(start));
        url.searchParams.set('sort', 'name asc');
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await fetch(url, {signal: AbortSignal.timeout(30_000)});
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) { lastError = error; }
        }
        if (rows === 1) break;
        rows = Math.max(1, Math.floor(rows / 2));
        console.warn(`Falló la lectura de la página ${start}; reintentando con ${rows} packages.`);
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`No se pudo leer la página ${start} de CKAN: ${message}`);
}

async function catalog(limit?: number): Promise<{packages: CatalogPackage[]; totalResources: number; csvResources: number; catalogCount: number; limited: boolean}> {
    const packages: CatalogPackage[] = [];
    const ids = new Set<string>();
    let count: number | undefined;
    let scanned = 0, selected = 0;
    for (let start = 0; (count === undefined || start < count) && (limit === undefined || selected < limit);) {
        const rows = Math.min(pageSize, limit === undefined ? pageSize : limit - selected);
        const body = await catalogPage(start, rows);
        if (!body || typeof body !== 'object' || !('success' in body) || body.success !== true || !('result' in body)) {
            throw new Error(`CKAN devolvió un error en la página ${start}.`);
        }
        const result = body.result;
        if (!result || typeof result !== 'object' || !('count' in result) || !('results' in result)
            || !Number.isSafeInteger(result.count) || Number(result.count) < 0 || !Array.isArray(result.results)) {
            throw new Error(`La página ${start} del catálogo tiene un formato inesperado.`);
        }
        if (count !== undefined && count !== result.count) throw new Error('El catálogo cambió durante la lectura. Reintentá.');
        count = Number(result.count);
        if (!result.results.length && start < count) throw new Error(`Faltan resultados desde la página ${start}.`);
        for (const value of result.results as unknown[]) {
            if (!value || typeof value !== 'object' || !('id' in value) || !('name' in value) || !('resources' in value)
                || typeof value.id !== 'string' || typeof value.name !== 'string' || !Array.isArray(value.resources)
                || ids.has(value.id)) throw new Error(`Dataset inválido o duplicado en la página ${start}.`);
            const pkg = value as CatalogPackage;
            if (pkg.resources.some(resource => !resource || typeof resource !== 'object')) {
                throw new Error(`Recursos inválidos en el dataset ${pkg.name}.`);
            }
            ids.add(pkg.id);
            scanned++;
            if (limit === undefined) packages.push(pkg);
            else {
                const resources = pkg.resources.filter(isCsv)
                    .sort((left, right) => clean(left.id).localeCompare(clean(right.id)))
                    .slice(0, limit - selected);
                if (resources.length) packages.push({...pkg, resources});
                selected += resources.length;
                if (selected === limit) break;
            }
        }
        console.log(`Catálogo: ${scanned}/${count} datasets leídos${limit === undefined ? '' : `; ${selected}/${limit} CSV seleccionados`}.`);
        start += result.results.length;
    }
    if ((limit === undefined && scanned !== count) || (limit !== undefined && selected < limit && scanned !== count)) {
        throw new Error('La lectura del catálogo quedó incompleta. Reintentá.');
    }
    let totalResources = 0, csvResources = 0;
    for (const pkg of packages) for (const resource of pkg.resources) {
        totalResources++;
        if (isCsv(resource)) csvResources++;
    }
    return {packages, totalResources, csvResources, catalogCount: count ?? 0, limited: limit !== undefined};
}

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

function sameDataset(left: DatasetContent, right: DatasetContent) {
    return left.title === right.title && left.description === right.description && left.sourceUrl === right.sourceUrl
        && JSON.stringify(left.columns) === JSON.stringify(right.columns)
        && JSON.stringify(left.csvOptions) === JSON.stringify(right.csvOptions);
}

async function planImport(database: Kysely<DB>, source: Awaited<ReturnType<typeof catalog>>, state: TopicState, mode: Mode) {
    const changes: Change[] = [];
    const findings: Finding[] = [];
    const seen = new Set<string>();
    const seenBlockNumbers = new Set<string>();
    const items = source.packages.flatMap(pkg => pkg.resources
        .filter(isCsv)
        .map(resource => ({pkg, resource})));
    let next = 0, processed = 0;
    async function worker() {
        while (next < items.length) {
            const {pkg, resource} = items[next++];
            const id = clean(resource.id);
            if (!id || seen.has(id)) throw new Error(`ID de recurso CKAN ausente o duplicado: ${id || pkg.name}.`);
            seen.add(id);
            seenBlockNumbers.add(blockNumber(id));
            const item = candidate(pkg, resource);
            if (!item) { findings.push({kind: 'omit', resourceId: id, reason: 'URL ausente o inválida.'}); continue; }
            const reason = conflict(state, item.blockNumber);
            if (reason) { findings.push({kind: 'conflict', resourceId: id, reason}); continue; }
            const previous = state.byNumber.get(item.blockNumber);
            const previousContent = previous ? parseDatasetBlock(previous.content) : null;
            if (previous && !previousContent) {
                findings.push({kind: 'conflict', resourceId: id, reason: 'El dataset vigente es inválido.'}); continue;
            }
            if (mode === 'metadata') {
                const metadataChanged = !previousContent || previousContent.title !== item.title
                    || previousContent.description !== item.description || previousContent.sourceUrl !== item.url;
                findings.push({kind: metadataChanged ? 'candidate' : 'unchanged', resourceId: id,
                    reason: metadataChanged ? 'Requiere descargar el CSV para confirmar el cambio.' : 'Metadatos sin cambios; columnas sin verificar.'});
                continue;
            }
            try {
                const snapshot = mode === 'apply' ? await waitSnapshot(database,await ensureDatasetSource(database,{file_id:null,source_url:item.url}),new R2Storage(),false) : null;
                const parsed = snapshot ? {columns:snapshot.columns,csvOptions:snapshot.csv_options} : await validateRemoteCSV(item.url);
                const content: DatasetContent = {title: item.title, description: item.description, sourceUrl: item.url,
                    fileId: null, columns: parsed.columns, csvOptions: parsed.csvOptions};
                if (previousContent && sameDataset(previousContent, content)) {
                    findings.push({kind: 'unchanged', resourceId: id, reason: 'Sin cambios en ficha, URL ni columnas.'});
                } else changes.push({kind: previous ? 'update' : 'add', candidate: item, content, previousId: previous?.id});
            } catch (error) {
                findings.push({kind: 'omit', resourceId: id, reason: error instanceof Error ? error.message : 'No se pudo validar el CSV.'});
            }
            processed++;
            if (processed % 100 === 0) console.log(`CSV: ${processed}/${items.length} validados.`);
        }
    }
    await Promise.all(Array.from({length: Math.min(4, items.length)}, () => worker()));
    if (!source.limited) for (const number of state.stored.keys()) {
        if (seenBlockNumbers.has(number)) continue;
        findings.push({kind: 'missing', resourceId: number, reason: 'Ya no figura como recurso CSV en el catálogo; se conserva.'});
    }
    changes.sort((a, b) => a.candidate.blockNumber.localeCompare(b.candidate.blockNumber));
    findings.sort((a, b) => a.resourceId.localeCompare(b.resourceId));
    return {changes, findings};
}

function report(source: Awaited<ReturnType<typeof catalog>>, result: Awaited<ReturnType<typeof planImport>>, mode: Mode) {
    const count = (kind: Finding['kind']) => result.findings.filter(item => item.kind === kind).length;
    const withoutCsv = source.limited ? [] : source.packages.filter(pkg => !pkg.resources.some(isCsv));
    const csvUrls = new Map(source.packages.flatMap(pkg => pkg.resources.filter(isCsv)
        .map(resource => [clean(resource.id), clean(resource.url)] as const)));
    const logCsv = (kind: string, id: string, detail: string, url: string | undefined) => {
        console.log(`${kind} ${id}: ${detail}\n  URL: ${url || '(sin URL en el catálogo actual)'}`);
    };
    console.log(source.limited
        ? `Muestra parcial: ${source.csvResources} recursos CSV de ${source.packages.length} datasets; CKAN informa ${source.catalogCount} datasets en total.`
        : `Catálogo: ${source.packages.length} datasets, ${source.totalResources} recursos, ${source.csvResources} CSV.`);
    console.log(`Resultado: ${result.changes.filter(c => c.kind === 'add').length} altas, ${result.changes.filter(c => c.kind === 'update').length} actualizaciones, ${count('unchanged')} sin cambios, ${count('candidate')} candidatos, ${count('omit')} CSV omitidos, ${count('conflict')} conflictos, ${count('missing')} ausentes conservados${source.limited ? '' : `, ${withoutCsv.length} datasets sin CSV, ${source.totalResources - source.csvResources} recursos no CSV`}.`);
    for (const change of result.changes) logCsv(change.kind === 'add' ? 'ALTA' : 'ACTUALIZAR',
        change.candidate.resourceId, change.content.title, change.candidate.url);
    for (const finding of result.findings) logCsv(finding.kind.toUpperCase(), finding.resourceId,
        finding.reason, csvUrls.get(finding.resourceId));
    for (const pkg of withoutCsv) console.log(`SIN_CSV ${pkg.name}`);
    for (const pkg of source.limited ? [] : source.packages) for (const resource of pkg.resources.filter(item => !isCsv(item))) {
        console.log(`NO_CSV ${clean(resource.id) || pkg.name}: ${clean(resource.format) || 'formato desconocido'}`);
    }
    if (mode === 'metadata') console.log('Dry-run rápido: los candidatos y las columnas requieren validación completa.');
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
            source_id: await ensureDatasetSource(trx,{file_id:null,source_url:change.content.sourceUrl}),
            columns: JSON.stringify(change.content.columns), csv_options: JSON.stringify(change.content.csvOptions),
        })));
        await insertBatches(datasets, batch => trx.insertInto('dataset').values(batch).execute());
        await synchronizeTopicSearch(trx, topicId);
    });
    await notifyTopicChanged(database, topicId, 'edit');
    return editId;
}

async function main() {
    const {topicId, username, mode, limit} = options(process.argv.slice(2));
    const database = setupKysely(env.DIRECT_URL || env.DATABASE_URL, 1);
    try {
        const [topic, user] = await Promise.all([
            database.selectFrom('topic').select(['id', 'title']).where('id', '=', topicId).executeTakeFirst(),
            database.selectFrom('user').select(['id', 'username']).where('username', '=', username).executeTakeFirst(),
        ]);
        if (!topic) throw new Error(`No existe el tema ${topicId}.`);
        if (!user) throw new Error(`No existe el usuario ${username}.`);
        console.log(`Tema: ${topic.title} (${topic.id}); autor: ${user.username}; modo: ${mode}${limit === undefined ? '' : `; límite: ${limit} CSV`}.`);
        const [source, state] = await Promise.all([catalog(limit), readTopicState(database, topicId)]);
        const result = await planImport(database, source, state, mode);
        report(source, result, mode);
        if (mode === 'apply') {
            const editId = await apply(database, topicId, user.id, state, result.changes);
            console.log(editId ? `Edición publicada: ${editId}` : 'No hubo cambios; no se publicó una edición.');
        } else console.log('Dry-run terminado; no se escribió en la base.');
    } finally { await database.destroy(); }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Falló la importación.');
    process.exitCode = 1;
});
