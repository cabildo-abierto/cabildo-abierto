import {catalogImporter} from './catalog-import.js';
import {senadoCatalog, senadoCatalogUrl, senadoDescription, senadoFilter} from './senado-catalog.js';

const importer = catalogImporter({
    prefix: 'ds-senado-', editMessage: '[senado:sync:v1] Importación de recursos JSON',
    scriptName: 'script:import-senado', resourceUsage: 'ID_EXPORTACION', label: 'Senado',
    catalog: senadoCatalog,
    candidate: item => ({resourceId: item.id, title: item.title.slice(0, 200), description: senadoDescription(item),
        url: item.jsonUrl, sourceFormat: 'json', jqFilter: senadoFilter}),
    resourceError: item => item.jsonUrl ? null : 'El conjunto no publica una exportación JSON; no se intentó importar Excel.',
    tracking: {
        headers: ['conjunto_id', 'titulo', 'organismo', 'catalogo_url', 'consulta_url', 'json_url', 'excel_url', 'filtro_jq', 'estado', 'detalle', 'procesado_en'],
        filename: 'catalogo-senado.csv', title: 'Catálogo del Senado',
        description: 'Lista completa de conjuntos de datos obtenidos del portal de datos abiertos del Senado de la Nación, incluyendo los conjuntos de datos cuya obtención falló.',
        row: (item, outcome, processedAt) => [item.id, item.title, 'Senado de la Nación', senadoCatalogUrl,
            item.pageUrl, item.jsonUrl, item.excelUrl, senadoFilter, outcome.status, outcome.detail, processedAt],
    },
});

importer.run(process.argv.slice(2)).catch(error => {
    console.error(error instanceof Error ? error.message : 'Falló la importación del Senado.');
    process.exitCode = 1;
});
