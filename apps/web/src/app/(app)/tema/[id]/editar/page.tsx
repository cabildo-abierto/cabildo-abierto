"use client"

import {useTopicRoute} from "@/components/topic-route-provider";

import {useRouter} from "next/navigation";
import {useEffect, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import type {TopicEditorDataOutput} from "@cabildo-abierto/api";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicView} from "@/components/topic-view";
import {TopicBlockEditor, type TopicBlockEditorHandle} from "@/components/topic-block-editor";
import {useAuth} from "@/components/auth-provider";
import {get} from "@/utils/react/fetch";
import {TopicLoading} from "@/components/topic-loading";
import {useIsMobile} from "@/hooks/use-is-mobile";

export default function EditTopicPage() {
    const topic = useTopicRoute();
    const id = topic.id;
    const router = useRouter();
    const {user, loading: authLoading} = useAuth();
    const isMobile = useIsMobile();
    const editorRef = useRef<TopicBlockEditorHandle>(null);

    useEffect(() => {
        if (!authLoading && !user) router.replace("/iniciar-sesion");
    }, [authLoading, router, user]);

    const blocksQuery = useQuery({
        queryKey: ["topic", id, "editor-data"],
        queryFn: async () => {
            const result = await get<TopicEditorDataOutput>(`/topics/${encodeURIComponent(id)}/editor-data`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
        enabled: !authLoading && Boolean(user),
    });
    const blocks = blocksQuery.data?.blocks ?? [];
    const blockTypes = blocksQuery.data?.blockTypes ?? [];
    const error = blocksQuery.error instanceof Error ? blocksQuery.error.message : null;

    if (authLoading || !user || isMobile === null) return <TopicLoading/>;
    if (isMobile) return <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-start justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">La edición está disponible solo en computadora</h1>
        <p className="text-sm text-muted-foreground">Podés seguir consultando el tema desde este dispositivo.</p>
        <Button type="button" variant="outline" onClick={() => router.replace(`/tema/${encodeURIComponent(topic.slug)}`)}>Volver al tema</Button>
    </div>;
    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (blocksQuery.isPending) return <TopicLoading/>;

    return <TopicView topic={topic} connectionMode="editing" action={
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 py-0.5 pr-1 pl-2.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <span>Modo edición</span>
            <Button type="button" variant="ghost" size="icon-xs"
                className="rounded-full text-current hover:bg-amber-500/15 hover:text-current dark:hover:bg-amber-300/15"
                onClick={() => {
                    if (editorRef.current?.canFinishEditing() ?? true) router.push(`/tema/${encodeURIComponent(topic.slug)}`);
                }}
                aria-label="Salir del modo edición" title="Salir del modo edición">
                <XIcon weight="bold"/>
            </Button>
        </div>
    }>
        <TopicBlockEditor ref={editorRef} topicId={topic.id} initialBlocks={blocks} blockTypes={blockTypes}/>
    </TopicView>;
}
