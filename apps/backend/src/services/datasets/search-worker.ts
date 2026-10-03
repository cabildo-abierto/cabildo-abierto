import {sqlString} from '@cabildo-abierto/utils';
import {remoteDuckDB} from './duckdb.js';
import {datasetError} from './errors.js';
import {segmentSearchCSV} from '../search/segments.js';
import type {SearchSegment} from '../search/types.js';
process.once('message',async ({url,columns}:{url:string;columns:string[]})=>{
    let db:Awaited<ReturnType<typeof remoteDuckDB>>|undefined;
    try{
        db=await remoteDuckDB([url]);
        const result=await db.connection.stream(`SELECT ${columns.map((_,i)=>`c${i}`).join(',')} FROM read_parquet(${sqlString(url)}) ORDER BY __row`);
        const segments:SearchSegment[]=[];let offset=0;
        for await(const chunk of result){
            const rows=chunk.getRows().map(row=>row.map(String));
            segments.push(...segmentSearchCSV(columns,rows).map(segment=>({...segment,location:{...segment.location,rowStart:segment.location.rowStart+offset,rowEnd:segment.location.rowEnd+offset}})));
            offset+=rows.length;
        }
        if(!offset)segments.push(...segmentSearchCSV(columns,[]));
        process.send?.({success:true,value:segments});
    }catch(error){process.send?.({success:false,error:datasetError(error)});}
    finally{db?.connection.closeSync();db?.instance.closeSync();process.disconnect?.();}
});
