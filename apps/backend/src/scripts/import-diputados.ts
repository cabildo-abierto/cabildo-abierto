import {ckanImporter} from './ckan-import.js';

const importer = ckanImporter({
    baseUrl: 'https://datos.hcdn.gob.ar', blockPrefix: 'ds-diputados-',
    editMessage: '[diputados:sync:v1] Importación de recursos CSV', scriptName: 'script:import-diputados',
    trackingTitle: 'Catálogo de Diputados', trackingFilename: 'catalogo-diputados.csv',
    trackingDescription: 'Lista completa de conjuntos de datos obtenidos del portal de datos abiertos de la Cámara de Diputados de la Nación, incluyendo los conjuntos de datos cuya obtención falló.',
});

importer.run(process.argv.slice(2)).catch(error => {
    console.error(error instanceof Error ? error.message : 'Falló la importación.');
    process.exitCode = 1;
});
