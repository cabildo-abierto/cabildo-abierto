"use client";
import {useEffect} from 'react';
import {useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import type {DatasetSource, LccaOutput, TopicChangedEvent} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {useDebouncedValue} from './use-debounced-value';
import {TOPIC_REALTIME_CHANGE_EVENT} from './use-topic-realtime-change';
export function useLccaQuery(query: string, enabled = true, refreshOnMount = true) {
    const debounced = useDebouncedValue(query,600);
    const client = useQueryClient();
    const result = useQuery({
        queryKey: ['lcca-query', debounced], enabled: enabled && !!debounced.trim() && debounced === query,
        queryFn: ({signal}) => dataViewRequest<LccaOutput>('/lcca/query', {method: 'POST', signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query: debounced, queryLanguageVersion: 1})}),
        staleTime: 0, gcTime: 0, retry: false, refetchOnMount: refreshOnMount ? 'always' : false, refetchOnWindowFocus: false, refetchOnReconnect: false,
    });
    const sources = result.data?.sources ?? [];
    const checks = useQueries({queries: sources.map(source => ({
        queryKey: ['dataset-source', source.topicId, source.blockNumber],
        queryFn: () => dataViewRequest<DatasetSource>(`/datasets/${encodeURIComponent(source.topicId)}/${encodeURIComponent(source.blockNumber)}`),
        staleTime: 0, retry: false, refetchInterval: 30000,
    }))});
    const changed = checks.some((check,i) => !!check.data && check.dataUpdatedAt > result.dataUpdatedAt && check.data.versionId !== sources[i]?.versionId);
    const missing = checks.find(check => check.error && check.errorUpdatedAt > result.dataUpdatedAt)?.error;
    useEffect(() => { if (changed && !result.isFetching) void client.invalidateQueries({queryKey: ['lcca-query', debounced], exact: true}, {cancelRefetch: false}); }, [changed, result.isFetching, client, debounced]);
    useEffect(() => {
        const handle = (event: Event) => {
            const change = (event as CustomEvent<TopicChangedEvent>).detail;
            if (change?.source !== 'edit' && change?.source !== 'vote') return;
            for (const source of sources.filter(source => source.topicId === change.topicId)) {
                // Reload the query only if these metadata checks find a new source version.
                void client.invalidateQueries({queryKey: ['dataset-source', source.topicId, source.blockNumber], exact: true}, {cancelRefetch: false});
            }
        };
        window.addEventListener(TOPIC_REALTIME_CHANGE_EVENT, handle);
        return () => window.removeEventListener(TOPIC_REALTIME_CHANGE_EVENT, handle);
    }, [sources, client]);
    const current = debounced === query;
    return {data: current && !changed && !missing && !result.error ? result.data : undefined, loading: enabled && !!query.trim() && (!current || result.isPending || result.isFetching || changed), error: current ? missing ?? result.error : null, refetch: result.refetch};
}
