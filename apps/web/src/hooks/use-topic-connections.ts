"use client";

import {useEffect, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import type {TopicChangedEvent, TopicConnectionCounts, TopicConnectionMode, TopicConnectionOpenedEvent, TopicConnectionsChangedEvent} from "@cabildo-abierto/api";
import {backendUrl} from "@/lib/fetch";
import {TOPIC_REALTIME_CHANGE_EVENT} from "@/hooks/use-topic-realtime-change";

export function useTopicConnections(topicId: string, mode: TopicConnectionMode): TopicConnectionCounts | null {
    const [connections, setConnections] = useState<TopicConnectionCounts | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        setConnections(null);
        const source = new EventSource(
            `${backendUrl}/topics/${encodeURIComponent(topicId)}/connections?mode=${encodeURIComponent(mode)}`,
            {withCredentials: true},
        );
        let connectionId: string | null = null;
        let disconnected = false;
        const disconnect = () => {
            if (disconnected || !connectionId) return;
            disconnected = true;
            const disconnectUrl = `${backendUrl}/topics/${encodeURIComponent(topicId)}/connections/${encodeURIComponent(connectionId)}/disconnect`;
            if (navigator.sendBeacon?.(disconnectUrl, new Blob([], {type: "text/plain"}))) return;
            void fetch(disconnectUrl, {
                method: "POST",
                credentials: "include",
                keepalive: true,
            });
        };
        let refreshTimer: ReturnType<typeof setTimeout> | null = null;
        const refreshTopic = () => {
            if (refreshTimer) clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => {
                refreshTimer = null;
                void queryClient.invalidateQueries({queryKey: ["topic", topicId], refetchType: "all"});
            }, 50);
        };
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
        const onConnectionOpened = (event: Event) => {
            try {
                const message = JSON.parse((event as MessageEvent<string>).data) as TopicConnectionOpenedEvent;
                if (message.type === "connection.opened" && message.topicId === topicId) {
                    connectionId = message.connectionId;
                }
            } catch {
                // A later reconnect will provide a new connection identifier.
            }
        };
        const onTopicChanged = (event: Event) => {
            try {
                const message = JSON.parse((event as MessageEvent<string>).data) as TopicChangedEvent;
                if (message.type === "topic.changed" && message.topicId === topicId) {
                    window.dispatchEvent(new CustomEvent(TOPIC_REALTIME_CHANGE_EVENT, {detail: message}));
                    refreshTopic();
                }
            } catch {
                // Reconnection will trigger a complete topic refresh.
            }
        };
        source.addEventListener("open", refreshTopic);
        source.addEventListener("connection.opened", onConnectionOpened);
        source.addEventListener("connections.changed", onConnectionsChanged);
        source.addEventListener("topic.changed", onTopicChanged);
        window.addEventListener("pagehide", disconnect);
        return () => {
            disconnect();
            if (refreshTimer) clearTimeout(refreshTimer);
            source.removeEventListener("open", refreshTopic);
            source.removeEventListener("connection.opened", onConnectionOpened);
            source.removeEventListener("connections.changed", onConnectionsChanged);
            source.removeEventListener("topic.changed", onTopicChanged);
            window.removeEventListener("pagehide", disconnect);
            source.close();
        };
    }, [mode, queryClient, topicId]);

    return connections;
}
