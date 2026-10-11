"use client"

import {useTopicRoute} from "@/components/topic-route-provider";

import {useRouter} from "next/navigation";
import {useEffect, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import type {TopicEditorDataOutput} from "@cabildo-abierto/api";
import {TopicEditingBadge} from "@/components/topic-editing-badge";
import {BackToTopicButton} from "@/components/back-to-topic-button";
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
        <BackToTopicButton href={`/tema/${encodeURIComponent(topic.slug)}`} replace/>
    </div>;
    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (blocksQuery.isPending) return <TopicLoading/>;

    return <>
        <TopicEditingBadge onExit={() => {
            if (editorRef.current?.canFinishEditing() ?? true) router.push(`/tema/${encodeURIComponent(topic.slug)}`);
        }}/>
        <TopicView topic={topic} connectionMode="editing">
            <TopicBlockEditor ref={editorRef} topicId={topic.id} initialBlocks={blocks} blockTypes={blockTypes}/>
        </TopicView>
    </>;
}
