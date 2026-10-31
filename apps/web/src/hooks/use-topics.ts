"use client";

import {useAuth} from '@/components/auth-provider';
import {useQuery} from '@tanstack/react-query';
import type {TopicListOutput} from '@cabildo-abierto/api';
import {get} from '@/utils/react/fetch';
import {useTopicListConnections} from './use-topic-list-connections';

export function useTopics({search = '', offset = 0, limit = 20, enabled = true}: {
    search?: string; offset?: number; limit?: number; enabled?: boolean;
} = {}) {
    const {user} = useAuth();
    const query = search.trim();
    const queryKey = ['topics', query, offset, limit, user?.id] as const;
    const topics = useQuery({
        queryKey,
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
    useTopicListConnections(queryKey, enabled ? topics.data?.results : undefined);
    return topics;
}
