export const senadoCatalogUrl = 'https://www.senado.gob.ar/micrositios/DatosAbiertos/';
export const senadoFilter = '.table.rows';
export type SenadoResource = {id: string; title: string; jsonUrl: string; excelUrl: string; pageUrl: string};

function htmlText(value: string) {
    const entities: Record<string, string> = {amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' '};
    return value.replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code: string) => {
        if (!code.startsWith('#')) return entities[code.toLowerCase()] ?? entity;
        const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
        return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }).replace(/\s+/g, ' ').trim();
}

export function parseSenadoCatalog(html: string): SenadoResource[] {
    const resources = new Map<string, SenadoResource>();
    for (const section of html.matchAll(/<h4\b[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4\b|$)/gi)) {
        const title = htmlText(section[1]);
        const exports = new Map<string, {id: string; url: string}>();
        for (const anchor of section[2].matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) {
            const url = new URL(htmlText(anchor[2]), senadoCatalogUrl);
            const match = url.pathname.match(/^\/micrositios\/DatosAbiertos\/(Exportar[^/]+)\/(json|Excel)(?:\/[^/]+)?\/?$/i);
            if (!match || url.origin !== new URL(senadoCatalogUrl).origin) continue;
            const format = match[2].toLowerCase();
            const previous = exports.get(format);
            if (previous && previous.url !== url.href) throw new Error(`Exportaciones ambiguas en ${title}.`);
            exports.set(format, {id: match[1], url: url.href});
        }
        const json = exports.get('json'), excel = exports.get('excel');
        const id = json?.id ?? excel?.id;
        if (!title || !id || (json && excel && json.id !== excel.id)) throw new Error('No se pudo reconocer un conjunto del catálogo del Senado.');
        const consultation = section[2].match(/<p\b[^>]*>\s*Consultar[\s\S]*?<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/i);
        const pageUrl = consultation ? new URL(htmlText(consultation[2]), senadoCatalogUrl).href : senadoCatalogUrl;
        const item = {id, title, jsonUrl: json?.url ?? '', excelUrl: excel?.url ?? '', pageUrl};
        const previous = resources.get(id);
        if (previous && JSON.stringify(previous) !== JSON.stringify(item)) throw new Error(`Conjunto duplicado y ambiguo: ${id}.`);
        resources.set(id, item);
    }
    if (!resources.size) throw new Error('No se encontraron conjuntos en el catálogo del Senado; no se publicará un catálogo vacío.');
    return [...resources.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export async function senadoCatalog(limit?: number, resourceId?: string) {
    const response = await fetch(senadoCatalogUrl, {signal: AbortSignal.timeout(30_000)});
    if (!response.ok) throw new Error(`No se pudo leer el catálogo del Senado: HTTP ${response.status}.`);
    const all = parseSenadoCatalog(await response.text());
    const selected = resourceId ? all.filter(item => item.id === resourceId) : all.slice(0, limit);
    if (resourceId && !selected.length) throw new Error(`No existe el recurso ${resourceId} en el catálogo del Senado.`);
    return {resources: selected, total: all.length, limited: selected.length < all.length};
}

export function senadoDescription(item: SenadoResource) {
    return [`Fuente: ${senadoCatalogUrl}`, `Consulta: ${item.pageUrl}`, 'Organismo: Senado de la Nación',
        item.jsonUrl && `JSON: ${item.jsonUrl}`, item.excelUrl && `Excel: ${item.excelUrl}`].filter(Boolean).join('\n\n');
}
