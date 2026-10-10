import {ckanImporter} from './ckan-import.js';

const importer = ckanImporter({
    baseUrl: 'https://data.buenosaires.gob.ar', blockPrefix: 'ds-buenos-aires-data-',
    editMessage: '[buenos-aires-data:sync:v1] Importación de recursos CSV', scriptName: 'script:import-buenos-aires-data',
    trackingTitle: 'Catálogo de Buenos Aires Data', trackingFilename: 'catalogo-buenos-aires-data.csv',
    trackingDescription: 'Lista completa de conjuntos de datos obtenidos de Buenos Aires Data, incluyendo los conjuntos de datos cuya obtención falló.',
});

importer.run(process.argv.slice(2)).catch(error => {
    console.error(error instanceof Error ? error.message : 'Falló la importación.');
    process.exitCode = 1;
});
