"use client";

import {keepPreviousData, useQuery} from '@tanstack/react-query';
import type {DatasetListOutput, DocumentListOutput} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {useDebouncedValue} from './use-debounced-value';

export function useTopicAttachments(topicId: string, type: 'documento' | 'dataset', options: {
    search: string; page: number; includeDeleted?: boolean; revision?: string; enabled: boolean;
}) {
    const search = useDebouncedValue(options.search, 250);
    const result = useQuery({
        queryKey: ['topic', topicId, 'blocks', 'attachments', type, search, options.page, Boolean(options.includeDeleted), options.revision],
        enabled: options.enabled && search === options.search,
        placeholderData: keepPreviousData,
        queryFn: ({signal}) => {
            const params = new URLSearchParams({topicId, search, page: String(options.page), includeDeleted: String(Boolean(options.includeDeleted))});
            return dataViewRequest<DocumentListOutput | DatasetListOutput>(`/${type === 'dataset' ? 'datasets' : 'documents'}?${params}`, {signal});
        },
    });
    return {...result, loading: result.isPending || result.isPlaceholderData || search !== options.search};
}
