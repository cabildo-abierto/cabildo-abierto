"use client";

import {useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import type {DiscussionCommentsOutput} from "@cabildo-abierto/api";
import {DiscussionComments} from "@/components/discussion-comments";
import {get, post, del} from "@/utils/react/fetch";

export function DocumentBlockComments({documentId, blockId, versionId}: {documentId: string; blockId: string; versionId: string}) {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const path = `/documents/${documentId}/blocks/${blockId}/comments`;
    const queryKey = ['document-comments', documentId, blockId];
    const query = useQuery({queryKey, queryFn: async () => {
        const result = await get<DiscussionCommentsOutput>(path);
        if ("error" in result) throw new Error(result.error);
        return result.value;
    }});
    const refresh = async () => {
        await queryClient.invalidateQueries({queryKey});
        await queryClient.invalidateQueries({queryKey: ['document-version', versionId]});

    };
    return <DiscussionComments comments={query.data?.comments ?? null} loading={query.isLoading}
        error={error ?? query.error?.message ?? null} filteredVersion={null} rejectionVersion={null}
        conversationHref={`/documento/${versionId}#bloque-${blockId}`} pageLayout
        onShowAll={() => {}} onCancelRejection={() => {}}
        onPublish={async (content, replyToId) => {
            setError(null);
            const result = await post(path, {content, replyToId});
            if ("error" in result) { setError(result.error); return false; }
            await refresh(); return true;
        }}
        onDelete={async commentId => {
            setError(null);
            const result = await del(`${path}/${commentId}`);
            if ("error" in result) { setError(result.error); return false; }
            await refresh(); return true;
        }}/>
}
