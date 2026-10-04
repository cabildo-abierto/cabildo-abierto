import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {transformJSON} from '../services/datasets/jq.js';

const directory = await mkdtemp(join(tmpdir(), 'ca-jq-check-'));
try {
    const input = join(directory, 'input.json');
    await writeFile(input, '[{"value":2}]');
    const output = await transformJSON(input, '[.[] | {value: (.value * 3), environment: env}]', directory, {bytes: 1024, memoryMB: 128, seconds: 10});
    const rows = JSON.parse(await readFile(output, 'utf8'));
    if (rows.length !== 1 || rows[0].value !== 6 || Object.entries(rows[0].environment).some(([key, value]) => key !== 'PWD' || value !== '/')) throw new Error('El aislamiento no cumple la configuración esperada.');
    console.log('jq funciona con Bubblewrap, sin entorno heredado y con límites de recursos.');
} catch (error) {
    console.error(error instanceof Error ? error.message : 'No se pudo comprobar jq.');
    process.exitCode = 1;
} finally { await rm(directory, {recursive: true, force: true}); }
