"use client"

import {useTopicRoute} from "@/components/topic-route-provider";

import Link from "next/link";
import {useParams, useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {useRef} from "react";
import type {TopicBlocksOutput} from "@cabildo-abierto/api";
import {ArrowLeftIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {get} from "@/utils/react/fetch";
import {Spinner} from "@/components/ui/spinner";
import {TopicConnectionCount} from "@/components/topic-connection-count";
import {TopicBlockPageContent} from "@/components/topic-block-page-content";

export default function TopicBlockPage() {
    const topic = useTopicRoute();
    const id = topic.id;
    const {blockNumber} = useParams<{blockNumber: string}>();
    const searchParams = useSearchParams();
    const blocksQuery = useQuery({
        queryKey: ["topic", id, "blocks"],
        queryFn: async () => {
            const result = await get<TopicBlocksOutput>(`/topics/${encodeURIComponent(id)}/blocks`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
    });
    const block = blocksQuery.data?.blocks.find(candidate => candidate.blockNumber === blockNumber)
        ?? blocksQuery.data?.deletedBlocks.find(candidate => candidate.blockNumber === blockNumber);
    const initialBlock = useRef(block);
    if (!initialBlock.current && block) initialBlock.current = block;
    const error = blocksQuery.error instanceof Error ? blocksQuery.error.message : null;

    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (blocksQuery.isPending) return <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-sm text-muted-foreground"><Spinner className="size-7"/>Cargando bloque…</div>;
    if (!initialBlock.current) return <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-start justify-center gap-4 p-6"><p className="text-sm text-destructive">No encontramos ese bloque.</p><Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topic.slug)}`}/>} variant="outline"><ArrowLeftIcon/>Volver al tema</Button></div>;

    return <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6">
        <header className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-muted-foreground" title={`${topic.title} · ${initialBlock.current.blockNumber}`}>
                    <span className="text-foreground">{topic.title}</span><span className="px-1.5" aria-hidden="true">·</span>{initialBlock.current.blockNumber}
                </p>
                <TopicConnectionCount topicId={topic.id} mode="reading"/>
            </div>
            <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topic.slug)}`}/>} variant="ghost" size="sm"><ArrowLeftIcon/>Volver</Button>
        </header>
        <TopicBlockPageContent topicId={topic.id} initialBlock={initialBlock.current} latestBlock={block}
            initialHistoryOpen={searchParams.get("seccion") === "historial"}/>
    </div>;
}
