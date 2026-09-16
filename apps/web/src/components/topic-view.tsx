import type {ReactNode} from "react";
import type {TopicConnectionMode, TopicSummary} from "@cabildo-abierto/api";
import {TopicConnectionCount} from "@/components/topic-connection-count";

export function TopicView({topic, connectionMode, action, children}: {topic: TopicSummary; connectionMode: TopicConnectionMode; action?: ReactNode; children?: ReactNode}) {
    return <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold">{topic.title}</h1>
                <p className="mt-1 text-xs text-muted-foreground">{topic.id}</p>
            </div>
            {action}
        </div>
        <div className="flex min-h-8 items-center justify-between gap-3">
            <TopicConnectionCount topicId={topic.id} mode={connectionMode} className="mt-0"/>
            <div id={`topic-status-actions-${topic.id}`} className="ml-auto flex shrink-0 items-center justify-end"/>
        </div>
        {children}
    </div>;
}
