"use client";

import {useEffect, useState} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";
import type {TopicTitleEditsOutput} from "@cabildo-abierto/api";
import {get} from "@/utils/react/fetch";
import {TopicTitleEditListItem} from "@/components/topic-title-edit-list-item";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

export function TopicTitleEditsList({topicId}: {topicId: string}) {
    const [openDiscussions, setOpenDiscussions] = useState<string[]>([]);
    const [targetId, setTargetId] = useState<string | null>(null);
    const query = useInfiniteQuery({
        queryKey: ["topic-title-edits", topicId],
        initialPageParam: null as string | null,
        queryFn: async ({pageParam}) => {
            const params = new URLSearchParams();
            if (pageParam) params.set("cursor", pageParam);
            const result = await get<TopicTitleEditsOutput>(`/topics/${encodeURIComponent(topicId)}/title-edits?${params}`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
        getNextPageParam: page => page.nextCursor,
        refetchInterval: 30_000,
    });
    const edits = query.data?.pages.flatMap(page => page.edits) ?? [];
    const targetLoaded = edits.some(edit => `propuesta-${edit.id}` === targetId);
    useEffect(() => {
        const readTarget = () => setTargetId(window.location.hash.slice(1) || null);
        readTarget();
        window.addEventListener("hashchange", readTarget);
        return () => window.removeEventListener("hashchange", readTarget);
    }, []);
    useEffect(() => {
        if (!targetId) return;
        if (targetLoaded) {
            setOpenDiscussions(current => current.includes(targetId) ? current : [...current, targetId]);
            document.getElementById(targetId)?.scrollIntoView({block: "start"});
            setTargetId(null);
        } else if (query.hasNextPage && !query.isFetching && !query.isError) {
            void query.fetchNextPage();
        }
    }, [targetId, targetLoaded, query.hasNextPage, query.isFetching, query.isError, query.fetchNextPage]);
    return <div className="space-y-6">
        {query.isPending && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner/>Cargando títulos…</p>}
        {query.error && <p role="alert" className="text-sm text-destructive">{query.error.message}</p>}
        {!query.isPending && !query.error && !edits.length && <p className="text-sm text-muted-foreground">Todavía no hay títulos propuestos para este tema.</p>}
        <ol className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:rounded-full before:bg-border">
            {edits.map(edit => <TopicTitleEditListItem key={edit.id} edit={edit}
                commentsOpen={openDiscussions.includes(`propuesta-${edit.id}`)}
                onCommentsOpenChange={open => setOpenDiscussions(current => {
                    const id = `propuesta-${edit.id}`;
                    return open ? current.includes(id) ? current : [...current, id] : current.filter(value => value !== id);
                })}/>)}
        </ol>
        {query.hasNextPage && <Button variant="outline" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? "Cargando…" : "Ver más"}</Button>}
    </div>;
}
