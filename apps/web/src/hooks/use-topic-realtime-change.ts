"use client";

import {useEffect, useState} from "react";
import type {TopicChangedEvent} from "@cabildo-abierto/api";

export const TOPIC_REALTIME_CHANGE_EVENT = "topic-realtime-change";

export function useTopicRealtimeChange(topicId: string): TopicChangedEvent | null {
    const [change, setChange] = useState<TopicChangedEvent | null>(null);

    useEffect(() => {
        const handleChange = (event: Event) => {
            const detail = (event as CustomEvent<TopicChangedEvent>).detail;
            if (detail.topicId === topicId) setChange(detail);
        };
        window.addEventListener(TOPIC_REALTIME_CHANGE_EVENT, handleChange);
        return () => window.removeEventListener(TOPIC_REALTIME_CHANGE_EVENT, handleChange);
    }, [topicId]);

    return change;
}
