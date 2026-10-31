"use client";

import {useEffect} from 'react';
import {useQueryClient, type QueryKey} from '@tanstack/react-query';
import type {TopicConnectionsChangedEvent, TopicListOutput, TopicListResult} from '@cabildo-abierto/api';
import {backendUrl} from '@/lib/fetch';

export function useTopicListConnections(queryKey: QueryKey, results: TopicListResult[] | undefined) {
    const client = useQueryClient();
    const cacheKey = JSON.stringify(queryKey);
    const ids = results?.map(result => result.topic.id).sort().join(',') ?? '';
    useEffect(() => {
        if (!ids) return;
        const topicIds = new Set(ids.split(','));
        const key = JSON.parse(cacheKey) as QueryKey;
        const source = new EventSource(`${backendUrl}/topics/events?${new URLSearchParams({ids})}`);
        const onChange = (event: Event) => {
            try {
                const message = JSON.parse((event as MessageEvent<string>).data) as TopicConnectionsChangedEvent;
                if (message.type !== 'connections.changed' || !topicIds.has(message.topicId)) return;
                client.setQueryData<TopicListOutput>(key, current => {
                    if (!current) return current;
                    let changed = false;
                    const results = current.results.map(result => {
                        if (result.topic.id !== message.topicId ||
                            (result.connections.reading === message.connections.reading && result.connections.editing === message.connections.editing)) return result;
                        changed = true;
                        return {...result, connections: message.connections};
                    });
                    return changed ? {...current, results} : current;
                });
            } catch {
                // Reconnection sends a fresh snapshot if an event cannot be read.
            }
        };
        source.addEventListener('connections.changed', onChange);
        return () => {
            source.removeEventListener('connections.changed', onChange);
            source.close();
        };
    }, [client, cacheKey, ids]);
}
