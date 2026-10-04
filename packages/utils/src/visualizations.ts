import {Ajv} from 'ajv';
import type {VisualizationContent, VisualizationSpecV1} from '@cabildo-abierto/api';
import {visualizationSchema} from './generated/visualization-schema.js';
export const validateVisualizationSpec = new Ajv({allErrors: true, strict: false}).compile<VisualizationSpecV1>(visualizationSchema);
export function visualizationSpecValidationHelp(spec: VisualizationSpecV1): string | null {
    const chartType = spec.chart.type;
    if (validateVisualizationSpec(spec)) return null;
    const errors = (validateVisualizationSpec.errors ?? []).filter(error => {
        const variant = error.schemaPath.match(/^#\/definitions\/(bar|line|scatter|histogram|table)Chart\//)?.[1];
        return !variant || variant === chartType;
    });
    const error = errors.find(error => ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems'].includes(error.keyword))
        ?? errors.find(error => !['oneOf', 'const'].includes(error.keyword));
    if (!error) return 'Elegí un tipo de gráfico y completá sus opciones con valores válidos.';
    const parts = error.instancePath.split('/').filter(Boolean);
    const parameter = error.keyword === 'required' ? error.params.missingProperty : parts.at(-1);
    const names: Record<string, string> = {tickLabelAngle: 'La rotación', tickCount: 'La cantidad de marcas', precision: 'La cantidad de decimales',
        aspectRatio: 'La relación ancho/alto', count: 'La cantidad de intervalos', pageSize: 'Las filas por página', title: 'El título',
        description: 'La descripción', label: 'La etiqueta', field: 'La columna', series: 'Las series', columns: 'Las columnas', boundaries: 'Los límites de los intervalos'};
    const axis = parts.includes('x') ? ' del eje X' : parts.includes('y') || parts.includes('yAxis') ? ' del eje Y' : '';
    const name = (names[parameter] ?? `El parámetro «${parameter ?? 'gráfico'}»`) + axis;
    let rule: unknown = visualizationSchema;
    for (const part of error.schemaPath.split('/').slice(1, -1)) rule = rule && typeof rule === 'object' ? (rule as Record<string, unknown>)[part] : undefined;
    // AJV can report a path relative to a referenced definition.
    if (!rule) {
        for (const definition of Object.values(visualizationSchema.definitions)) {
            const properties = (definition as {properties?: Record<string, unknown>}).properties;
            if (properties?.[parameter]) { rule = properties[parameter]; break; }
        }
    }
    const constraints = rule as {minimum?: number; maximum?: number; type?: string} | undefined;
    if (error.keyword === 'minimum' || error.keyword === 'maximum') {
        const unit = parameter === 'tickLabelAngle' ? '°' : '';
        const number = constraints?.type === 'integer' ? 'un número entero' : 'un número';
        if (constraints?.minimum !== undefined && constraints.maximum !== undefined) return `${name} debe ser ${number} entre ${constraints.minimum}${unit} y ${constraints.maximum}${unit}.`;
        return `${name} debe ser ${number} ${error.keyword === 'minimum' ? 'mayor o igual' : 'menor o igual'} a ${error.params.limit}${unit}.`;
    }
    if (error.keyword === 'type') return `${name} debe ser ${error.params.type === 'integer' ? 'un número entero' : error.params.type === 'number' ? 'un número válido' : 'un valor del tipo esperado'}.`;
    if (error.keyword === 'maxLength' || error.keyword === 'minLength') return `${name} debe tener ${error.keyword === 'maxLength' ? 'como máximo' : 'al menos'} ${error.params.limit} caracteres.`;
    if (error.keyword === 'maxItems' || error.keyword === 'minItems') return `${name} debe tener ${error.keyword === 'maxItems' ? 'como máximo' : 'al menos'} ${error.params.limit} elementos.`;
    if (error.keyword === 'enum') return `${name} debe usar uno de estos valores: ${error.params.allowedValues.join(', ')}.`;
    if (error.keyword === 'required') return `${name} es obligatorio.`;
    return `${name} tiene un valor inválido. Revisá esa opción de la visualización.`;
}
export function parseVisualizationBlock(content: string): VisualizationContent | null {
    try {
        const value = JSON.parse(content);
        if (!value || typeof value !== 'object' || Array.isArray(value)
            || Object.keys(value).some(key => !['query', 'queryMode', 'queryLanguageVersion', 'spec'].includes(key))
            || typeof value.query !== 'string' || !value.query.trim() || value.query.length > 20000
            || !['auto', 'custom'].includes(value.queryMode)
            || value.queryLanguageVersion !== 1 || !validateVisualizationSpec(value.spec)) return null;
        return {query: value.query, queryMode: value.queryMode, queryLanguageVersion: 1, spec: value.spec};
    } catch { return null; }
}

/** Columns consumed by the chart, in stable presentation order. */
export function visualizationColumns(chart: VisualizationSpecV1['chart']): string[] {
    let fields: string[];
    switch (chart.type) {
        case 'table': fields = chart.columns.map(column => column.field); break;
        case 'bar': case 'line': fields = [chart.x.field, ...chart.series.map(series => series.field), ...(chart.seriesBy ? [chart.seriesBy.field] : [])]; break;
        case 'scatter': fields = [chart.x.field, chart.y.field, ...(chart.color ? [chart.color.field] : []), ...(chart.size ? [chart.size.field] : [])]; break;
        case 'histogram': fields = [chart.x.field]; break;
    }
    if (!fields.length || fields.some(field => !field)) throw new Error('Elegí las columnas de la visualización.');
    return [...new Set(fields)];
}
