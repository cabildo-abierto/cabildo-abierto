import {datasetError} from '../datasets/errors.js';
import {DuckDBInstance} from '@duckdb/node-api';
import type {DatasetColumnType, LccaOutput, TableValue} from '@cabildo-abierto/api';
import {sqlIdentifier, sqlString} from '@cabildo-abierto/utils';
import {remoteDuckDB, registerDatasetTypes} from '../datasets/duckdb.js';
import {env} from '#/lib/env.js';
import {parseQuery, analyzeAST, basicViewFromAST} from './lcca-ast.js';
import type {QueryJob} from './query-process.js';
const types: Record<DatasetColumnType, string> = {text: 'VARCHAR', integer: 'BIGINT', decimal: 'DOUBLE', boolean: 'BOOLEAN', date: 'DATE', datetime: 'TIMESTAMPTZ'};
function outputType(type: string): DatasetColumnType {
    if (/^(TINYINT|SMALLINT|INTEGER|BIGINT|HUGEINT|UTINYINT|USMALLINT|UINTEGER|UBIGINT|UHUGEINT)$/.test(type)) return 'integer';
    if (/^(FLOAT|DOUBLE|DECIMAL)/.test(type)) return 'decimal';
    if (type === 'BOOLEAN') return 'boolean';
    if (type === 'DATE') return 'date';
    if (type.startsWith('TIMESTAMP')) return 'datetime';
    if (type === 'VARCHAR') return 'text';
    throw new Error(`El resultado contiene un tipo no admitido: ${type}. Convertí esa columna a texto u otro tipo compatible.`);
}
function outputValue(value: unknown, type: DatasetColumnType): TableValue {
    if (value === null) return null;
    if (type === 'integer' || type === 'decimal') {
        const number = Number(String(value));
        if (!Number.isFinite(number) || (type === 'integer' && !Number.isSafeInteger(number))) throw new Error('El resultado numérico supera la precisión admitida.');
        return number;
    }
    if (type === 'boolean') return Boolean(value);
    const text = String(value);
    if (type === 'datetime') {
        const date = new Date(/(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(text) ? text : text.replace(' ', 'T') + 'Z');
        if (!Number.isFinite(date.getTime())) throw new Error('La consulta devolvió una fecha fuera del rango admitido.');
        return date.toISOString();
    }
    return text;
}
process.once('message', async (job: QueryJob) => {
    let instance: DuckDBInstance | undefined;
    try {
        const remote = job.type === 'execute' ? await remoteDuckDB(job.tables!.map(t=>t.url)) : null;
        instance = remote?.instance ?? await DuckDBInstance.create(':memory:', {enable_external_access:'false',autoinstall_known_extensions:'false',autoload_known_extensions:'false',memory_limit:'256MB',threads:'1',max_temp_directory_size:'0B'});
        const connection = remote?.connection ?? await instance.connect();
        try {
            const ast = await parseQuery(connection, job.query);
            const sources = analyzeAST(ast);
            if (job.type === 'analyze') {
                process.send?.({success: true, value: {sources, basicView: await basicViewFromAST(connection, ast)}});
            } else {
                const sourceTable = (source: typeof sources[number]) => job.tables!.find(table => table.topicId === (job.resolvedTopicIds?.[source.topicId] ?? source.topicId) && table.blockNumber === source.blockNumber);
                const select = ast.statements[0].node;
                if (sources.length === 1 && select.from_table?.type === 'TABLE_FUNCTION' && !select.where_clause
                    && !select.group_expressions?.length && !select.having && !select.qualify && !select.cte_map?.map?.length
                    && select.select_list.every((item:any)=>['STAR','COLUMN_REF'].includes(item.class))
                    && select.modifiers.every((item:any)=>['ORDER_MODIFIER','LIMIT_MODIFIER'].includes(item.type))) {
                    const table = sourceTable(sources[0])!;
                    const limit = select.modifiers.find((item:any)=>item.type==='LIMIT_MODIFIER');
                    const literal = (value:any,fallback:number)=>value?.class==='CONSTANT' && Number.isSafeInteger(Number(value.value?.value)) ? Number(value.value.value) : fallback;
                    const count = Math.min(Math.max(0,table.rowCount-literal(limit?.offset,0)),literal(limit?.limit,table.rowCount));
                    const width = select.select_list.reduce((total:number,item:any)=>total+(item.class==='STAR'?table.columns.length:1),0);
                    if (count > env.DATASET_RESULT_MAX_ROWS || count*width > env.DATASET_RESULT_MAX_CELLS) throw new Error('El resultado esperado supera el límite de filas o celdas. Agregá un filtro o LIMIT, o pedí menos columnas.');
                }
                registerDatasetTypes(connection);
                // Conservative source budget: references in filters, joins and nested queries count too.
                const referenced = new Set<string>(); let star = false;
                const inspect = (node: any) => {
                    if (!node || typeof node !== 'object') return;
                    if (node.class === 'STAR') star = true;
                    if (node.class === 'COLUMN_REF') referenced.add(String(node.column_names.at(-1)).toLowerCase());
                    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(inspect); else if (value && typeof value === 'object') inspect(value);
                };
                inspect(ast);
                let inputCells = 0, inputBytes = 0;
                for (const [index, source] of sources.entries()) {
                    const table = sourceTable(source);
                    if (!table) throw new Error('Falta una fuente de datos.');
                    if (new Set(table.columns.map(c=>c.name.toLowerCase())).size !== table.columns.length) throw new Error('Los encabezados deben distinguirse también sin mayúsculas.');
                    const indices = new Map(table.sourceColumns.map((c,i)=>[c.name,i]));
                    const used = table.columns.filter(c=>star || referenced.has(c.name.toLowerCase()));
                    inputCells += table.rowCount * used.length;
                    inputBytes += used.reduce((total,c)=>total+(table.columnBytes[indices.get(c.name)??-1]??0),0);
                    const fields = table.columns.map(column=>{
                        const physical = indices.get(column.name);
                        if (physical === undefined) return `CASE WHEN __row >= 0 THEN error('La columna ya no está en el CSV.') END AS ${sqlIdentifier(column.name)}`;
                        return `CAST(ca_${column.type}_${table.csvOptions.decimal === '.' ? 'dot' : 'comma'}(c${physical}) AS ${types[column.type]}) AS ${sqlIdentifier(column.name)}`;
                    });
                    await connection.run(`CREATE VIEW lcca_source_${index} AS SELECT ${fields.join(', ')} FROM read_parquet(${sqlString(table.url)})`);
                }
                if (inputCells > env.DATASET_QUERY_MAX_CELLS || inputBytes > env.DATASET_QUERY_MAX_MB*1024*1024) throw new Error('La lectura estimada supera el límite por consulta. Pedí menos columnas o usá una fuente más pequeña.');
                analyzeAST(ast, true);
                const sqlResult = await connection.runAndReadAll(`SELECT json_deserialize_sql(${sqlString(JSON.stringify(ast))})`);
                const query = String(sqlResult.getRows()[0][0]);
                const result = await connection.stream(query);
                const columns = result.columnNames().map((name, i) => ({name, type: outputType(result.columnType(i).toString())}));
                if (!columns.length || columns.length > 200 || new Set(columns.map(c => c.name)).size !== columns.length) throw new Error('El resultado debe tener entre 1 y 200 columnas con nombres únicos. Usá alias para desambiguarlas.');
                const rows: TableValue[][] = [];
                let bytes = Buffer.byteLength(JSON.stringify(columns));
                for await (const chunk of result) for (const raw of chunk.getRows()) {
                    if (rows.length >= env.DATASET_RESULT_MAX_ROWS || (rows.length+1)*columns.length > env.DATASET_RESULT_MAX_CELLS) throw new Error('El resultado supera el límite de filas o celdas. Filtrá, agrupá o pedí menos columnas.');
                    const row = raw.map((value,i)=>outputValue(value,columns[i].type));
                    bytes += Buffer.byteLength(JSON.stringify(row))+1;
                    if (bytes > env.DATASET_RESULT_MAX_MB*1024*1024) throw new Error('El resultado supera el tamaño permitido. Filtrá, agrupá o pedí menos columnas.');
                    rows.push(row);
                }
                const resolvedSources = new Map(sources.map(source => {
                    const table = sourceTable(source)!;
                    return [JSON.stringify([table.topicId,table.blockNumber]),{topicId: table.topicId,blockNumber: table.blockNumber,versionId: table.versionId,snapshotId:table.snapshotId}] as const;
                }));
                const value: LccaOutput = {columns, rows, sources: [...resolvedSources.values()]};
                if (Buffer.byteLength(JSON.stringify(value)) > env.DATASET_RESULT_MAX_MB * 1024 * 1024) throw new Error('El resultado supera los 10 MiB permitidos.');
                process.send?.({success: true, value, metrics:{inputCells,inputBytes,resultRows:rows.length,resultColumns:columns.length,resultBytes:bytes}});
            }
        } finally { connection.closeSync(); }
    } catch (error) { process.send?.({success: false, error: datasetError(error)}); }
    finally { instance?.closeSync(); process.disconnect?.(); }
});
