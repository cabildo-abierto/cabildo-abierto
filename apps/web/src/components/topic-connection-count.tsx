"use client";

import type {TopicConnectionMode} from "@cabildo-abierto/api";
import {EyeIcon, PencilSimpleIcon} from "@phosphor-icons/react";
import {useTopicConnections} from "@/hooks/use-topic-connections";
import {cn} from "@/lib/utils";

export function TopicConnectionCount({topicId, mode, className}: {topicId: string; mode: TopicConnectionMode; className?: string}) {
    const connections = useTopicConnections(topicId, mode);
    if (!connections) return null;

    return <div className={cn("mt-3 flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted-foreground", className)} aria-live="polite">
        <span className={cn('inline-flex items-center gap-1 whitespace-nowrap')} title={`${connections.reading} leyendo`}>
            <EyeIcon className={cn('size-3.5 shrink-0')}/>{connections.reading} leyendo
        </span>
        <span aria-hidden="true">·</span>
        <span className={cn('inline-flex items-center gap-1 whitespace-nowrap')} title={`${connections.editing} editando`}>
            <PencilSimpleIcon className={cn('size-3.5 shrink-0')}/>{connections.editing} editando
        </span>
    </div>;
}
