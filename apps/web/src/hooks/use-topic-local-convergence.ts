"use client";

import {useEffect} from "react";
import {useIsMutating} from "@tanstack/react-query";
import type {TopicEditableBlock} from "@cabildo-abierto/api";

const TOPIC_LOCAL_CONVERGENCE_EVENT = "topic-local-convergence";
type LocalConvergence = {topicId: string; blocks: TopicEditableBlock[]};
export const topicDeleteVersionKey = (topicId: string) => ["topic", topicId, "delete-version"] as const;

export function notifyTopicLocalConvergence(topicId: string, blocks: TopicEditableBlock[]) {
    window.dispatchEvent(new CustomEvent<LocalConvergence>(TOPIC_LOCAL_CONVERGENCE_EVENT, {detail: {topicId, blocks}}));
}

export function useTopicLocalConvergence(topicId: string, onUpdate: (blocks: TopicEditableBlock[]) => void) {
    const pendingDeletions = useIsMutating({mutationKey: topicDeleteVersionKey(topicId)});
    useEffect(() => {
        const handleUpdate = (event: Event) => {
            const detail = (event as CustomEvent<LocalConvergence>).detail;
            if (detail.topicId === topicId) onUpdate(detail.blocks);
        };
        window.addEventListener(TOPIC_LOCAL_CONVERGENCE_EVENT, handleUpdate);
        return () => window.removeEventListener(TOPIC_LOCAL_CONVERGENCE_EVENT, handleUpdate);
    }, [topicId, onUpdate]);
    return pendingDeletions > 0;
}
