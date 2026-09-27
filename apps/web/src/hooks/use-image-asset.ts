import {useQuery} from '@tanstack/react-query';
import type {ImageAssetOutput} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';
export function useImageAsset(fileId:string) {
    return useQuery({queryKey:['image-asset',fileId],enabled:!!fileId,
        queryFn:({signal})=>dataViewRequest<ImageAssetOutput>('/images/files/'+encodeURIComponent(fileId),{signal}),
        staleTime:600000,retry:false,refetchOnWindowFocus:false});
}
