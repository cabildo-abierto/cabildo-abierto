import {clean} from './dataset-import.js';
import {datasetLimits} from '#/services/datasets/csv.js';
import {argendataRepository, argendataRepositoryFiles} from './argendata-repository.js';
import {argendataLibraryUrl, indexArgendataLibrary, type ArgendataLibraryEntry} from './argendata-description.js';

export {argendataDescription} from './argendata-description.js';

export type RepositoryFile = {path: string};
export type ArgendataResource = {
    path: string; topic: string; title: string; format: 'csv' | 'geojson'; url: string; pageUrl: string;
    metadataPath: string | null; metadataUrl: string; metadata: Record<string, unknown>; metadataError: string;
    exists: boolean; commit: string;
    library?: ArgendataLibraryEntry[]; topicLabel?: string;
};

function fileUrl(commit: string, path: string, raw: boolean) {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    return raw ? `https://raw.githubusercontent.com/${argendataRepository}/${commit}/${encoded}`
        : `https://github.com/${argendataRepository}/blob/${commit}/${encoded}`;
}

async function fetchText(url: string, maxBytes = datasetLimits().bytes) {
    const headers: Record<string, string> = {'User-Agent': 'CabildoAbierto-Argendata'};
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const response = await fetch(url, {headers, signal: AbortSignal.timeout(30_000)});
            if (!response.ok) {
                await response.body?.cancel();
                throw new Error(`HTTP ${response.status} al leer ${url}.`);
            }
            if (!response.body) throw new Error(`Respuesta vacía al leer ${url}.`);
            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let size = 0;
            try {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    size += value.length;
                    if (size > maxBytes) throw new Error(`El archivo supera el tamaño permitido: ${url}.`);
                    chunks.push(value);
                }
            } finally { await reader.cancel(); }
            return new TextDecoder('utf-8', {fatal: true}).decode(Buffer.concat(chunks));
        } catch (error) { lastError = error; }
    }
    throw lastError;
}

function object(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function indexTitles(markdown: string) {
    const titles = new Map<string, string>();
    for (const line of markdown.split('\n')) {
        const cells = line.split('|');
        if (cells.length < 4) continue;
        const match = line.match(/\[([^\]]+)\]\(https:\/\/github\.com\/argendatafundar\/data\/tree\/[^/]+\/([^#)]+)#([^)]*)\)/);
        if (!match || !/csv$|geojson$/i.test(match[3])) continue;
        const format = /geojson$/i.test(match[3]) ? 'geojson' : 'csv';
        const name = clean(match[1]).replace(/`/g, '');
        const path = `${decodeURIComponent(match[2])}/${name.replace(/\.(csv|geojson)$/i, '')}.${format}`;
        if (!titles.has(path)) titles.set(path, clean(cells[1]));
    }
    return titles;
}

export function repositoryResources(files: RepositoryFile[], titles: Map<string, string>, commit: string): ArgendataResource[] {
    const byPath = new Map(files.map(file => [file.path, file]));
    const paths = new Set(files.filter(file => /\.(csv|geojson)$/i.test(file.path)).map(file => file.path));
    for (const path of titles.keys()) paths.add(path);
    const stems = new Set([...paths].map(path => path.replace(/\.(csv|geojson)$/i, '')));
    for (const file of files) {
        if (!/\.json$/i.test(file.path)) continue;
        const stem = file.path.slice(0, -5);
        if (!stems.has(stem)) paths.add(`${stem}.csv`);
    }
    return [...paths].sort((a, b) => a.localeCompare(b)).map(path => {
        const metadataPath = path.replace(/\.(csv|geojson)$/i, '.json');
        const topic = path.split('/').slice(0, -1).join('/');
        return {path, topic, title: (titles.get(path) || `${topic}: ${path.split('/').at(-1)!.replace(/\.(csv|geojson)$/i, '').replaceAll('_', ' ')}`).slice(0, 200),
            format: /\.geojson$/i.test(path) ? 'geojson' : 'csv', exists: byPath.has(path), commit,
            url: fileUrl(commit, path, true), pageUrl: fileUrl(commit, path, false), metadata: {},
            metadataPath: byPath.has(metadataPath) ? metadataPath : null,
            metadataUrl: byPath.has(metadataPath) ? fileUrl(commit, metadataPath, false) : '', metadataError: ''};
    });
}

export async function argendataCatalog(limit?: number, resourceId?: string) {
    const {commit, files} = await argendataRepositoryFiles();
    const seen = new Set(files.map(file => file.path));
    const markdown = seen.has('README.md') ? await fetchText(fileUrl(commit, 'README.md', true)) : '';
    const titles = indexTitles(markdown);
    const topics = new Map([...markdown.matchAll(/^## \[([^\]]+)\]\(\.\/([^/)]+)\/\)/gm)]
        .map(match => [match[2], clean(match[1])]));
    const all = repositoryResources(files, titles, commit);
    for (const item of all) item.topicLabel = topics.get(item.topic);
    try {
        const library = indexArgendataLibrary(JSON.parse(await fetchText(argendataLibraryUrl)));
        for (const item of all) {
            item.library = library.byPath.get(item.path);
            item.topicLabel = library.topics.get(item.topic) ?? item.topicLabel;
        }
    } catch (error) {
        console.warn(`Argendata: no se pudo enriquecer la descripción desde la biblioteca; se usará la información del repositorio. ${error instanceof Error ? error.message : String(error)}`);
    }
    let resources = all;
    if (resourceId !== undefined) {
        resources = all.filter(item => item.path === resourceId || item.metadataPath === resourceId);
        if (resources.length !== 1) throw new Error(`No se encontró un dataset único para la ruta ${resourceId}.`);
    } else if (limit !== undefined) resources = all.filter(item => item.format === 'csv' && item.exists).slice(0, limit);
    let next = 0;
    async function worker() {
        while (next < resources.length) {
            const item = resources[next++];
            if (!item.metadataPath) { item.metadataError = 'No hay ficha JSON asociada.'; continue; }
            try {
                const value: unknown = JSON.parse(await fetchText(fileUrl(commit, item.metadataPath, true)));
                if (!object(value)) throw new Error('La ficha JSON debe ser un objeto.');
                item.metadata = Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'data'));
                const extension = Array.isArray(value.extension) ? value.extension[0] : value.extension;
                if (typeof extension === 'string' && extension.toLowerCase() === 'geojson') item.format = 'geojson';
                const geometry = object(value.data) ? value.data : value;
                if (geometry.type === 'FeatureCollection' || geometry.type === 'Feature' || Array.isArray(geometry.features)) {
                    item.format = 'geojson';
                    item.metadata = Object.fromEntries(Object.entries(item.metadata).filter(([key]) => !['features', 'geometry', 'coordinates'].includes(key)));
                }
            } catch (error) { item.metadataError = error instanceof Error ? error.message : 'No se pudo leer la ficha JSON.'; }
        }
    }
    await Promise.all(Array.from({length: Math.min(4, resources.length)}, () => worker()));
    return {resources, commit, limited: limit !== undefined || resourceId !== undefined, total: all.length};
}

