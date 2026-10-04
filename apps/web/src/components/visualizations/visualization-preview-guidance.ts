import type {TypedTable, VisualizationSpecV1} from '@cabildo-abierto/api';
import {visualizationSpecValidationHelp} from '@cabildo-abierto/utils';
import {DataViewRequestError} from '@/utils/react/data-view-request';
import type {PreviewMessage} from './visualization-preview-message';

export function dataViewGuidance({mode, hasSource, query, loading, formError, requestError}: {mode: 'basic' | 'advanced'; hasSource: boolean; query: string; loading: boolean; formError: string | null; requestError: Error | null}): PreviewMessage | null {
    const basic = mode === 'basic';
    if (basic && !hasSource) return {tone: 'help',title: 'Elegí un conjunto de datos',description: 'Buscá un conjunto de datos para empezar.'};
    if (basic && formError) return {tone: 'help',title: 'Completá la vista de datos',description: formError};
    if (!basic && !query.trim()) return {tone: 'help',title: 'Escribí una consulta LCCA',description: 'Usá SELECCIONAR para elegir las columnas y datos() para indicar el conjunto de datos. Cuando la consulta esté completa, vas a poder armar el gráfico.'};
    if (loading) return {tone: 'loading',title: basic ? 'Preparando la vista de datos' : 'Ejecutando la consulta LCCA',description: 'Cuando los datos estén listos, vas a poder configurar la visualización.'};
    if (requestError) {
        const system = !(requestError instanceof DataViewRequestError) || requestError.systemError;
        return system ? {tone: 'system',title: 'No pudimos cargar los datos',description: 'Ocurrió un problema al cargar la vista. Reintentá en unos momentos.',detail: requestError.message}
            : {tone: 'help',title: basic ? 'Revisá la vista de datos' : 'Revisá la consulta LCCA',description: basic ? 'Comprobá que el conjunto de datos esté disponible y que las columnas y los valores de los filtros correspondan a sus tipos.' : 'Comprobá la consulta, los nombres de las columnas y los conjuntos de datos que usa. Necesitamos una consulta que devuelva una tabla válida.',detail: requestError.message};
    }
    return null;
}

export function visualizationConfigurationHelp(spec: VisualizationSpecV1, table: TypedTable): PreviewMessage | null {
    const help = (description: string): PreviewMessage => ({tone: 'help', title: 'Los datos están listos. Podés editar la visualización', description});
    const chart = spec.chart;
    if (chart.type !== 'table' && !table.columns.some(column => column.type === 'integer' || column.type === 'decimal')) return help('Este gráfico necesita una columna numérica. Incluila en la vista de datos o elegí una visualización de tipo tabla.');
    if (chart.type === 'table') {
        if (!chart.columns.length || chart.columns.some(column => !column.field)) return help('Elegí las columnas que querés mostrar en la tabla.');
    } else {
        if (!chart.x.field) return help(chart.type === 'histogram' ? 'Elegí una columna numérica para armar los intervalos del histograma.' : 'Elegí una columna para el eje X.');
        if (chart.type === 'scatter' && !chart.y.field) return help('Elegí una columna numérica para el eje Y.');
        if ((chart.type === 'bar' || chart.type === 'line') && (!chart.series.length || chart.series.some(series => !series.field))) return help('Elegí al menos una columna numérica para las series del gráfico.');
    }
    const invalid = visualizationSpecValidationHelp(spec);
    if (invalid) return {tone: 'help', title: 'Hay un parámetro inválido en la visualización', description: invalid};
    return null;
}
