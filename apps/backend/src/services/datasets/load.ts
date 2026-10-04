import type {Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {ObjectStorage} from '../storage/storage.js';
import {datasetCell} from '@cabildo-abierto/utils';
import type {DatasetOutput} from '@cabildo-abierto/api';
import {requireDatasetAccess} from './access.js';
import {readySnapshot,snapshotPage} from './snapshots.js';
export async function loadDataset(database:Kysely<DB>,id:string,getStorage:()=>ObjectStorage,options:{page?:number;snapshotId?:string;retry?:boolean}={}):Promise<DatasetOutput>{
    const dataset=await requireDatasetAccess(database,id);
    const snapshot=await readySnapshot(database,dataset.source_id,getStorage(),options);
    const page=options.page??0;
    const raw=await snapshotPage(snapshot,getStorage(),page);
    const indices=new Map(snapshot.columns.map((c,i)=>[c.name,i]));
    const rows=raw.map(row=>dataset.columns.map(column=>{
        const index=indices.get(column.name);
        return index===undefined?{raw:'',value:null,error:'La columna ya no está en el dataset.'}:datasetCell(row[index],column.type,snapshot.csv_options);
    }));
    return {sourceFormat:dataset.source_format,jqFilter:dataset.jq_filter,id:dataset.id,title:dataset.title,description:dataset.description,fileId:dataset.file_id,sourceUrl:dataset.source_url,
        columns:dataset.columns,csvOptions:snapshot.csv_options,rows,rowCount:snapshot.row_count,snapshotId:snapshot.id,page,
        topic:{id:dataset.topicId,title:dataset.topicTitle,slug:dataset.topicSlug}};
}
