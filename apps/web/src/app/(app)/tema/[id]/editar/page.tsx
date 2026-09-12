"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import type {TopicBlocksOutput, TopicOutput} from "@cabildo-abierto/api";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicView} from "@/components/topic-view";
import {TopicBlockEditor, type TopicBlockEditorHandle} from "@/components/topic-block-editor";
import {useAuth} from "@/components/auth-provider";
import {get} from "@/utils/react/fetch";
import {Spinner} from "@/components/ui/spinner";

export default function EditTopicPage() {
    const {id} = useParams<{id: string}>();
    const router = useRouter();
    const {user, loading: authLoading} = useAuth();
    const editorRef = useRef<TopicBlockEditorHandle>(null);

    useEffect(() => {
        if (!authLoading && !user) router.replace("/iniciar-sesion");
    }, [authLoading, router, user]);

    const topicQuery = useQuery({
        queryKey: ["topic", id],
        queryFn: async () => {
            const result = await get<TopicOutput>(`/topics/${encodeURIComponent(id)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topic;
        },
        enabled: !authLoading && Boolean(user),
    });
    const blocksQuery = useQuery({
        queryKey: ["topic", id, "editor-data"],
        queryFn: async () => {
            const result = await get<TopicBlocksOutput>(`/topics/${encodeURIComponent(id)}/blocks`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
        enabled: !authLoading && Boolean(user),
    });
    const topic = topicQuery.data;
    const blocks = blocksQuery.data?.blocks ?? [];
    const blockTypes = blocksQuery.data?.blockTypes ?? [];
    const error = topicQuery.error instanceof Error ? topicQuery.error.message : blocksQuery.error instanceof Error ? blocksQuery.error.message : null;

    if (authLoading || !user) return <div className="mx-auto flex max-w-2xl items-center gap-2 p-6 text-sm text-muted-foreground"><Spinner/>Comprobando sesión…</div>;
    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (topicQuery.isPending || blocksQuery.isPending || !topic) return <div className="mx-auto flex max-w-2xl items-center gap-2 p-6 text-sm text-muted-foreground"><Spinner/>Cargando tema…</div>;

    return <TopicView topic={topic} action={
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 py-0.5 pr-1 pl-2.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <span>Modo edición</span>
            <Button type="button" variant="ghost" size="icon-xs"
                className="rounded-full text-current hover:bg-amber-500/15 hover:text-current dark:hover:bg-amber-300/15"
                onClick={() => {
                    if (editorRef.current?.canFinishEditing() ?? true) router.push(`/tema/${encodeURIComponent(topic.id)}`);
                }}
                aria-label="Salir del modo edición" title="Salir del modo edición">
                <XIcon weight="bold"/>
            </Button>
        </div>
    }>
        <TopicBlockEditor ref={editorRef} topicId={topic.id} initialBlocks={blocks} blockTypes={blockTypes}/>
    </TopicView>;
}
