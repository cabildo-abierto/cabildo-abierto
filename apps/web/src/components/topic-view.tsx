import type {ReactNode} from "react";
import type {TopicConnectionMode, TopicSummary} from "@cabildo-abierto/api";
import {TopicTitle} from "@/components/topic-title";
import {TopicConnectionCount} from "@/components/topic-connection-count";
import {cn} from "@/lib/utils";

export function TopicView({topic, connectionMode, action, children}: {topic: TopicSummary; connectionMode: TopicConnectionMode; action?: ReactNode; children?: ReactNode}) {
    return <div className={cn("mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6 pb-16")}>
        <div className="flex items-start justify-between gap-4">
            <div>
                <TopicTitle topic={topic} editing={connectionMode === "editing"}/>
                <p className="mt-1 text-xs text-muted-foreground">{topic.slug}</p>
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
