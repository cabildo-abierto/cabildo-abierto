import type {BasicDataView, ViewFilter, TableValue} from '@cabildo-abierto/api';
export function sqlIdentifier(value: string) { return '"' + value.replaceAll('"', '""') + '"'; }
export function sqlString(value: string) { return "'" + value.replaceAll("'", "''") + "'"; }
function literal(value: Exclude<TableValue, null>, type: ViewFilter['type']) {
    if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('El filtro necesita un número válido.'); return String(value); }
    if (typeof value === 'boolean') return value ? 'VERDADERO' : 'FALSO';
    return (type === 'date' ? 'FECHA ' : type === 'datetime' ? 'FECHA_HORA_ZONA ' : '') + sqlString(value);
}
export function lccaDatasetReference(topicId: string, blockNumber: string) {
    return `datos(${sqlString(topicId)}, ${sqlString(blockNumber)})`;
}
export function basicViewQuery(view: BasicDataView) {
    const source = lccaDatasetReference(view.source.topicId, view.source.blockNumber);
    const filters = view.filters.map(filter => {
        const field = sqlIdentifier(filter.field);
        if (filter.operator === 'isNull' || filter.operator === 'isNotNull') return `${field} ES ${filter.operator === 'isNotNull' ? 'NO ' : ''}NULO`;
        if (!filter.values.length) throw new Error('Completá los valores del filtro.');
        if (filter.operator === 'in' || filter.operator === 'notIn') return `${field} ${filter.operator === 'notIn' ? 'NO ' : ''}EN (${filter.values.map(v => literal(v, filter.type)).join(', ')})`;
        if (filter.operator === 'contains') return `contiene(${field}, ${sqlString(String(filter.values[0]))})`;
        const operators = {eq: '=', ne: '<>', lt: '<', lte: '<=', gt: '>', gte: '>='};
        return `${field} ${operators[filter.operator]} ${literal(filter.values[0], filter.type)}`;
    });
    return `SELECCIONAR ${view.columns.length ? view.columns.map(sqlIdentifier).join(', ') : '*'}\nDESDE ${source}`
        + (filters.length ? '\nDONDE ' + filters.map(filter => `(${filter})`).join(view.filterMode === 'or' ? ' O ' : ' Y ') : '')
        + (view.orderBy.length ? '\nORDENAR POR ' + view.orderBy.map(order => `${sqlIdentifier(order.field)} ${order.direction === 'asc' ? 'ASCENDENTE' : 'DESCENDENTE'} NULOS ULTIMO`).join(', ') : '');
}
