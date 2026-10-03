import {DuckDBInstance} from '@duckdb/node-api';
const instance=await DuckDBInstance.create(':memory:');
const connection=await instance.connect();
try { await connection.run("INSTALL httpfs FROM 'https://extensions.duckdb.org'; LOAD httpfs"); console.log('httpfs instalado para la versión de DuckDB del backend.'); }
finally { connection.closeSync(); instance.closeSync(); }
