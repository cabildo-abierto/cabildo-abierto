"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import type {BlockType, TopicBlock, TopicBlocksOutput, TopicOutput, TopicSummary} from "@cabildo-abierto/api";
import {ArrowLeftIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicView} from "@/components/topic-view";
import {TopicBlockEditor, type TopicBlockEditorHandle} from "@/components/topic-block-editor";
import {useAuth} from "@/components/auth-provider";
import {get} from "@/utils/react/fetch";

export default function EditTopicPage() {
    const {id} = useParams<{id: string}>();
    const router = useRouter();
    const {user, loading: authLoading} = useAuth();
    const [topic, setTopic] = useState<TopicSummary | null>(null);
    const [blocks, setBlocks] = useState<TopicBlock[]>([]);
    const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<TopicBlockEditorHandle>(null);

    useEffect(() => {
        if (!authLoading && !user) router.replace("/iniciar-sesion");
    }, [authLoading, router, user]);

    useEffect(() => {
        if (authLoading || !user) return;
        let current = true;
        void Promise.all([
            get<TopicOutput>(`/topics/${encodeURIComponent(id)}`),
            get<TopicBlocksOutput>(`/topics/${encodeURIComponent(id)}/blocks`),
        ]).then(([topicResult, blocksResult]) => {
            if (!current) return;
            if ("error" in topicResult) setError(topicResult.error);
            else if ("error" in blocksResult) setError(blocksResult.error);
            else {
                setTopic(topicResult.value.topic);
                setBlocks(blocksResult.value.blocks);
                setBlockTypes(blocksResult.value.blockTypes);
            }
        });
        return () => { current = false; };
    }, [authLoading, id, user]);

    if (authLoading || !user) return <div className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">Comprobando sesión…</div>;
    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (!topic) return <div className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">Cargando tema…</div>;

    return <TopicView topic={topic} action={
        <Button type="button" variant="outline" size="sm" onClick={() => {
            if (editorRef.current?.canFinishEditing() ?? true) router.push(`/tema/${encodeURIComponent(topic.id)}`);
        }}>
            <ArrowLeftIcon/>
            Terminar edición
        </Button>
    }>
        <TopicBlockEditor ref={editorRef} topicId={topic.id} initialBlocks={blocks} blockTypes={blockTypes}/>
    </TopicView>;
}
