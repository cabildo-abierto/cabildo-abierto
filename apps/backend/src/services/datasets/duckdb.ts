import {DuckDBInstance, DuckDBScalarFunction, VARCHAR, type DuckDBConnection} from '@duckdb/node-api';
import {datasetCell, DATASET_TYPES, sqlString} from '@cabildo-abierto/utils';

export async function remoteDuckDB(paths: string[]) {
    const instance = await DuckDBInstance.create(':memory:', {autoinstall_known_extensions:'false', autoload_known_extensions:'false', memory_limit:'256MB', threads:'1', max_temp_directory_size:'0B'});
    try {
        const connection = await instance.connect();
        await connection.run('LOAD httpfs; SET allow_persistent_secrets = false');
        // Parquet prefetch requests column chunks. Disabling it activates 1 MiB read-ahead
        // in httpfs, which downloads unrelated columns (verified with a range server).
        await connection.run("SET prefetch_all_parquet_files = false; SET disable_parquet_prefetching = false; SET enable_external_file_cache = false");
        await connection.run(`SET allowed_paths = [${paths.map(sqlString).join(',')}]; SET enable_external_access = false; SET lock_configuration = true`);
        return {instance,connection};
    } catch (error) { instance.closeSync(); throw error; }
}
export function registerDatasetTypes(connection: DuckDBConnection) {
    for (const type of DATASET_TYPES) for (const decimal of ['.',','] as const) {
        const fn = DuckDBScalarFunction.create({name:`ca_${type}_${decimal === '.' ? 'dot' : 'comma'}`, returnType:VARCHAR, parameterTypes:[VARCHAR],
            mainFunction(info,input,output) {
                const values = input.getColumnVector(0);
                for (let i=0;i<input.rowCount;i++) {
                    const cell = datasetCell(String(values.getItem(i) ?? ''),type,{delimiter:',',decimal});
                    if (cell.error) { info.setError(cell.error); return; }
                    output.setItem(i,cell.value === null ? null : String(cell.value));
                }
                output.flush();
            }});
        connection.registerScalarFunction(fn); fn.destroySync();
    }
}
