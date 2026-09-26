"use client";

import {BackToTopicButton} from "@/components/back-to-topic-button";
import {useAuth} from "@/components/auth-provider";
import {useTopicRoute} from "@/components/topic-route-provider";
import {TopicTitleEditForm} from "@/components/topic-title-edit-form";

export function TopicTitleEditsHeader() {
    const topic = useTopicRoute();
    const {user} = useAuth();

    return <header className="space-y-5 pb-5">
        <nav aria-label="Navegación de títulos" className="flex flex-wrap items-center justify-between gap-2">
            <BackToTopicButton href={`/tema/${encodeURIComponent(topic.slug)}${user ? "/editar" : ""}`}/>
        </nav>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-semibold">Cambios de título</h1>
                <p className="break-words text-sm text-muted-foreground">{topic.title}</p>
            </div>
            {user && <div className="shrink-0"><TopicTitleEditForm topic={topic}/></div>}
        </div>
    </header>;
}
