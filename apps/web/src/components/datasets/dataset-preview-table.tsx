"use client";
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {DatasetColumn,DatasetColumnType,DatasetPreview} from '@cabildo-abierto/api';
import {datasetCell} from '@cabildo-abierto/utils';
import {preparedDataRequest} from '@/utils/react/prepared-data-request';
import {DatasetTable} from './dataset-table';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
export function DatasetPreviewTable({topicId,preview,columns,onTypeChange}:{topicId:string;preview:DatasetPreview;columns:DatasetColumn[];onTypeChange:(index:number,type:DatasetColumnType)=>void}){
    const [page,setPage]=useState(0);
    const query=useQuery({queryKey:['dataset-preview',preview.snapshotId,page],
        queryFn:({signal})=>preparedDataRequest<DatasetPreview>(`/topics/${encodeURIComponent(topicId)}/datasets/preview`,{
            method:'POST',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({fileId:preview.fileId,sourceUrl:preview.sourceUrl,snapshotId:preview.snapshotId,page})}),
        placeholderData:previous=>previous?.snapshotId===preview.snapshotId?previous:undefined,
        initialData:page===0?preview:undefined,staleTime:Infinity,gcTime:60000,retry:false});
    if(query.error)return <div className={cn('space-y-2 text-xs text-destructive')}><p>{query.error.message}</p><Button type="button" onClick={()=>void query.refetch()}>Reintentar</Button></div>;
    const indices=new Map(preview.columns.map((c,i)=>[c.name,i]));
    const rows=(query.data?.rows??[]).map(row=>columns.map(c=>datasetCell(row[indices.get(c.name)??-1]??'',c.type,preview.csvOptions)));
    return <DatasetTable columns={columns} rows={rows} rowCount={preview.rowCount} page={page} loading={query.isFetching} onPageChange={setPage} onTypeChange={onTypeChange}/>;
}
