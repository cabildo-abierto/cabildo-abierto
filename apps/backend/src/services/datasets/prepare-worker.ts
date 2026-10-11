import {inspectJSON, readDatasetJSON} from './json.js';
import type {DatasetColumn} from '@cabildo-abierto/api';
import {datasetError} from './errors.js';
import {DuckDBInstance} from '@duckdb/node-api';
import {sqlString} from '@cabildo-abierto/utils';
import {extractCSVIfZip} from './zip-csv.js';
import {normalizeCSV} from './normalize-csv.js';
import {env} from '#/lib/env.js';
import {rm, stat} from 'node:fs/promises';

type PrepareJob = {path:string;output:string;directory:string;format?:'csv'|'json';filter?:string|null;previousColumns?:DatasetColumn[];validateOnly?:boolean};

async function prepare({path,output,directory,format = 'csv',filter = null,previousColumns,validateOnly}: PrepareJob) {
    let instance: DuckDBInstance | undefined;
    const extractedPath = `${output}.extracted.csv`;
    const normalizedPath = `${output}.normalized.csv`;
    try {
        if (validateOnly) { await readDatasetJSON(path); return null; }
        const json = format === 'json' ? await inspectJSON(path,directory,filter,previousColumns) : null;
        const csvPath = json ? path : await extractCSVIfZip(path, extractedPath);
        const csv = json ? null : await normalizeCSV(csvPath, normalizedPath);
        const metadata = json?.metadata ?? csv!.metadata;
        instance = await DuckDBInstance.create(':memory:', {memory_limit:`${json ? env.DATASET_PREPARE_MEMORY_MB : env.DATASET_CSV_PREPARE_MEMORY_MB}MB`,threads:'1',temp_directory:directory,max_temp_directory_size:`${env.DATASET_PREPARE_TEMP_MB}MB`,autoinstall_known_extensions:'false',autoload_known_extensions:'false'});
        const connection = await instance.connect();
        try {
            let selection: string;
            if (json || !metadata.rowCount) {
                await connection.run(`CREATE TABLE data (__row BIGINT, ${metadata.columns.map((_,i)=>`c${i} VARCHAR`).join(',')})`);
                if (json) {
                    const appender = await connection.createAppender('data');
                    try {
                        let ordinal=0;
                        for await (const row of json.rows()) {
                            appender.appendBigInt(BigInt(ordinal++));
                            for (const value of row) appender.appendVarchar(value);
                            appender.endRow();
                            if (ordinal % 2048 === 0) appender.flushSync();
                        }
                    } finally { appender.closeSync(); }
                }
                selection = 'SELECT * FROM data ORDER BY __row';
            } else {
                const names = ['__row', ...metadata.columns.map((_,i) => `c${i}`)];
                const columns = names.map((name,i) => `${sqlString(name)}: ${sqlString(i ? 'VARCHAR' : 'BIGINT')}`).join(',');
                await connection.run('SET preserve_insertion_order = false');
                // Logical order comes from __row when pages are read. Explicit types
                // and force_not_null preserve raw cell text, including empty strings.
                selection = `SELECT * FROM read_csv(${sqlString(normalizedPath)}, header=false, auto_detect=false, delim=',', quote='"', escape='"', new_line='\\n', columns={${columns}}, force_not_null=[${names.map(sqlString).join(',')}], max_line_size=${Math.max(2 * 1024 * 1024, csv!.maxLineBytes)})`;
            }
            await connection.run(`COPY (${selection}) TO ${sqlString(output)} (FORMAT PARQUET, COMPRESSION ZSTD, ROW_GROUP_SIZE 2048)`);
            const sizes = (await connection.runAndReadAll(`SELECT path_in_schema, sum(total_compressed_size)::BIGINT FROM parquet_metadata(${sqlString(output)}) GROUP BY path_in_schema`)).getRows();
            const columnBytes = metadata.columns.map((_,i)=>Number(sizes.find(row=>row[0]===`c${i}`)?.[1] ?? 0));
            return {...metadata,columnBytes,inputBytes:Math.max((await stat(path)).size, (await stat(csvPath)).size)};
        } finally { connection.closeSync(); }
    } finally {
        try { instance?.closeSync(); }
        finally { if (format === 'csv' && !validateOnly) await Promise.all([normalizedPath, extractedPath].map(file => rm(file, {force: true}))); }
    }
}

process.once('message', async (job: PrepareJob) => {
    try { process.send?.({success:true,value:await prepare(job)}); }
    catch (error) { process.send?.({success:false,error:datasetError(error)}); }
    finally { process.disconnect?.(); }
});
