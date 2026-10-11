"use client";
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {DatasetSource, DatasetTableContent, TablePageOutput, TableOrder} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {preparedDataRequest} from '@/utils/react/prepared-data-request';
import {useDebouncedValue} from './use-debounced-value';
import {useDatasetUpdate} from './use-dataset-update';

export function useTablePage(value: DatasetTableContent) {
    const [search, setSearch] = useState('');
    const debounced = useDebouncedValue(search, 300);
    const [position, setPosition] = useState<{page: number; snapshotId?: string; order: TableOrder | null; retry: boolean}>({page: 0, order: value.order, retry: false});
    const source = useQuery({queryKey: ['dataset-source', value.source.topicId, value.source.blockNumber],
        queryFn: ({signal}) => dataViewRequest<DatasetSource>(`/datasets/${encodeURIComponent(value.source.topicId)}/${encodeURIComponent(value.source.blockNumber)}`, {signal}),
        retry: false, refetchOnWindowFocus: false});
    const versionId = source.data?.versionId ?? '';
    const query = useQuery({queryKey: ['table-page', versionId, value.columns.map(column => column.field), value.pageSize, debounced, position],
        enabled: !!versionId && search === debounced,
        queryFn: ({signal}) => preparedDataRequest<TablePageOutput>(`/dataset-versions/${encodeURIComponent(versionId)}/table-page`, {
            method: 'POST', signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...position, columns: value.columns.map(column => column.field), pageSize: value.pageSize, search: debounced})}),
        placeholderData: previous => !position.snapshotId || previous?.snapshotId === position.snapshotId ? previous : undefined,
        retry: false, gcTime: 60000, refetchOnWindowFocus: false, refetchOnReconnect: false});
    const update = useDatasetUpdate(versionId, query.isPlaceholderData ? undefined : query.data?.update, query.dataUpdatedAt);
    const pin = () => position.snapshotId ?? query.data?.snapshotId;
    const page = (page: number) => setPosition({...position, page, snapshotId: pin(), retry: false});
    const sort = (field: string) => setPosition({...position, page: 0, snapshotId: pin(), retry: false,
        order: {field, direction: position.order?.field === field && position.order.direction === 'asc' ? 'desc' : 'asc'}});
    const searchFor = (search: string) => {setSearch(search); setPosition({...position, page: 0, snapshotId: pin(), retry: false});};
    const reload = () => {
        if (source.error) {void source.refetch(); return;}
        const snapshotId = update.update?.state === 'ready' ? update.update.snapshotId ?? undefined : undefined;
        setPosition({...position, page: 0, snapshotId, retry: !snapshotId});
        if (!snapshotId && position.retry && !position.snapshotId) void query.refetch();
    };
    return {data: query.data, loading: source.isPending || query.isFetching || search !== debounced,
        error: source.error ?? query.error, search, searchFor, page, sort, order: position.order,
        reload, update: update.update, updateError: update.error};
}
