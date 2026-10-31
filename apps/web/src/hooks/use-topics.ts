"use client";

import {useQuery} from '@tanstack/react-query';
import type {TopicListOutput} from '@cabildo-abierto/api';
import {get} from '@/utils/react/fetch';

export function useTopics({search = '', offset = 0, limit = 20, enabled = true}: {
    search?: string; offset?: number; limit?: number; enabled?: boolean;
} = {}) {
    const query = search.trim();
    return useQuery({
        queryKey: ['topics', query, offset, limit],
        enabled,
        queryFn: async () => {
            const params = new URLSearchParams({offset: String(offset), limit: String(limit)});
            if (query) params.set('q', query);
            const path = query ? '/topics/search' : '/topics';
            const result = await get<TopicListOutput>(`${path}?${params}`);
            if ('error' in result) throw new Error(result.error);
            return result.value;
        },
    });
}
