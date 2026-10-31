"use client"

import {TopicFootnoteProvider} from "@/components/rich-text/topic-footnote-context";
import {useTopicRoute} from "@/components/topic-route-provider";

import {BackToTopicButton} from "@/components/back-to-topic-button";
import {cn} from "@/lib/utils";
import {useParams, useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {useRef} from "react";
import type {TopicBlockOutput} from "@cabildo-abierto/api";
import {useTopicBlocks} from "@/hooks/use-topic-blocks";
import {get} from "@/utils/react/fetch";
import {Spinner} from "@/components/ui/spinner";
import {TopicConnectionCount} from "@/components/topic-connection-count";
import {TopicBlockPageContent} from "@/components/topic-block-page-content";

export default function TopicBlockPage() {
    const topic = useTopicRoute();
    const id = topic.id;
    const {blockNumber} = useParams<{blockNumber: string}>();
    const searchParams = useSearchParams();
    const blocksQuery = useTopicBlocks(id);
    const blockQuery = useQuery({
        queryKey: ['topic', id, 'blocks', 'block', blockNumber],
        queryFn: async () => {
            const result = await get<TopicBlockOutput>(`/topics/${encodeURIComponent(id)}/blocks/${encodeURIComponent(blockNumber)}`);
            if ('error' in result) throw new Error(result.error);
            return result.value.block;
        },
    });
    const block = blockQuery.data;
    const initialBlock = useRef(block);
    if (!initialBlock.current && block) initialBlock.current = block;
    const error = blockQuery.error instanceof Error ? blockQuery.error.message : blocksQuery.error instanceof Error ? blocksQuery.error.message : null;

    if (error) return <div className="mx-auto max-w-2xl p-6 text-sm text-destructive">{error}</div>;
    if (blocksQuery.isPending || blockQuery.isPending) return <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-sm text-muted-foreground"><Spinner className="size-7"/>Cargando bloque…</div>;
    if (!initialBlock.current) return <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-start justify-center gap-4 p-6"><p className="text-sm text-destructive">No encontramos ese bloque.</p><BackToTopicButton href={`/tema/${encodeURIComponent(topic.slug)}`}/></div>;

    return <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[682px] flex-col gap-4 p-6">
        <header className={cn("flex flex-col items-start gap-4")}>
            <BackToTopicButton href={`/tema/${encodeURIComponent(topic.slug)}`}/>
            <div className={cn("w-full min-w-0")}>
                <p className="truncate text-sm font-medium text-muted-foreground" title={`${topic.title} · ${initialBlock.current.blockNumber}`}>
                    <span className="text-foreground">{topic.title}</span><span className="px-1.5" aria-hidden="true">·</span>{initialBlock.current.blockNumber}
                </p>
                <TopicConnectionCount topicId={topic.id} mode="reading"/>
            </div>
        </header>
        <TopicFootnoteProvider topicId={id} blocks={[...(blocksQuery.data?.blocks ?? []), ...(blocksQuery.data?.footnoteAttachments ?? [])]}><TopicBlockPageContent topicId={topic.id} initialBlock={initialBlock.current} latestBlock={block}
            initialHistoryOpen={searchParams.get("seccion") === "historial"}/></TopicFootnoteProvider>
    </div>;
}
