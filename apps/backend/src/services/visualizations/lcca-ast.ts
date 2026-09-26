import type {DuckDBConnection} from '@duckdb/node-api';
import type {BasicDataView, DatasetReference, ViewFilter, ViewFilterOperator} from '@cabildo-abierto/api';
import {basicViewQuery, normalizeLcca} from '@cabildo-abierto/utils';
// DuckDB's serialized AST is internal to this version of the query adapter.
type Node = Record<string, any>;
const functions = new Set(['+', '-', '*', '/', '//', '%', '**', 'abs', 'round', 'floor', 'ceil', 'ceiling', 'sqrt', 'pow', 'power', 'ln', 'log', 'exp', 'sum', 'avg', 'mean', 'min', 'max', 'count', 'count_star', 'median', 'stddev', 'stddev_pop', 'stddev_samp', 'variance', 'var_pop', 'var_samp', 'contains', 'lower', 'upper', 'trim', 'ltrim', 'rtrim', 'length', 'substring', 'substr', 'concat', 'concat_ws', 'replace', 'starts_with', 'ends_with', 'like_escape', 'not_like_escape', '~~', '!~~', '~~*', '!~~*', 'date_trunc', 'date_part', 'extract', 'year', 'month', 'day', 'strftime', 'strptime', 'try_strptime', 'coalesce', 'nullif', 'greatest', 'least']);
const classes = new Set(['COLUMN_REF', 'CONSTANT', 'FUNCTION', 'COMPARISON', 'CONJUNCTION', 'OPERATOR', 'CAST', 'CASE', 'STAR', 'SUBQUERY', 'BETWEEN']);
const refs = new Set(['EMPTY', 'BASE_TABLE', 'TABLE_FUNCTION', 'JOIN', 'SUBQUERY']);
export async function parseQuery(connection: DuckDBConnection, query: string): Promise<Node> {
    if (!query.trim() || query.length > 20000) throw new Error('La consulta debe tener entre 1 y 20.000 caracteres.');
    const normalized = normalizeLcca(query);
    const result = await connection.runAndReadAll('SELECT json_serialize_sql($1::VARCHAR)', [normalized.sql]);
    const ast = JSON.parse(String(result.getRows()[0][0]), (key, value) => key === 'query_location' ? undefined : value);
    if (ast.error) {
        const position = Number(ast.position);
        if (ast.position !== undefined && Number.isFinite(position) && position >= 0) {
            const source = normalized.sourceAt(position);
            const message = String(ast.error_message).replaceAll('"'+source.translatedToken+'"', '"'+source.token+'"');
            throw new Error(`Consulta inválida en línea ${source.line}, columna ${source.column}: ${message}`);
        }
        throw new Error(`Consulta inválida: ${ast.error_message}`);
    }
    if (ast.statements?.length !== 1) throw new Error('Usá una sola consulta SELECCIONAR / SELECT.');
    return ast;
}
export function analyzeAST(ast: Node, rewrite = false) {
    const sources = new Map<string, DatasetReference>();
    const ctes = new Set<string>();
    function gather(node: Node) {
        for (const entry of node.cte_map?.map ?? []) ctes.add(String(entry.key).toLowerCase());
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(item => { if (item && typeof item === 'object') gather(item); });
            else if (value && typeof value === 'object') gather(value);
        }
    }
    gather(ast);
    function visit(node: Node, depth = 0) {
        if (depth > 100) throw new Error('La consulta tiene demasiados niveles.');
        if (node.class === 'CONSTANT' && node.value?.type?.id === 'DECIMAL' && (node.value.type.type_info?.width > 15 || (typeof node.value.value === 'number' && !Number.isSafeInteger(node.value.value)))) throw new Error('El literal decimal supera la precisión admitida.');
        if (node.class === 'CONSTANT' && /INT$/.test(node.value?.type?.id ?? '') && typeof node.value?.value === 'number' && !Number.isSafeInteger(node.value.value)) throw new Error('La consulta contiene un entero fuera de la precisión admitida.');
        if (node.type === 'RECURSIVE_CTE_NODE') throw new Error('LCCA todavía no admite consultas recursivas.');
        if (node.class && !classes.has(node.class)) throw new Error(`Expresión no admitida: ${node.class}.`);
        if (node.named_param_map?.length || node.sample || node.export_state) throw new Error('La consulta usa una opción no admitida.');
        if (node.type === 'TABLE_FUNCTION') {
            const fn = node.function;
            const args = fn?.children;
            if (fn?.function_name?.toLowerCase() !== 'dataset' || fn.schema || fn.catalog || args?.length !== 2
                || args.some((arg: Node) => arg.class !== 'CONSTANT' || arg.value?.type?.id !== 'VARCHAR' || arg.value?.is_null)
                || node.column_name_alias?.length || node.with_ordinality !== 'WITHOUT_ORDINALITY') throw new Error("Las fuentes deben usar datos('tema', 'ds-1') o dataset('tema', 'ds-1').");
            const source = {topicId: args[0].value.value as string, blockNumber: args[1].value.value as string};
            if (!source.topicId || source.topicId.length > 1000 || !/^ds-[1-9]\d*$/.test(source.blockNumber)) throw new Error('La referencia al conjunto de datos no es válida.');
            const key = JSON.stringify(source);
            if (!sources.has(key)) sources.set(key, source);
            if (sources.size > 8) throw new Error('Una consulta puede usar como máximo 8 conjuntos de datos.');
            if (rewrite) {
                const index = [...sources.keys()].indexOf(key);
                const alias = node.alias;
                for (const key of Object.keys(node)) delete node[key];
                Object.assign(node, {type: 'BASE_TABLE', alias, table_name: `lcca_source_${index}`, schema_name: '', catalog_name: '', column_name_alias: []});
            }
            return;
        }
        if (node.class === 'FUNCTION' && (node.schema || node.catalog || !functions.has(String(node.function_name).toLowerCase()))) throw new Error(`Función no admitida: ${node.function_name}.`);
        if (node.type === 'BASE_TABLE' && (node.schema_name || node.catalog_name || node.at_clause || !ctes.has(String(node.table_name).toLowerCase()))) throw new Error('Referenciá conjuntos de datos mediante datos(...), o vistas definidas en WITH.');
        if (node.from_table && !refs.has(node.from_table.type)) throw new Error('La fuente no está admitida.');
        if (node.left?.type && node.type === 'JOIN' && (!refs.has(node.left.type) || !refs.has(node.right?.type))) throw new Error('El join usa una fuente no admitida.');
        if (node.class === 'STAR' && (node.columns || node.expr || node.replace_list?.length || node.rename_list?.length || node.exclude_list?.length || node.qualified_exclude_list?.length)) throw new Error('Usá * o nombres de columnas explícitos.');
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(item => { if (item && typeof item === 'object') visit(item, depth + 1); });
            else if (value && typeof value === 'object') visit(value, depth + 1);
        }
    }
    visit(ast);
    if (!sources.size) throw new Error('La consulta debe referenciar al menos un conjunto de datos.');
    return [...sources.values()];
}
function column(node: Node): string {
    if (node?.class !== 'COLUMN_REF' || node.alias || node.column_names?.length !== 1) throw new Error();
    return node.column_names[0];
}
function constant(node: Node): {value: string | number | boolean; type: ViewFilter['type']} {
    if (node?.class === 'CAST' && ['DATE', 'TIMESTAMP WITH TIME ZONE', 'TIMESTAMP_TZ'].includes(node.cast_type?.id) && !node.try_cast) {
        const result = constant(node.child);
        return {value: result.value, type: node.cast_type.id === 'DATE' ? 'date' : 'datetime'};
    }
    if (node?.class !== 'CONSTANT' || node.value?.is_null) throw new Error();
    const decimal = node.value.type?.id === 'DECIMAL';
    const value = decimal ? node.value.value / 10 ** node.value.type.type_info.scale : node.value.value;
    if (!['string', 'number', 'boolean'].includes(typeof value)) throw new Error();
    return {value, type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? !decimal && Number.isInteger(value) ? 'integer' : 'decimal' : 'text'};
}
function filter(node: Node): ViewFilter {
    const comparisons: Record<string, ViewFilterOperator> = {COMPARE_EQUAL: 'eq', COMPARE_NOTEQUAL: 'ne', COMPARE_LESSTHAN: 'lt', COMPARE_LESSTHANOREQUALTO: 'lte', COMPARE_GREATERTHAN: 'gt', COMPARE_GREATERTHANOREQUALTO: 'gte'};
    if (node.class === 'COMPARISON' && comparisons[node.type]) {
        const value = constant(node.right);
        return {field: column(node.left), operator: comparisons[node.type], type: value.type, values: [value.value]};
    }
    const operator: ViewFilterOperator | undefined = node.type === 'OPERATOR_IS_NULL' ? 'isNull' : node.type === 'OPERATOR_IS_NOT_NULL' ? 'isNotNull' : node.type === 'COMPARE_IN' ? 'in' : node.type === 'COMPARE_NOT_IN' ? 'notIn' : node.class === 'FUNCTION' && node.function_name === 'contains' ? 'contains' : undefined;
    if (!operator) throw new Error();
    const values = (node.children as Node[]).slice(1).map(constant);
    return {field: column(node.children[0]), operator, type: values[0]?.type ?? 'text', values: values.map(v => v.value)};
}
function canonical(node: any): any {
    if (Array.isArray(node)) return node.map(canonical);
    if (!node || typeof node !== 'object') return node;
    return Object.fromEntries(Object.entries(node).filter(([key]) => key !== 'query_location').map(([key, value]) => [key, key === 'null_order' && value === 'ORDER_DEFAULT' ? 'NULLS_LAST' : canonical(value)]));
}
export async function basicViewFromAST(connection: DuckDBConnection, ast: Node): Promise<BasicDataView | null> {
    try {
        const node = ast.statements[0].node;
        const source = node.from_table;
        if (node.type !== 'SELECT_NODE' || source.type !== 'TABLE_FUNCTION' || source.alias || node.group_expressions.length || node.having || node.qualify || node.cte_map.map.length) return null;
        const where = node.where_clause;
        const filters = where ? (where.class === 'CONJUNCTION' ? where.children : [where]).map(filter) : [];
        const selected = node.select_list;
        const view: BasicDataView = {
            source: {topicId: source.function.children[0].value.value, blockNumber: source.function.children[1].value.value},
            columns: selected.length === 1 && selected[0].class === 'STAR' ? [] : selected.map(column),
            filters, filterMode: where?.type === 'CONJUNCTION_OR' ? 'or' : 'and',
            orderBy: node.modifiers.flatMap((modifier: Node) => {
                if (modifier.type !== 'ORDER_MODIFIER') throw new Error();
                return modifier.orders.map((order: Node) => ({field: column(order.expression), direction: order.type === 'DESCENDING' ? 'desc' : 'asc'}));
            }),
        };
        const generated = await parseQuery(connection, basicViewQuery(view));
        return JSON.stringify(canonical(generated)) === JSON.stringify(canonical(ast)) ? view : null;
    } catch { return null; }
}
