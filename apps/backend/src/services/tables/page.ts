import type {CSVOptions, DatasetColumn, TablePageInput} from '@cabildo-abierto/api';
import type {DuckDBConnection} from '@duckdb/node-api';
import {sqlString} from '@cabildo-abierto/utils';
import {registerDatasetTypes} from '../datasets/duckdb.js';

export type TablePageJob = Omit<TablePageInput, 'columns'> & {kind: 'table'; url: string; indices: number[]; columns: DatasetColumn[]; csvOptions: CSVOptions; totalRows: number};

export async function queryTablePage(connection: DuckDBConnection, job: TablePageJob) {
    const fields = job.indices.map(index => `c${index}`);
    const source = `read_parquet(${sqlString(job.url)})`;
    const where = job.search ? `WHERE ${fields.map(field => `contains(lower(${field}), lower(${sqlString(job.search)}))`).join(' OR ')}` : '';
    const rowCount = job.search ? Number((await connection.runAndReadAll(`SELECT count(*) FROM ${source} ${where}`)).getRows()[0][0]) : job.totalRows;
    const page = Math.min(job.page, Math.max(0, Math.ceil(rowCount / job.pageSize) - 1));
    let order = '__row';
    if (job.order) {
        registerDatasetTypes(connection, true);
        const index = job.columns.findIndex(column => column.name === job.order!.field);
        const type = job.columns[index].type;
        const types = {text: 'VARCHAR', integer: 'BIGINT', decimal: 'DOUBLE', boolean: 'BOOLEAN', date: 'DATE', datetime: 'TIMESTAMPTZ'};
        order = `TRY_CAST(ca_${type}_${job.csvOptions.decimal === '.' ? 'dot' : 'comma'}(${fields[index]}) AS ${types[type]}) ${job.order.direction} NULLS LAST, __row`;
    }
    const query = !job.search && !job.order
        ? `SELECT ${fields.join(',')} FROM ${source} WHERE __row >= ${page * job.pageSize} AND __row < ${(page + 1) * job.pageSize} ORDER BY __row`
        : `WITH selected AS (SELECT __row, row_number() OVER (ORDER BY ${order}) AS position FROM ${source} ${where} ORDER BY ${order} LIMIT ${job.pageSize} OFFSET ${page * job.pageSize}) SELECT ${fields.map(field => `data.${field}`).join(',')} FROM ${source} data JOIN selected USING (__row) ORDER BY selected.position`;
    const result = await connection.stream(query);
    const rows: string[][] = [];
    let bytes = 0;
    for await (const chunk of result) for (const row of chunk.getRows()) {
        const values = row.map(value => String(value ?? ''));
        bytes += Buffer.byteLength(JSON.stringify(values));
        if (bytes > 10 * 1024 * 1024) throw new Error('La página supera los 10 MiB permitidos.');
        rows.push(values);
    }
    return {rows, rowCount, page};
}
