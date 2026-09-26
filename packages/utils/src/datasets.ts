import type {CSVOptions, DatasetColumnType, DatasetContent, DatasetCell} from '@cabildo-abierto/api';

export const DATASET_TYPES: DatasetColumnType[] = ['text', 'integer', 'decimal', 'boolean', 'date', 'datetime'];
export const DATASET_TYPE_NAMES: Record<DatasetColumnType, string> = {
    text: 'Texto', integer: 'Entero', decimal: 'Decimal', boolean: 'Booleano', date: 'Fecha', datetime: 'Fecha con hora',
};
export function isAttachmentBlock(typeId: string) { return typeId === 'documento' || typeId === 'dataset'; }
export function parseDatasetBlock(content: string): DatasetContent | null {
    try {
        const v = JSON.parse(content) as DatasetContent;
        if (!v || typeof v.title !== 'string' || !v.title.trim() || v.title.length > 200
            || typeof v.description !== 'string' || v.description.length > 5000
            || !Array.isArray(v.columns) || !v.columns.length || v.columns.length > 200000
            || !v.columns.every(c => c && typeof c.name === 'string' && c.name.trim() && c.name.length <= 1000 && DATASET_TYPES.includes(c.type))
            || new Set(v.columns.map(c => c.name)).size !== v.columns.length
            || (v.rowCount !== undefined && (!Number.isSafeInteger(v.rowCount) || v.rowCount < 0))
            || !v.csvOptions || ![',', ';'].includes(v.csvOptions.delimiter) || !['.', ','].includes(v.csvOptions.decimal)) return null;
        const file = typeof v.fileId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.fileId);
        const url = typeof v.sourceUrl === 'string' && v.sourceUrl.length <= 4096 && validDatasetUrl(v.sourceUrl);
        if (file === url || (file && v.sourceUrl !== null) || (url && v.fileId !== null)) return null;
        return {title: v.title.trim(), description: v.description.trim(), fileId: file ? v.fileId : null,
            sourceUrl: url ? v.sourceUrl : null, columns: v.columns.map(c => ({name: c.name, type: c.type})),
            csvOptions: {delimiter: v.csvOptions.delimiter, decimal: v.csvOptions.decimal},
            ...(v.rowCount !== undefined && {rowCount: v.rowCount})};
    } catch { return null; }
}
export function validDatasetUrl(value: string) {
    try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password; }
    catch { return false; }
}
function dateValue(raw: string): string | null {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    const local = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
    const parts = iso ? iso.slice(1) : local ? [local[3], local[2], local[1]] : null;
    if (!parts) return null;
    const [year, month, day] = parts.map(Number);
    const d = new Date(0); d.setUTCFullYear(year, month - 1, day); d.setUTCHours(0, 0, 0, 0);
    return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day ? parts.join('-') : null;
}
export function datasetCell(raw: string, type: DatasetColumnType, options: CSVOptions): DatasetCell {
    const s = raw.trim();
    const result = (value: DatasetCell['value'], error: string | null = null): DatasetCell => ({raw, value, error});
    if (!s) return result(null);
    if (type === 'text') return result(raw);
    if (type === 'integer' && /^[+-]?\d+$/.test(s) && Number.isSafeInteger(Number(s))) return result(Number(s));
    if (type === 'decimal') {
        const pattern = options.decimal === '.' ? /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/ : /^[+-]?(?:\d+(?:,\d+)?|,\d+)(?:[eE][+-]?\d+)?$/;
        const normalized = s.replace(',', '.');
        const mantissa = normalized.split(/[eE]/)[0].replace(/^[+-]/, '').replace('.', '').replace(/^0+/, '');
        const n = Number(normalized);
        if (pattern.test(s) && Number.isFinite(n) && !(n === 0 && /[1-9]/.test(mantissa)) && mantissa.length <= 15 && (!Number.isInteger(n) || Number.isSafeInteger(n))) return result(n);
    }
    if (type === 'boolean') {
        if (['true', 'sí', 'si', '1'].includes(s.toLowerCase())) return result(true);
        if (['false', 'no', '0'].includes(s.toLowerCase())) return result(false);
    }
    if (type === 'date') { const value = dateValue(s); if (value) return result(value); }
    if (type === 'datetime' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)
        && dateValue(s.slice(0, 10)) && Number(s.slice(11, 13)) < 24 && Number(s.slice(14, 16)) < 60
        && (!s.slice(16).startsWith(':') || Number(s.slice(17, 19)) < 60) && Number.isFinite(Date.parse(s))) return result(s);
    return result(null, `No se puede interpretar como ${DATASET_TYPE_NAMES[type].toLowerCase()}.`);
}
export function inferDatasetType(values: string[], options: CSVOptions): DatasetColumnType {
    const nonEmpty = values.filter(v => v.trim());
    if (!nonEmpty.length || nonEmpty.some(v => /^[+-]?0\d/.test(v.trim()))) return 'text';
    return DATASET_TYPES.filter(t => t !== 'text').find(t => nonEmpty.every(v => !datasetCell(v, t, options).error)) ?? 'text';
}
