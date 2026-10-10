import {clean} from './dataset-import.js';
import type {ArgendataResource} from './argendata-catalog.js';

export const argendataLibraryUrl = 'https://argendatafundar.github.io/biblioteca/manifest.json';
export type ArgendataLibraryEntry = {description: string; source: string; note: string; topic: string};

function object(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string {
    if (Array.isArray(value)) return [...new Set(value.map(text).filter(Boolean))].join('; ');
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return clean(value);
}

export function indexArgendataLibrary(value: unknown) {
    if (!object(value) || !Array.isArray(value.items)) throw new Error('El catálogo de la biblioteca es inválido.');
    const byPath = new Map<string, ArgendataLibraryEntry[]>();
    const topics = new Map<string, string>();
    for (const item of value.items) {
        if (!object(item)) continue;
        const topic = text(item.nombre_topico);
        const code = text(item.topico);
        if (code && topic && !topics.has(code)) topics.set(code, topic);
        if (typeof item.link_dataset !== 'string') continue;
        let url: URL;
        try { url = new URL(item.link_dataset); } catch { continue; }
        if (url.hostname !== 'argendata.fund.ar' || !url.pathname.startsWith('/data/')) continue;
        let path: string;
        try { path = decodeURIComponent(url.pathname.slice('/data/'.length)); } catch { continue; }
        const entries = byPath.get(path) ?? [];
        entries.push({description: text(item.bajada), source: text(item.fuente), note: text(item.nota), topic});
        byPath.set(path, entries);
    }
    return {byPath, topics};
}

function fields(value: unknown): Record<string, unknown> {
    return object(value) ? value : {};
}

export function argendataDescription(item: ArgendataResource) {
    const library = item.library ?? [];
    const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
    const summaries = unique(library.map(entry => entry.description));
    const details = summaries.length ? summaries : [item.title];
    details.push(`Tópico: ${item.topicLabel ?? item.topic}`);
    const sources = unique(library.map(entry => entry.source));
    if (sources.length) details.push(`Fuentes: ${sources.join('; ')}`);
    const notes = unique(library.map(entry => entry.note));
    if (notes.length) details.push(`Notas: ${notes.join('\n')}`);

    const metadata = item.metadata;
    const levels: Record<string, string> = {pais: 'País', provincia: 'Provincia', departamento: 'Departamento', global: 'Global'};
    const level = text(metadata.nivel_agregacion);
    if (level) details.push(`Nivel de agregación: ${levels[level] ?? level}`);
    const timeColumn = text(metadata.columna_indice_tiempo);
    const descriptions = fields(metadata.descripcion_columnas);
    const labels = fields(metadata.etiquetas_indicadores);
    const commonLabels: Record<string, string> = {anio: 'Año', mes: 'Mes', fecha: 'Fecha', valor: 'Valor'};
    const columnLabel = (column: string) => text(descriptions[column]) || text(labels[column]) || commonLabels[column] || column.replaceAll('_', ' ');
    if (timeColumn) details.push(`Referencia temporal: ${columnLabel(timeColumn)} (${timeColumn})`);
    const geoColumn = text(metadata.columna_geo_referencia);
    if (geoColumn) details.push(`Referencia geográfica: ${columnLabel(geoColumn)} (${geoColumn})`);
    const units = fields(metadata.unidades);
    const columns = unique([...Object.keys(descriptions), ...Object.keys(labels), ...Object.keys(units)]);
    const variables = columns.map(column => {
        const label = columnLabel(column);
        const unit = text(units[column]);
        return `${label} (${column})${unit ? `: ${unit}` : ''}`;
    });
    if (variables.length) details.push(`Variables:\n${variables.join('\n')}`);
    details.push(`Publicado por Argendata (Fundar). ${item.pageUrl}`);
    // Keep complete sections, reserving space for attribution within the existing limit.
    const attribution = details.pop()!;
    const result: string[] = [];
    for (const section of details) {
        if ([...result, section, attribution].join('\n\n').length <= 5000) result.push(section);
    }
    return [...result, attribution].join('\n\n');
}
