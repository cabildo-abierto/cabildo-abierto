"use client"

import Link from "next/link";
import {useParams, useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import type {TopicBlocksOutput, TopicOutput} from "@cabildo-abierto/api";
import {ArrowLeftIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";
import {get} from "@/utils/react/fetch";
import {Spinner} from "@/components/ui/spinner";
import {TopicConnectionCount} from "@/components/topic-connection-count";

export default function TopicBlockPage() {
    const {id, blockNumber} = useParams<{id: string; blockNumber: string}>();
    const searchParams = useSearchParams();
    const topicQuery = useQuery({
        queryKey: ["topic", id],
        queryFn: async () => {
            const result = await get<TopicOutput>(`/topics/${encodeURIComponent(id)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topic;
        },
    });
    const blocksQuery = useQuery({
        queryKey: ["topic", id, "blocks"],
        queryFn: async () => {
            const result = await get<TopicBlocksOutput>(`/topics/${encodeURIComponent(id)}/blocks`);
            if ("error" in result) throw new Error(result.error);
            return result.value.blocks;
        },
    });
    const topic = topicQuery.data;
    const block = blocksQuery.data?.find(candidate => candidate.blockNumber === blockNumber);
    const error = topicQuery.error instanceof Error ? topicQuery.error.message : blocksQuery.error instanceof Error ? blocksQuery.error.message : null;

    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (topicQuery.isPending || blocksQuery.isPending || !topic) return <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-sm text-muted-foreground"><Spinner className="size-7"/>Cargando bloque…</div>;
    if (!block) return <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-start justify-center gap-4 p-6"><p className="text-sm text-destructive">No encontramos ese bloque.</p><Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topic.id)}`}/>} variant="outline"><ArrowLeftIcon/>Volver al tema</Button></div>;

    return <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6">
        <header className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-muted-foreground" title={`${topic.title} · ${block.blockNumber}`}>
                    <span className="text-foreground">{topic.title}</span><span className="px-1.5" aria-hidden="true">·</span>{block.blockNumber}
                </p>
                <TopicConnectionCount topicId={topic.id} mode="reading"/>
            </div>
            <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topic.id)}`}/>} variant="ghost" size="sm"><ArrowLeftIcon/>Volver</Button>
        </header>
        <div className="min-w-0">
            <article className="rounded-lg border bg-card px-4 py-3"><TopicBlockContent block={block}/></article>
            <TopicBlockTools topicId={topic.id} block={block} pageLayout initialHistoryOpen={searchParams.get("seccion") === "historial"}/>
        </div>
    </div>;
}
