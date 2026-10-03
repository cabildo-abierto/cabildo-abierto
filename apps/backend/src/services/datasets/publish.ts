import {randomUUID} from 'node:crypto';
import {stat} from 'node:fs/promises';
import {sql,type Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import {env} from '#/lib/env.js';
import type {ObjectStorage} from '../storage/storage.js';
import {lockSearchMutation} from '../search/schema.js';
import {notifySearchPending} from '../search/notifications.js';
import type {PreparedCSV} from './snapshots.js';

export async function publishSnapshot(database:Kysely<DB>,storage:ObjectStorage,sourceId:string,path:string,metadata:PreparedCSV,hash:string,validators:{etag:string|null;lastModified:string|null},token?:string){
    const id=randomUUID(),object={bucket:env.CLOUDFLARE_BUCKET,key:`datasets/${sourceId}/${id}.parquet`};
    const size=(await stat(path)).size;
    await storage.put(object,path,'application/vnd.apache.parquet',size,AbortSignal.timeout(30000));
    try{
        await database.transaction().execute(async trx=>{
            await lockSearchMutation(trx);
            const source=await trx.selectFrom('dataset_source').selectAll().where('id','=',sourceId).forUpdate().executeTakeFirstOrThrow();
            if(token && source.lease_token!==token)throw new Error('La preparación fue reemplazada.');
            await trx.insertInto('dataset_snapshot').values({id,source_id:sourceId,...object,content_hash:hash,columns:JSON.stringify(metadata.columns),csv_options:JSON.stringify(metadata.csvOptions),row_count:metadata.rowCount,size_bytes:size,column_bytes:JSON.stringify(metadata.columnBytes)}).execute();
            await trx.updateTable('dataset_source').set({snapshot_id:id,checked_at:new Date(),etag:validators.etag,last_modified:validators.lastModified,status:'ready',error:null,lease_token:null,lease_until:null}).where('id','=',sourceId).execute();
            if(source.snapshot_id)await trx.updateTable('dataset_snapshot').set({retired_at:new Date()}).where('id','=',source.snapshot_id).execute();
            await sql`UPDATE search_source SET generation=generation+1,retry_at=now(),attempts=0 WHERE kind IN ('dataset_url','dataset_file') AND (source_url=${source.source_url} OR file_id=${source.file_id})`.execute(trx);
            await notifySearchPending(trx);
        });
        console.info(JSON.stringify({event:'dataset_snapshot_published',sourceId,snapshotId:id,rows:metadata.rowCount,bytes:size,encoding:metadata.encoding}));
        return id;
    }catch(error){await storage.remove(object).catch(()=>{});throw error;}
}
