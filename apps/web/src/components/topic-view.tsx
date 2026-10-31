import {TopicAccessDialog} from '@/components/topic-access-dialog';
import {LockSimpleIcon} from '@phosphor-icons/react';
import type {ReactNode} from "react";
import type {TopicConnectionMode, TopicSummary} from "@cabildo-abierto/api";
import {TopicTitle} from "@/components/topic-title";
import {TopicConnectionCount} from "@/components/topic-connection-count";
import {cn} from "@/lib/utils";

export function TopicView({topic, connectionMode, action, children}: {topic: TopicSummary; connectionMode: TopicConnectionMode; action?: ReactNode; children?: ReactNode}) {
    return <div className={cn("mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6 pb-64")}>
        <div className={cn('flex items-start justify-between gap-4')}>
            <div className={cn('min-w-0')}>
                <TopicTitle topic={topic} editing={connectionMode === "editing"}/>
                <p className={cn('mt-1 break-words text-xs text-muted-foreground')}>{topic.slug}</p>
            </div>
            <div className={cn('flex shrink-0 flex-wrap items-center gap-2')}>
                {topic.visibility === 'private' && <span className={cn('flex items-center gap-1 text-xs text-muted-foreground')}><LockSimpleIcon/>Privado</span>}
                {topic.role === 'admin' && <TopicAccessDialog topic={topic}/>}
                {action}
            </div>
        </div>
        <div className={cn('flex min-h-8 flex-wrap items-center justify-between gap-x-3 gap-y-2')}>
            <TopicConnectionCount topicId={topic.id} mode={connectionMode} className="mt-0"/>
            <div id={`topic-status-actions-${topic.id}`} className={cn('ml-auto flex items-center justify-end')}/>
        </div>
        {children}
    </div>;
}
