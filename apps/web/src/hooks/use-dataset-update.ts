"use client";

import {useEffect, useRef} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {DatasetUpdate} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';

export function useDatasetUpdate(versionId: string, initial: DatasetUpdate | undefined, updatedAt: number) {
    const client = useQueryClient();
    const started = useRef(0);
    useEffect(() => {
        started.current = initial?.state === 'checking' || initial?.state === 'preparing' ? Date.now() : 0;
        if (initial) client.setQueryData(['dataset-update',versionId], initial);
    }, [client, versionId, initial, updatedAt]);
    const query = useQuery({queryKey: ['dataset-update',versionId], initialData: initial,
        enabled: !!initial && (initial.state === 'checking' || initial.state === 'preparing'),
        queryFn: ({signal}) => {
            if (started.current && Date.now() - started.current > 240000) throw new Error('La actualización está tardando demasiado. Podés reintentar y seguir usando la versión guardada.');
            return dataViewRequest<DatasetUpdate>(`/dataset-versions/${encodeURIComponent(versionId)}/update`, {signal});
        },
        refetchInterval: query => query.state.status !== 'error' && (query.state.data?.state === 'checking' || query.state.data?.state === 'preparing') ? 1000 : false,
        retry: false, gcTime: 60000, refetchOnWindowFocus: false, refetchOnReconnect: false});
    return {update: query.data ?? initial, error: query.error};
}
