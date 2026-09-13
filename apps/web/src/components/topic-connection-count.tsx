"use client";

import type {TopicConnectionMode} from "@cabildo-abierto/api";
import {EyeIcon, PencilSimpleIcon} from "@phosphor-icons/react";
import {useTopicConnections} from "@/hooks/use-topic-connections";

export function TopicConnectionCount({topicId, mode}: {topicId: string; mode: TopicConnectionMode}) {
    const connections = useTopicConnections(topicId, mode);
    if (!connections) return null;

    return <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        <span className="inline-flex items-center gap-1" title={`${connections.reading} leyendo`}>
            <EyeIcon className="size-3.5"/>{connections.reading} leyendo
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1" title={`${connections.editing} editando`}>
            <PencilSimpleIcon className="size-3.5"/>{connections.editing} editando
        </span>
    </div>;
}
