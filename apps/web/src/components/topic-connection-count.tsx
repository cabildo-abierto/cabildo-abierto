"use client";

import type {TopicConnectionMode} from "@cabildo-abierto/api";
import {TopicConnectionSummary} from './topic-connection-summary';
import {useTopicConnections} from "@/hooks/use-topic-connections";
import {cn} from "@/lib/utils";

export function TopicConnectionCount({topicId, mode, className}: {topicId: string; mode: TopicConnectionMode; className?: string}) {
    const connections = useTopicConnections(topicId, mode);
    if (!connections) return null;

    return <TopicConnectionSummary connections={connections} className={cn('mt-3', className)}/>;
}
