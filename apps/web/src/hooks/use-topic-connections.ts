"use client";

import {useEffect, useState} from "react";
import type {TopicConnectionCounts, TopicConnectionMode, TopicConnectionsChangedEvent} from "@cabildo-abierto/api";
import {backendUrl} from "@/lib/fetch";

export function useTopicConnections(topicId: string, mode: TopicConnectionMode): TopicConnectionCounts | null {
    const [connections, setConnections] = useState<TopicConnectionCounts | null>(null);

    useEffect(() => {
        setConnections(null);
        const source = new EventSource(
            `${backendUrl}/topics/${encodeURIComponent(topicId)}/connections?mode=${encodeURIComponent(mode)}`,
            {withCredentials: true},
        );
        const onConnectionsChanged = (event: Event) => {
            try {
                const message = JSON.parse((event as MessageEvent<string>).data) as TopicConnectionsChangedEvent;
                if (message.type === "connections.changed" && message.topicId === topicId) {
                    setConnections(message.connections);
                }
            } catch {
                // A later valid snapshot will replace a malformed event.
            }
        };
        source.addEventListener("connections.changed", onConnectionsChanged);
        return () => {
            source.removeEventListener("connections.changed", onConnectionsChanged);
            source.close();
        };
    }, [mode, topicId]);

    return connections;
}
