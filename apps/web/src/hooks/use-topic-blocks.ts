"use client";

import {useQuery} from '@tanstack/react-query';
import type {TopicBlocksOutput} from '@cabildo-abierto/api';
import {get} from '@/utils/react/fetch';

export function useTopicBlocks(topicId: string, enabled = true) {
    return useQuery({
        queryKey: ['topic', topicId, 'blocks'],
        enabled,
        queryFn: async () => {
            const result = await get<TopicBlocksOutput>(`/topics/${encodeURIComponent(topicId)}/blocks`);
            if ('error' in result) throw new Error(result.error);
            return result.value;
        },
    });
}
