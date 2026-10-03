"use client";
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {DatasetOutput} from '@cabildo-abierto/api';
import {preparedDataRequest} from '@/utils/react/prepared-data-request';

export function useDataset(versionId:string){
    const [position,setPosition]=useState<{page:number;snapshotId?:string;versionId:string}>({page:0,versionId});
    const current=position.versionId===versionId?position:{page:0,versionId,snapshotId:undefined};
    const query=useQuery({queryKey:['dataset-version',versionId,current.snapshotId,current.page],
        queryFn:({signal})=>preparedDataRequest<DatasetOutput>(`/dataset-versions/${encodeURIComponent(versionId)}?page=${current.page}${current.snapshotId?`&snapshotId=${current.snapshotId}`:''}&retry=true`,{signal}),
        placeholderData:previous=>current.snapshotId && previous?.id===versionId && previous.snapshotId===current.snapshotId ? previous : undefined,
        staleTime:current.snapshotId?Infinity:0,gcTime:60000,retry:false,refetchOnWindowFocus:false,refetchOnReconnect:false});
    const setPage=(page:number)=>{if(query.data)setPosition({page,snapshotId:query.data.snapshotId,versionId});};
    const reload=()=>{if(current.snapshotId)setPosition({page:0,versionId});else void query.refetch();};
    return {...query,page:current.page,setPage,reload};
}
