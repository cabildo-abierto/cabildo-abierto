import {inspectJSON, readDatasetJSON} from './json.js';
import type {DatasetColumn} from '@cabildo-abierto/api';
import {datasetError} from './errors.js';
import {DuckDBInstance} from '@duckdb/node-api';
import {sqlString} from '@cabildo-abierto/utils';
import {inspectCSV, csvRows} from './stream-csv.js';
import {env} from '#/lib/env.js';

process.once('message', async ({path,output,directory,format = 'csv',filter = null,previousColumns,validateOnly}: {path:string;output:string;directory:string;format?:'csv'|'json';filter?:string|null;previousColumns?:DatasetColumn[];validateOnly?:boolean}) => {
    let instance: DuckDBInstance | undefined;
    try {
        if (validateOnly) { await readDatasetJSON(path); process.send?.({success:true,value:null}); return; }
        const json = format === 'json' ? await inspectJSON(path,directory,filter,previousColumns) : null;
        const metadata = json?.metadata ?? await inspectCSV(path);
        const rows = json ? json.rows() : csvRows(path,metadata.csvOptions.delimiter,metadata.encoding);
        instance = await DuckDBInstance.create(':memory:', {memory_limit:`${env.DATASET_PREPARE_MEMORY_MB}MB`,threads:'1',temp_directory:directory,max_temp_directory_size:`${env.DATASET_PREPARE_TEMP_MB}MB`,autoinstall_known_extensions:'false',autoload_known_extensions:'false'});
        const connection = await instance.connect();
        try {
            await connection.run(`CREATE TABLE data (__row BIGINT, ${metadata.columns.map((_,i)=>`c${i} VARCHAR`).join(',')})`);
            const appender = await connection.createAppender('data');
            try {
                let ordinal=0;
                for await (const row of rows) {
                    appender.appendBigInt(BigInt(ordinal++));
                    for (const value of row) appender.appendVarchar(value);
                    appender.endRow();
                    if (ordinal % 2048 === 0) appender.flushSync();
                }
            } finally { appender.closeSync(); }
            await connection.run(`COPY (SELECT * FROM data ORDER BY __row) TO ${sqlString(output)} (FORMAT PARQUET, COMPRESSION ZSTD, ROW_GROUP_SIZE 2048)`);
            const sizes = (await connection.runAndReadAll(`SELECT path_in_schema, sum(total_compressed_size)::BIGINT FROM parquet_metadata(${sqlString(output)}) GROUP BY path_in_schema`)).getRows();
            const columnBytes = metadata.columns.map((_,i)=>Number(sizes.find(row=>row[0]===`c${i}`)?.[1] ?? 0));
            process.send?.({success:true,value:{...metadata,columnBytes}});
        } finally { connection.closeSync(); }
    } catch (error) { process.send?.({success:false,error:datasetError(error)}); }
    finally { instance?.closeSync(); process.disconnect?.(); }
});
