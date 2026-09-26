"use client";

import type {TopicBlock} from "@cabildo-abierto/api";
import {DiscussionComments} from "@/components/discussion-comments";
import {useTopicRoute} from "@/components/topic-route-provider";
import type {useTopicBlockComments} from "@/hooks/use-topic-block-comments";
import {cn} from "@/lib/utils";

export function DocumentWindowComments({id, block, discussion, open}: {
    id: string; block: TopicBlock; discussion: ReturnType<typeof useTopicBlockComments>; open: boolean;
}) {
    const {slug} = useTopicRoute();
    const {commentsQuery, publishMutation, deleteMutation} = discussion;
    return <aside id={id} inert={!open} aria-hidden={!open} aria-label={block.typeId === "dataset" ? "Comentarios del conjunto de datos" : "Comentarios del documento"}
        className={cn("h-full w-80 shrink-0 overflow-y-auto rounded-xl border bg-background p-3 text-foreground shadow-2xl", !open && "hidden")}>
        <h2 className={cn("text-sm font-medium")}>Comentarios</h2>
        <DiscussionComments comments={commentsQuery.data ?? null} loading={commentsQuery.isPending}
            error={commentsQuery.error instanceof Error ? commentsQuery.error.message : null}
            filteredVersion={null} rejectionVersion={null} pageLayout
            conversationHref={`/tema/${encodeURIComponent(slug)}/bloque/${encodeURIComponent(block.blockNumber)}?seccion=comentarios`}
            onShowAll={() => {}} onCancelRejection={() => {}}
            onPublish={async (content, replyToId, blockVersionId = block.id, reject, replica) => {
                try { await publishMutation.mutateAsync({content, replyToId, blockVersionId, reject, replica}); return true; }
                catch { return false; }
            }}
            onDelete={commentId => deleteMutation.mutateAsync(commentId).then(() => true).catch(() => false)}/>
    </aside>;
}
