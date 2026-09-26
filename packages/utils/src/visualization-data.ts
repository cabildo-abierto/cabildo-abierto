import type {TypedTable, TableValue, VisualizationSpecV1, ValueFormat, DatasetColumnType} from '@cabildo-abierto/api';
import {validateVisualizationSpec} from './visualizations.js';
export type PlotPoint = {x: number; y: number | null; size?: number};
export type PlotSeries = {label: string; points: PlotPoint[]};
export type BarRow = {key: string; label: string; values: (number | null)[]};
export type VisualizationData = {kind: 'bar'; rows: BarRow[]; labels: string[]} | {kind: 'line' | 'scatter'; series: PlotSeries[]; temporal: boolean} | {kind: 'table'};
export function formatTableValue(value: TableValue, format?: ValueFormat): string {
    if (value === null) return '';
    if (format?.type === 'date') {
        const date = new Date(String(value));
        const options: Intl.DateTimeFormatOptions = format.style === 'year' ? {year: 'numeric'} : format.style === 'month' ? {year: 'numeric', month: 'short'} : format.style === 'datetime' ? {dateStyle: 'short', timeStyle: 'short'} : {dateStyle: 'short'};
        return new Intl.DateTimeFormat('es-AR', {...options, timeZone: 'UTC'}).format(date);
    }
    if (typeof value === 'number') return new Intl.NumberFormat('es-AR', {style: format?.type === 'percent' ? 'percent' : 'decimal', maximumFractionDigits: format?.precision ?? (format?.type === 'percent' ? 0 : 6), minimumFractionDigits: format?.precision}).format(value);
    return String(value);
}
export function prepareVisualization(spec: VisualizationSpecV1, table: TypedTable): VisualizationData {
    if (!validateVisualizationSpec(spec)) throw new Error('La configuración de la visualización no es válida.');
    const chart = spec.chart;
    const numeric = (type: DatasetColumnType) => type === 'integer' || type === 'decimal';
    function field(name: string, allowed?: DatasetColumnType[], format?: ValueFormat) {
        const index = table.columns.findIndex(column => column.name === name);
        if (index < 0) throw new Error(`No encontramos la columna «${name}».`);
        const type = table.columns[index].type;
        if (allowed && !allowed.includes(type)) throw new Error(`La columna «${name}» tiene un tipo incompatible.`);
        if (format && (format.type === 'date' ? !['date', 'datetime'].includes(type) : !numeric(type))) throw new Error(`El formato de «${name}» no corresponde a su tipo.`);
        return index;
    }
    function number(value: TableValue): number | null {
        if (value === null) return null;
        if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('La tabla contiene un valor numérico inválido.');
        return value;
    }
    if (table.rows.some(row => row.length !== table.columns.length)) throw new Error('La tabla tiene filas inconsistentes.');
    if (chart.type === 'table') {
        if (new Set(chart.columns.map(c => c.field)).size !== chart.columns.length) throw new Error('No repitas columnas visibles.');
        chart.columns.forEach(c => field(c.field, undefined, c.format));
        return {kind: 'table'};
    }
    const x = field(chart.x.field, chart.type === 'line' ? ['integer', 'decimal', 'date', 'datetime'] : chart.type === 'bar' ? undefined : ['integer', 'decimal'], chart.x.format);
    if (chart.type !== 'scatter' && chart.yAxis?.format?.type === 'date') throw new Error('El eje de valores necesita un formato numérico.');
    if (chart.type === 'histogram') {
        const values = table.rows.map(row => number(row[x])).filter((value): value is number => value !== null);
        if (!values.length) return {kind: 'bar', rows: [], labels: ['Frecuencia']};
        let min = Infinity, max = -Infinity;
        for (const value of values) { min = Math.min(min, value); max = Math.max(max, value); }
        const bins = chart.bins ?? {mode: 'auto'};
        const count = bins.mode === 'count' ? bins.count : Math.min(100, Math.ceil(Math.log2(values.length) + 1));
        const bounds = bins.mode === 'boundaries' ? bins.boundaries : min === max ? [min - 0.5, max + 0.5] : Array.from({length: count + 1}, (_, i) => i === count ? max : min + (max - min) * i / count);
        if (bounds.some((v,i) => !Number.isFinite(v) || (i > 0 && v <= bounds[i - 1])) || bounds[0] > min || bounds[bounds.length - 1] < max) throw new Error('Los límites del histograma deben ser crecientes y cubrir los datos.');
        const counts = Array(bounds.length - 1).fill(0) as number[];
        for (const value of values) {
            const index = value === bounds[bounds.length - 1] ? counts.length - 1 : bounds.findIndex((b,i) => i < counts.length && value >= b && value < bounds[i + 1]);
            counts[index]++;
        }
        return {kind: 'bar', labels: ['Frecuencia'], rows: counts.map((count,i) => ({key: String(i), label: `${formatTableValue(bounds[i], chart.x.format)}–${formatTableValue(bounds[i+1], chart.x.format)}`, values: [chart.frequency === 'relative' ? count / values.length : count]}))};
    }
    if (chart.type === 'scatter') {
        const y = field(chart.y.field, ['integer', 'decimal'], chart.y.format);
        const color = chart.color ? field(chart.color.field) : null;
        const size = chart.size ? field(chart.size.field, ['integer', 'decimal']) : null;
        const groups = new Map<string, PlotSeries>();
        for (const row of table.rows) {
            const xv = number(row[x]), yv = number(row[y]), sv = size === null ? undefined : number(row[size]);
            if (sv !== undefined && sv !== null && sv < 0) throw new Error('El tamaño de los puntos no puede ser negativo.');
            if (xv === null || yv === null || sv === null) continue;
            const key = color === null ? '' : JSON.stringify(row[color]);
            if (!groups.has(key)) groups.set(key, {label: color === null ? '' : row[color] === null ? 'Sin dato' : formatTableValue(row[color]), points: []});
            groups.get(key)!.points.push({x: xv, y: yv, size: sv});
        }
        return {kind: 'scatter', series: [...groups.values()], temporal: false};
    }
    const indices = chart.series.map(s => field(s.field, ['integer', 'decimal']));
    const group = chart.seriesBy ? field(chart.seriesBy.field) : null;
    const groups = new Map<string, TableValue>();
    for (const row of table.rows) if (row[x] !== null) groups.set(group === null ? '' : JSON.stringify(row[group]), group === null ? null : row[group]);
    const labels = [...groups.values()].flatMap(value => chart.series.map(s => (group === null ? '' : `${value === null ? 'Sin dato' : formatTableValue(value)} · `) + (s.label ?? s.field)));
    const points: PlotSeries[] = labels.map(label => ({label, points: []}));
    const bars = new Map<string, BarRow>();
    const seen = new Set<string>();
    const temporal = ['date', 'datetime'].includes(table.columns[x].type);
    for (const row of table.rows) {
        if (row[x] === null) continue;
        const key = JSON.stringify(row[x]);
        const groupKey = group === null ? '' : JSON.stringify(row[group]);
        const pair = JSON.stringify([key,groupKey]);
        if (seen.has(pair)) throw new Error('Hay más de una fila por categoría/X y serie. Agregá los datos en la consulta.');
        seen.add(pair);
        const offset = [...groups.keys()].indexOf(groupKey) * chart.series.length;
        if (!bars.has(key)) bars.set(key, {key, label: formatTableValue(row[x], chart.x.format), values: Array(labels.length).fill(null)});
        indices.forEach((index,i) => {
            const value = number(row[index]);
            if (chart.type === 'bar' && chart.layout === 'stacked' && value !== null && value < 0) throw new Error('Las barras apiladas requieren valores no negativos.');
            bars.get(key)!.values[offset+i] = value;
            if (chart.type === 'line') {
                const xv = temporal ? Date.parse(String(row[x])) : number(row[x])!;
                if (!Number.isFinite(xv)) throw new Error('El eje X contiene una fecha inválida.');
                points[offset+i].points.push({x: xv, y: value});
            }
        });
    }
    points.forEach(s => s.points.sort((a,b) => a.x - b.x));
    return chart.type === 'bar' ? {kind: 'bar', rows: [...bars.values()], labels} : {kind: 'line', series: points, temporal};
}
