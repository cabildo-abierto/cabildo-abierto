import {DuckDBInstance} from '@duckdb/node-api';
import type {DatasetColumnType, LccaOutput, TableValue} from '@cabildo-abierto/api';
import {sqlIdentifier, sqlString} from '@cabildo-abierto/utils';
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
        instance = await DuckDBInstance.create(':memory:', {enable_external_access: 'false', autoinstall_known_extensions: 'false', autoload_known_extensions: 'false', memory_limit: '256MB', threads: '1', max_temp_directory_size: '0B'});
        const connection = await instance.connect();
        try {
            const ast = await parseQuery(connection, job.query);
            const sources = analyzeAST(ast);
            if (job.type === 'analyze') {
                process.send?.({success: true, value: {sources, basicView: await basicViewFromAST(connection, ast)}});
            } else {
                const sourceTable = (source: typeof sources[number]) => job.tables!.find(table => table.topicId === (job.resolvedTopicIds?.[source.topicId] ?? source.topicId) && table.blockNumber === source.blockNumber);
                for (const [index, source] of sources.entries()) {
                    const table = sourceTable(source);
                    if (!table) throw new Error('Falta una fuente de datos.');
                    if (new Set(table.columns.map(column => column.name.toLowerCase())).size !== table.columns.length) throw new Error("Los encabezados del conjunto de datos deben distinguirse también sin mayúsculas para usarlos en consultas.");
                    const definitions = table.columns.flatMap((_, i) => [`v${i} VARCHAR`, `e${i} VARCHAR`]);
                    await connection.run(`CREATE TABLE raw_${index} (${definitions.join(', ')})`);
                    const appender = await connection.createAppender(`raw_${index}`);
                    try {
                        for (const row of table.rows) {
                            for (const cell of row) {
                                if (cell.value === null) appender.appendNull(); else appender.appendVarchar(String(cell.value));
                                if (cell.error === null) appender.appendNull(); else appender.appendVarchar(cell.error);
                            }
                            appender.endRow();
                        }
                    } finally { appender.closeSync(); }
                    const fields = table.columns.map((column, i) => `CASE WHEN e${i} IS NOT NULL THEN error(e${i}) ELSE CAST(v${i} AS ${types[column.type]}) END AS ${sqlIdentifier(column.name)}`);
                    await connection.run(`CREATE VIEW lcca_source_${index} AS SELECT ${fields.join(', ')} FROM raw_${index}`);
                }
                analyzeAST(ast, true);
                const sqlResult = await connection.runAndReadAll(`SELECT json_deserialize_sql(${sqlString(JSON.stringify(ast))})`);
                const query = String(sqlResult.getRows()[0][0]);
                const result = await connection.streamAndRead(query);
                const columns = result.columnNames().map((name, i) => ({name, type: outputType(result.columnType(i).toString())}));
                if (!columns.length || columns.length > 200 || new Set(columns.map(c => c.name)).size !== columns.length) throw new Error('El resultado debe tener entre 1 y 200 columnas con nombres únicos. Usá alias para desambiguarlas.');
                await result.readUntil(Math.floor(200000 / columns.length) + 1);
                const raw = result.getRows();
                if (raw.length * columns.length > 200000) throw new Error('La consulta supera las 200.000 celdas permitidas. Reducí el resultado.');
                const rows = raw.map(row => row.map((value, i) => outputValue(value, columns[i].type)));
                const resolvedSources = new Map(sources.map(source => {
                    const table = sourceTable(source)!;
                    return [JSON.stringify([table.topicId,table.blockNumber]),{topicId: table.topicId,blockNumber: table.blockNumber,versionId: table.versionId}] as const;
                }));
                const value: LccaOutput = {columns, rows, sources: [...resolvedSources.values()]};
                if (Buffer.byteLength(JSON.stringify(value)) > 10 * 1024 * 1024) throw new Error('El resultado supera los 10 MiB permitidos.');
                process.send?.({success: true, value});
            }
        } finally { connection.closeSync(); }
    } catch (error) { process.send?.({success: false, error: error instanceof Error ? error.message : 'No pudimos ejecutar la consulta.'}); }
    finally { instance?.closeSync(); process.disconnect?.(); }
});
