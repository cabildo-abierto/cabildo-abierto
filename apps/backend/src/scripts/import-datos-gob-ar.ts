import {ckanImporter} from './ckan-import.js';

const importer = ckanImporter({
    baseUrl: 'https://datos.gob.ar', blockPrefix: 'ds-datos-gob-ar-',
    editMessage: '[datos.gob.ar:sync:v1] Importación de recursos CSV', scriptName: 'script:import-datos-gob-ar',
    trackingTitle: 'Catálogo de datos.gob.ar', trackingFilename: 'catalogo-datos-gob-ar.csv',
    trackingDescription: 'Lista completa de conjuntos de datos obtenidos del portal nacional de datos abiertos, incluyendo los conjuntos de datos cuya obtención falló.',
});

importer.run(process.argv.slice(2)).catch(error => {
    console.error(error instanceof Error ? error.message : 'Falló la importación.');
    process.exitCode = 1;
});
