import {cachedDatasetPage,cacheDatasetPage} from './page-cache.js';
import {publishSnapshot} from './publish.js';
import {preparationSlot} from './preparation-slots.js';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,open,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {type Kysely,type Selectable} from 'kysely';
import type {DB} from '#/db/types.js';
import type {CSVOptions,DatasetColumn,DatasetSourceOptions} from '@cabildo-abierto/api';
import {env} from '#/lib/env.js';
import type {ObjectStorage} from '../storage/storage.js';
import {openRemoteFile} from '../storage/download.js';
import {TopicActionError} from '../topic-title-edits.js';
import {datasetLimits} from './csv.js';
import {datasetJob} from './process.js';
import type {CSVEncoding} from './encoding.js';

export type Snapshot=Selectable<DB['dataset_snapshot']>;
export type PreparedCSV={columns:DatasetColumn[];csvOptions:CSVOptions;rowCount:number;columnBytes:number[];encoding:CSVEncoding;inputBytes:number};
export class DatasetPending extends Error {constructor(public state:string){super(state==='checking'?'Verificando actualización…':'Preparando dataset…');}}

async function copyDatasetInput(chunks:AsyncIterable<Uint8Array>,path:string,format:'csv'|'json'){
    const file=await open(path,'wx');const hash=createHash('sha256');let size=0;
    try {for await(const chunk of chunks){size+=chunk.length;if(size>datasetLimits(format).bytes)throw new TopicActionError(413,'El archivo supera el tamaño permitido.');hash.update(chunk);await file.writeFile(chunk);}}
    finally{await file.close();}
    if(!size)throw new TopicActionError(400,'El archivo está vacío.');
    return {hash:hash.digest('hex'),inputBytes:size};
}
export async function prepareLocalCSV(path:string,output:string,directory:string){return datasetJob<PreparedCSV>('prepare',{path,output,directory},env.DATASET_PREPARE_SECONDS);}

async function prepare(database:Kysely<DB>,source:Selectable<DB['dataset_source']>,token:string,storage:ObjectStorage){
    let directory:string|undefined;let release:(()=>void)|undefined;const started=Date.now();
    const heartbeat=setInterval(()=>{void database.updateTable('dataset_source').set({lease_until:new Date(Date.now()+(env.DATASET_PREPARE_SECONDS+60)*1000)}).where('id','=',source.id).where('lease_token','=',token).execute().catch(()=>{});},15000);
    try{
        release=await preparationSlot();
        directory=await mkdtemp(join(tmpdir(),'ca-dataset-'));const path=join(directory,'input');
        const previous=source.snapshot_id ? await database.selectFrom('dataset_snapshot').selectAll().where('id','=',source.snapshot_id).executeTakeFirst() : undefined;
        let etag:string|null=null,lastModified:string|null=null,hash:string,inputBytes:number;
        if(source.source_url){
            const knownSize=previous?.csv_options.inputBytes!==undefined;
            const remote=await openRemoteFile(source.source_url,{maxBytes:datasetLimits(source.source_format).bytes,accept:source.source_format==='json'?'application/json, text/plain;q=0.9':'text/csv, application/zip, application/octet-stream;q=0.9, text/plain;q=0.9',label:source.source_format==='json'?'el JSON':'el CSV o ZIP',etag:knownSize?source.etag:null,lastModified:knownSize?source.last_modified:null});
            if(!remote.response){
                await database.updateTable('dataset_source').set({checked_at:new Date(),status:'ready',error:null,etag:remote.etag??source.etag,last_modified:remote.lastModified??source.last_modified,lease_token:null,lease_until:null}).where('id','=',source.id).where('lease_token','=',token).execute();console.info(JSON.stringify({event:'dataset_source_unchanged',sourceId:source.id}));return;
            }
            etag=remote.etag??null;lastModified=remote.lastModified??null;
            ({hash,inputBytes}=await copyDatasetInput(remote.response,path,source.source_format));
        }else{
            const file=await database.selectFrom('file').selectAll().where('id','=',source.file_id!).executeTakeFirstOrThrow();
            const response=await fetch(await storage.signedUrl(file,'inline',source.source_format==='json'?'application/json':'text/csv'),{signal:AbortSignal.timeout(30000)});
            if(!response.ok||!response.body)throw new Error('No pudimos leer el archivo en R2.');
            ({hash,inputBytes}=await copyDatasetInput(response.body as unknown as AsyncIterable<Uint8Array>,path,source.source_format));
        }
        if(previous?.content_hash===hash){
            if(previous.csv_options.inputBytes===undefined)await database.updateTable('dataset_snapshot').set({csv_options:JSON.stringify({...previous.csv_options,inputBytes})}).where('id','=',previous.id).execute();
            await database.updateTable('dataset_source').set({checked_at:new Date(),etag,last_modified:lastModified,status:'ready',error:null,lease_token:null,lease_until:null}).where('id','=',source.id).where('lease_token','=',token).execute();console.info(JSON.stringify({event:'dataset_source_unchanged',sourceId:source.id}));return;
        }
        await database.updateTable('dataset_source').set({status:'preparing'}).where('id','=',source.id).where('lease_token','=',token).execute();
        const output=join(directory,'data.parquet');const metadata=await datasetJob<PreparedCSV>('prepare',{path,output,directory,format:source.source_format,filter:source.jq_filter,previousColumns:previous?.columns},env.DATASET_PREPARE_SECONDS);
        await publishSnapshot(database,storage,source.id,output,metadata,hash,{etag,lastModified},token);
    }catch(error){await database.updateTable('dataset_source').set({status:'failed',error:error instanceof TopicActionError?error.message:'No pudimos verificar o preparar el dataset. Reintentá.',lease_token:null,lease_until:null}).where('id','=',source.id).where('lease_token','=',token).execute().catch(()=>{});}
    finally{clearInterval(heartbeat);release?.();console.info(JSON.stringify({event:"dataset_preparation_finished",sourceId:source.id,durationMs:Date.now()-started}));if(directory)await rm(directory,{recursive:true,force:true});}
}
export function snapshotCSVOptions(snapshot: Snapshot): CSVOptions {
    return {delimiter: snapshot.csv_options.delimiter, decimal: snapshot.csv_options.decimal};
}

