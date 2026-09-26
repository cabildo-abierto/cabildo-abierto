import {parse} from 'csv-parse/sync';
import type {CSVOptions, DatasetColumn} from '@cabildo-abierto/api';
import {inferDatasetType} from '@cabildo-abierto/utils';
import {env} from '#/lib/env.js';
import {TopicActionError} from '#/services/topic-title-edits.js';

export function datasetLimits() {
    return {bytes: env.DATASET_MAX_MB * 1024 * 1024, cells: env.DATASET_MAX_CELLS};
}
function decode(data: Uint8Array) {
    if (!data.length || data.length > datasetLimits().bytes) throw new TopicActionError(413, 'El CSV está vacío o supera el tamaño permitido.');
    try {
        const text = new TextDecoder('utf-8', {fatal: true}).decode(data);
        if (text.includes('\0')) throw new Error();
        return text;
    } catch { throw new TopicActionError(400, 'El CSV debe estar codificado en UTF-8.'); }
}
function records(text: string, delimiter: string, headerOnly = false): string[][] {
    let cells = 0;
    try { return parse(text, {delimiter, to: headerOnly ? 1 : undefined, bom: true, skip_empty_lines: true, max_record_size: datasetLimits().bytes,
        on_record: (row: string[]) => {
            cells += row.length;
            if (cells > datasetLimits().cells) throw new TopicActionError(413, 'El CSV supera la cantidad de celdas permitida.');
            return row;
        },
    }) as string[][]; }
    catch (error) { if (error instanceof TopicActionError) throw error; throw new TopicActionError(400, 'El CSV tiene filas inconsistentes o comillas inválidas. Revisá la estructura del archivo.'); }
}
function decimalMark(value: string): CSVOptions['decimal'] | null {
    const trimmed = value.trim();
    if (!/^[+-]?(?:\d*[.,]\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) return null;
    return trimmed.includes(',') ? ',' : '.';
}
export function parseCSV(data: Uint8Array) {
    const text = decode(data);
    const candidates = ([',', ';'] as const).flatMap(delimiter => {
        try { const header = records(text, delimiter, true); return header.length ? [{delimiter, width: header[0].length}] : []; }
        catch (error) { if (error instanceof TopicActionError && error.status === 413) throw error; return []; }
    }).sort((a, b) => b.width - a.width);
    // Do not reinterpret a malformed multi-column CSV as a single text column.
    const possible = candidates.some(c => c.width > 1) ? candidates.filter(c => c.width > 1) : candidates;
    const valid = possible.flatMap(candidate => {
        try {
            const rows = records(text, candidate.delimiter);
            const other = candidate.delimiter === ',' ? ';' : ',';
            // Decimal commas should not make a semicolon CSV look inconsistent.
            const residual = rows.slice(1).reduce((total, row) => total + row.filter(cell => cell.includes(other)
                && !decimalMark(cell)).length, 0);
            return [{...candidate, rows, residual}];
        } catch (error) { if (error instanceof TopicActionError && error.status === 413) throw error; return []; }
    }).sort((a, b) => b.width - a.width || a.residual - b.residual);
    if (!valid.length) throw new TopicActionError(400, 'El CSV tiene filas inconsistentes o una estructura inválida.');
    const {delimiter, rows: parsed} = valid[0];
    if (!parsed.length || !parsed[0].length) throw new TopicActionError(400, 'El CSV no tiene encabezados.');
    const names = parsed[0].map(name => name.trim());
    if (names.some(name => !name || name.length > 1000) || new Set(names).size !== names.length) throw new TopicActionError(400, 'Los encabezados deben ser únicos y no estar vacíos.');
    if (parsed.length * names.length > datasetLimits().cells) throw new TopicActionError(413, 'El CSV supera la cantidad de celdas permitida.');
    const rows = parsed.slice(1);
    let commas = 0; let dots = 0;
    for (const row of rows) for (const value of row) {
        const decimal = decimalMark(value);
        if (decimal === ',') commas++;
        if (decimal === '.') dots++;
    }
    const decimal: CSVOptions['decimal'] = commas > dots ? ',' : '.';
    const csvOptions = {delimiter, decimal};
    const columns: DatasetColumn[] = names.map((name, index) => ({name, type: inferDatasetType(rows.map(r => r[index]), csvOptions)}));
    return {columns, csvOptions, rows};
}
