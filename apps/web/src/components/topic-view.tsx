import type {ReactNode} from "react";
import type {TopicSummary} from "@cabildo-abierto/api";

export function TopicView({topic, action, children}: {topic: TopicSummary; action?: ReactNode; children?: ReactNode}) {
    return <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold">{topic.title}</h1>
                <p className="mt-1 text-xs text-muted-foreground">{topic.id}</p>
            </div>
            {action}
        </div>
        {children}
    </div>;
}
