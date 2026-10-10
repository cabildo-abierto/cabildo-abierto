import {argendataCatalog, argendataDescription} from './argendata-catalog.js';
import {catalogImporter} from './catalog-import.js';

const importer = catalogImporter({
    prefix: 'ds-argendata-', editMessage: '[argendata:sync:v1] Importación de recursos CSV',
    scriptName: 'script:import-argendata', resourceUsage: 'RUTA', label: 'Argendata',
    catalog: async (limit, resourceId) => {
        const source = await argendataCatalog(limit, resourceId);
        console.log(`Repositorio: commit ${source.commit}.`);
        for (const item of source.resources) if (item.metadataError) console.warn(`METADATA ${item.path}: ${item.metadataError}`);
        return source;
    },
    candidate: item => ({resourceId: item.path, title: item.title, description: argendataDescription(item),
        url: item.url, sourceFormat: 'csv', jqFilter: null}),
    resourceError: item => item.format === 'geojson' ? 'Formato GeoJSON no soportado por este importador'
        : !item.exists ? 'No se encontró el archivo CSV asociado.' : null,
    tracking: {
        headers: ['recurso_id', 'ruta', 'topico', 'titulo', 'formato', 'recurso_url', 'archivo_url', 'metadata_url', 'metadata_json', 'error_metadata', 'commit', 'estado', 'detalle', 'procesado_en'],
        filename: 'catalogo-argendata.csv', title: 'Catálogo de Argendata',
        description: 'Lista completa de conjuntos de datos del repositorio de Argendata, incluyendo los conjuntos de datos cuya obtención falló.',
        row: (item, outcome, processedAt) => [item.path, item.path, item.topic, item.title, item.format, item.url,
            item.pageUrl, item.metadataUrl, JSON.stringify(item.metadata), item.metadataError, item.commit,
            outcome.status, outcome.detail, processedAt],
    },
});

importer.run(process.argv.slice(2)).catch(error => {
    console.error(error instanceof Error ? error.message : 'Falló la importación de Argendata.');
    process.exitCode = 1;
});