export async function readySnapshot(database:Kysely<DB>,id:string,storage:ObjectStorage,options:{snapshotId?:string;retry?:boolean;cached?:boolean;background?:boolean}={}):Promise<Snapshot>{
    if(options.snapshotId){
        if(typeof options.snapshotId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.snapshotId))throw new TopicActionError(400,'La versión del dataset no es válida.');
        const snapshot=await database.selectFrom('dataset_snapshot').selectAll().where('id','=',options.snapshotId).where('source_id','=',id).executeTakeFirst();
        if(!snapshot)throw new TopicActionError(410,'Esta versión del dataset ya no está disponible. Recargá para continuar.');return snapshot;
    }
    const source=await database.selectFrom('dataset_source').selectAll().where('id','=',id).executeTakeFirst();
    if(!source)throw new TopicActionError(404,'No encontramos la fuente del conjunto de datos.');
    const previous=source.snapshot_id?await database.selectFrom('dataset_snapshot').selectAll().where('id','=',source.snapshot_id).executeTakeFirstOrThrow():null;
    if(previous && (options.cached || (!source.file_id?source.checked_at && Date.now()-source.checked_at.getTime()<env.DATASET_FRESH_SECONDS*1000:true)))return previous;
    // Legacy snapshots have no original byte count. Keep them available until a
    // successful download records it, rather than relying on compressed size.
    const background=options.background && previous && (previous.csv_options.inputBytes===undefined || previous.csv_options.inputBytes>5*1024*1024);
    if(source.status==='failed'&&!options.retry){
        if(background)return previous;
        throw new TopicActionError(400,source.error??'No pudimos preparar el dataset.');
    }
    const token=randomUUID();
    const claimed=await database.updateTable('dataset_source').set({lease_token:token,lease_until:new Date(Date.now()+(env.DATASET_PREPARE_SECONDS+60)*1000),status:source.snapshot_id?'checking':'preparing',error:null})
        .where('id','=',id).where('checked_at',source.checked_at?'=':'is',source.checked_at).where('status','=',source.status).where(eb=>eb.or([eb('lease_until','is',null),eb('lease_until','<',new Date())])).returning('id').executeTakeFirst();
    if(claimed)void prepare(database,source,token,storage).catch(()=>{});
    if(background)return previous;
    throw new DatasetPending(source.status==='preparing'?'preparing':source.snapshot_id?'checking':'preparing');
}
export async function waitSnapshot(database:Kysely<DB>,id:string,storage:ObjectStorage,cached=true){
    for(let attempt=0;attempt<env.DATASET_PREPARE_SECONDS+90;attempt++){
        try{return await readySnapshot(database,id,storage,{cached,retry:attempt===0});}catch(error){if(!(error instanceof DatasetPending))throw error;}
        await new Promise(resolve=>setTimeout(resolve,1000));
    }throw new Error('La preparación del dataset superó el tiempo permitido.');
}
export async function snapshotPage(snapshot:Snapshot,storage:ObjectStorage,page:number){
    if(!Number.isSafeInteger(page)||page<0||page>=Math.max(1,Math.ceil(snapshot.row_count/100)))throw new TopicActionError(400,'La página no es válida.');
    const key=`${snapshot.id}:${page}`;const cached=cachedDatasetPage(key);if(cached)return cached;
    const rows=await datasetJob<string[][]>('page',{url:await storage.signedUrl(snapshot,'inline','application/vnd.apache.parquet'),page,width:snapshot.columns.length},15);
    cacheDatasetPage(key,rows);return rows;
}
export async function validateRemoteDataset(url: string, options: DatasetSourceOptions) {
    const directory = await mkdtemp(join(tmpdir(), 'ca-dataset-dry-'));
    const json = options.sourceFormat === 'json';
    try {
        const {response} = await openRemoteFile(url, {maxBytes: datasetLimits(options.sourceFormat).bytes,
            accept: json ? 'application/json, text/plain;q=0.9' : 'text/csv, application/zip, application/octet-stream;q=0.9', label: json ? 'el JSON' : 'el CSV o ZIP'});
        if (!response) throw new Error('Respuesta inválida');
        const path = join(directory, json ? 'data.json' : 'data.csv');
        await copyDatasetInput(response, path,options.sourceFormat);
        return await datasetJob<PreparedCSV>('prepare', {path, output: join(directory, 'data.parquet'), directory,
            format: options.sourceFormat, filter: options.jqFilter}, env.DATASET_PREPARE_SECONDS);
    } finally { await rm(directory, {recursive: true, force: true}); }
}
export async function validateRemoteCSV(url: string) {
    return validateRemoteDataset(url, {sourceFormat: 'csv', jqFilter: null});
}
