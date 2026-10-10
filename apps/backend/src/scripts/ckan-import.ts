import type {Kysely} from 'kysely';
import {clean, datasetImporter, importOptions, prepareImportedCSV, sameDataset, type Mode, type Candidate, type Change, type TopicState} from './dataset-import.js';
import {parseDatasetBlock, validDatasetUrl} from '@cabildo-abierto/utils';
import type {DB} from '#/db/types.js';
import {env} from '#/lib/env.js';
import {setupKysely} from '#/setup.js';
import {S3Storage} from '#/services/storage/storage.js';
import {Logger} from '#/utils/logger.js';
import {ckanTracking, type CatalogPackage, type CatalogResource, type ResourceOutcome} from './ckan-tracking.js';

type CKANImportConfig = {
    baseUrl: string; blockPrefix: string; editMessage: string; scriptName: string;
    trackingTitle: string; trackingFilename: string; trackingDescription: string;
};
const pageSize = 10;

type Finding = {kind: 'omit' | 'conflict' | 'missing' | 'candidate' | 'unchanged'; resourceId: string; reason: string};
export function ckanImporter({baseUrl, blockPrefix, editMessage, scriptName, trackingTitle, trackingFilename, trackingDescription}: CKANImportConfig) {
    const catalogUrl = `${baseUrl}/api/3/action/package_search`;
    const trackingBlockNumber = `${blockPrefix}catalog`;
    const {trackingRows, mergeTrackingRows, prepareTrackingDataset, removeUnpublishedTrackingFile} = ckanTracking({
        baseUrl, filename: trackingFilename, title: trackingTitle, description: trackingDescription,
    });
    const {readTopicState, conflict, apply, blockNumber} = datasetImporter(blockPrefix, editMessage);

    function usage(): never {
        throw new Error(`Uso: pnpm --filter backend run ${scriptName} --topic <id> --user <username> [--dry-run=full|--dry-run=metadata|--apply] [--limit N | --resource ID_CKAN]`);
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
        const source = `${baseUrl}/dataset/${encodeURIComponent(pkg.name)}`;
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

    async function catalog(limit?: number): Promise<{packages: CatalogPackage[]; totalResources: number; csvResources: number; catalogCount: number | null; limited: boolean}> {
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

    async function ckanRecord(action: 'resource_show' | 'package_show', id: string): Promise<Record<string, unknown>> {
        const url = new URL(action, catalogUrl);
        url.searchParams.set('id', id);
        const response = await fetch(url, {signal: AbortSignal.timeout(30_000)});
        if (response.status === 404) throw new Error(`No se encontró ${id} en CKAN (${action}).`);
        if (!response.ok) throw new Error(`No se pudo consultar ${action} en CKAN: HTTP ${response.status}.`);
        const body: unknown = await response.json();
        if (!body || typeof body !== 'object' || !('success' in body) || body.success !== true
            || !('result' in body) || !body.result || typeof body.result !== 'object' || Array.isArray(body.result)) {
            throw new Error(`CKAN devolvió una respuesta inválida para ${action}: ${id}.`);
        }
        return body.result as Record<string, unknown>;
    }

    async function resourceCatalog(resourceId: string): Promise<Awaited<ReturnType<typeof catalog>>> {
        const resource = await ckanRecord('resource_show', resourceId);
        if (resource.id !== resourceId || !clean(resource.package_id)) {
            throw new Error(`El recurso ${resourceId} no tiene un dataset CKAN válido.`);
        }
        const value = await ckanRecord('package_show', clean(resource.package_id));
        if (value.id !== resource.package_id || typeof value.name !== 'string' || !Array.isArray(value.resources)
            || value.resources.some(item => !item || typeof item !== 'object')) {
            throw new Error(`El dataset CKAN del recurso ${resourceId} tiene un formato inesperado.`);
        }
        const pkg = value as unknown as CatalogPackage;
        const selected = pkg.resources.find(item => item.id === resourceId);
        if (!selected) throw new Error(`El recurso ${resourceId} ya no figura en su dataset CKAN. Reintentá.`);
        if (!isCsv(selected)) throw new Error(`El recurso ${resourceId} no es CSV (formato: ${clean(selected.format) || 'desconocido'}).`);
        return {packages: [{...pkg, resources: [selected]}], totalResources: 1, csvResources: 1, catalogCount: null, limited: true};
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
                    const content = await prepareImportedCSV(database, item, mode);
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
            if (number === trackingBlockNumber || seenBlockNumbers.has(number)) continue;
            findings.push({kind: 'missing', resourceId: number, reason: 'Ya no figura como recurso CSV en el catálogo; se conserva.'});
        }
        changes.sort((a, b) => a.candidate.blockNumber.localeCompare(b.candidate.blockNumber));
        findings.sort((a, b) => a.resourceId.localeCompare(b.resourceId));
        return {changes, findings};
    }

    function resourceOutcomes(result: Awaited<ReturnType<typeof planImport>>, mode: Mode) {
        const outcomes = new Map<string, ResourceOutcome>();
        for (const change of result.changes) outcomes.set(change.candidate.resourceId, {
            status: 'obtenido', detail: change.kind === 'add' ? 'CSV obtenido y preparado para importar.' : 'CSV obtenido y preparado para actualizar.',
        });
        for (const finding of result.findings) {
            if (finding.kind === 'missing') continue;
            const status = finding.kind === 'omit' ? 'falló' : finding.kind === 'conflict' ? 'conflicto'
                : mode === 'metadata' ? 'no_verificado' : 'obtenido';
            outcomes.set(finding.resourceId, {status, detail: finding.reason});
        }
        return outcomes;
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
            ? `Muestra parcial: ${source.csvResources} recursos CSV de ${source.packages.length} datasets${source.catalogCount === null ? '' : `; CKAN informa ${source.catalogCount} datasets en total`}.`
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

    async function main(args: string[]) {
        const {topicId, username, mode, limit, resourceId} = importOptions(args, usage);
        const database = setupKysely(env.DIRECT_URL || env.DATABASE_URL, 1);
        const ctx = {kysely: database, logger: new Logger(scriptName), topicConnections: null};
        try {
            const [topic, user] = await Promise.all([
                database.selectFrom('topic').select(['id', 'title']).where('id', '=', topicId).executeTakeFirst(),
                database.selectFrom('user').select(['id', 'username']).where('username', '=', username).executeTakeFirst(),
            ]);
            if (!topic) throw new Error(`No existe el tema ${topicId}.`);
            if (!user) throw new Error(`No existe el usuario ${username}.`);
            console.log(`Tema: ${topic.title} (${topic.id}); autor: ${user.username}; modo: ${mode}${limit === undefined ? '' : `; límite: ${limit} CSV`}${resourceId ? `; recurso: ${resourceId}` : ''}.`);
            const [source, state] = await Promise.all([resourceId ? resourceCatalog(resourceId) : catalog(limit), readTopicState(database, topicId)]);
            const trackingConflict = conflict(state, trackingBlockNumber);
            if (trackingConflict) throw new Error(`No se puede actualizar el seguimiento: ${trackingConflict}`);
            const previousTracking = state.byNumber.get(trackingBlockNumber);
            const previousTrackingContent = previousTracking ? parseDatasetBlock(previousTracking.content) : null;
            if (previousTracking && !previousTrackingContent) throw new Error('El dataset de seguimiento vigente es inválido.');
            const result = await planImport(database, source, state, mode);
            report(source, result, mode);
            let rows = trackingRows(source.packages, resourceOutcomes(result, mode), new Date().toISOString());
            const storage = mode === 'apply' || (source.limited && previousTrackingContent) ? new S3Storage() : null;
            if (source.limited && previousTrackingContent && storage) rows = await mergeTrackingRows(ctx, storage, previousTrackingContent, rows);
            console.log(`Seguimiento: ${previousTracking ? 'actualizar' : 'crear'} ${trackingTitle}; ${rows.length} filas${source.limited ? '; se conservan los recursos no seleccionados' : ''}.`);
            if (mode === 'apply') {
                const content = await prepareTrackingDataset(ctx, storage!, user.id, rows);
                try {
                    const changes: Change[] = [...result.changes, {kind: previousTracking ? 'update' : 'add',
                        candidate: {resourceId: trackingBlockNumber, blockNumber: trackingBlockNumber, title: trackingTitle, description: content.description, url: ''},
                        content, previousId: previousTracking?.id}];
                    const editId = await apply(database, topicId, user.id, state, changes);
                    console.log(`Edición publicada: ${editId}`);
                } catch (error) {
                    await removeUnpublishedTrackingFile(ctx, storage!, content.fileId!).catch(cleanupError => ctx.logger.pino.error({cleanupError, fileId: content.fileId}, 'tracking cleanup failed'));
                    throw error;
                }
            } else console.log('Dry-run terminado; no se escribió en la base.');
        } finally { await database.destroy(); }
    }


    return {catalog, resourceCatalog, planImport, candidate, run: main};
}
