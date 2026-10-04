import {readFile, stat} from 'node:fs/promises';
import type {DatasetColumn, DatasetColumnType} from '@cabildo-abierto/api';
import {transformJSON} from './jq.js';
import {datasetLimits} from './csv.js';
import {env} from '#/lib/env.js';

export async function readDatasetJSON(path: string): Promise<unknown> {
    if ((await stat(path)).size > datasetLimits().bytes) throw new Error('El JSON supera el tamaño permitido.');
    try { return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(await readFile(path))); }
    catch { throw new Error('El archivo debe contener un único documento JSON válido en UTF-8.'); }
}

export async function inspectJSON(path: string, directory: string, filter: string | null, previousColumns: DatasetColumn[] = []) {
    await readDatasetJSON(path);
    const output = await transformJSON(path, filter, directory, {bytes: datasetLimits().bytes, memoryMB: env.DATASET_PREPARE_MEMORY_MB, seconds: env.DATASET_PREPARE_SECONDS});
    const data = await readDatasetJSON(output);
    if (!Array.isArray(data)) throw new Error('La transformación debe devolver un único array de objetos planos.');
    const types = new Map<string, DatasetColumnType | null>();
    for (let index = 0; index < data.length; index++) {
        const row = data[index];
        if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`La fila ${index + 1} debe ser un objeto.`);
        for (const [key, value] of Object.entries(row)) {
            if (!key.trim() || key.length > 1000 || key.includes('\0')) throw new Error(`La fila ${index + 1} tiene un nombre de columna inválido.`);
            if (!types.has(key)) types.set(key, null);
            if (types.size > 1000) throw new Error('El dataset supera las 1.000 columnas permitidas.');
            if (value === null) continue;
            if (typeof value === 'object') throw new Error(`La fila ${index + 1}, columna «${key}», contiene un objeto o array. Convertí sus valores a celdas simples con jq.`);
            if (typeof value === 'string' && value.includes('\0')) throw new Error(`La fila ${index + 1}, columna «${key}», contiene caracteres nulos.`);
            if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`La fila ${index + 1}, columna «${key}», contiene un número fuera de rango.`);
            const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? Number.isSafeInteger(value) ? 'integer' : 'decimal' : 'text';
            const previous = types.get(key);
            types.set(key, !previous || previous === type ? type : [previous, type].every(t => t === 'integer' || t === 'decimal') ? 'decimal' : 'text');
        }
    }
    const columns: DatasetColumn[] = types.size ? [...types].map(([name, type]) => ({name, type: type ?? 'text'})) : !data.length ? previousColumns : [];
    if (!columns.length) throw new Error('El resultado no tiene columnas. La primera preparación necesita al menos una fila con campos.');
    return {
        metadata: {columns, csvOptions: {delimiter: ',' as const, decimal: '.' as const}, rowCount: data.length, encoding: 'utf-8' as const},
        *rows() { for (const row of data) yield columns.map(column => !Object.hasOwn(row, column.name) || row[column.name] == null ? '' : String(row[column.name])); },
    };
}
