import {clean} from './dataset-import.js';
import {importTracking} from './dataset-import-tracking.js';

export type CatalogResource = {id: string; name?: string; description?: string; format?: string; url?: string};
export type CatalogPackage = {
    id: string; name: string; title?: string; notes?: string; license_title?: string;
    organization?: {title?: string}; resources: CatalogResource[];
};
type Status = 'obtenido' | 'falló' | 'no_csv' | 'conflicto' | 'no_verificado';
export type ResourceOutcome = {status: Status; detail: string};
const headers = ['conjunto_id', 'conjunto_nombre', 'conjunto_titulo', 'organismo', 'licencia',
    'conjunto_descripcion', 'catalogo_url', 'recurso_id', 'recurso_nombre', 'recurso_descripcion',
    'formato', 'recurso_url', 'estado', 'detalle', 'procesado_en'];

export function ckanTracking({baseUrl, filename, title, description}: {baseUrl: string; filename: string; title: string; description: string}) {
    function trackingRows(packages: CatalogPackage[], outcomes: Map<string, ResourceOutcome>, processedAt: string) {
        const ids = new Set<string>();
        return packages.flatMap(pkg => pkg.resources.map(resource => {
            const id = clean(resource.id);
            if (!id || ids.has(id)) throw new Error(`ID de recurso CKAN ausente o duplicado: ${id || pkg.name}.`);
            ids.add(id);
            const outcome = outcomes.get(id) ?? {status: 'no_csv', detail: 'Formato no CSV; no se intentó obtener los datos.'};
            return [pkg.id, pkg.name, pkg.title, pkg.organization?.title, pkg.license_title, pkg.notes,
                `${baseUrl}/dataset/${encodeURIComponent(pkg.name)}`, id, resource.name,
                resource.description, resource.format, resource.url, outcome.status, outcome.detail, processedAt].map(clean);
        }));
    }
    return {...importTracking({headers, idColumn: 'recurso_id', filename, title, description}), trackingRows};
}
