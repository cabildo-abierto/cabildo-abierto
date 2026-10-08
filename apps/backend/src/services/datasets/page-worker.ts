import {serveWorker} from '../workers/serve-worker.js';
import {datasetError} from './errors.js';
import {sqlString} from '@cabildo-abierto/utils';
import {remoteDuckDB} from './duckdb.js';
serveWorker(async ({url,page,width}: {url:string;page:number;width:number})=>{
    let db: Awaited<ReturnType<typeof remoteDuckDB>> | undefined;
    try {
        db=await remoteDuckDB([url]);
        const result=await db.connection.stream(`SELECT ${Array.from({length:width},(_,i)=>`c${i}`).join(',')} FROM read_parquet(${sqlString(url)}) WHERE __row >= ${page*100} AND __row < ${(page+1)*100} ORDER BY __row`);
        const rows:string[][]=[];let bytes=0;
        for await (const chunk of result) for(const row of chunk.getRows()) {
            const values=row.map(String);bytes+=Buffer.byteLength(JSON.stringify(values));
            if(bytes>10*1024*1024)throw new Error('La página supera los 10 MiB permitidos.');
            rows.push(values);
        }
        return {success:true,value:rows};
    } catch(error){return {success:false,error:datasetError(error)};}
    finally {db?.connection.closeSync();db?.instance.closeSync();}
});
