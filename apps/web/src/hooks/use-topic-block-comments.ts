"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {BlockComment, BlockCommentsOutput, CreateBlockCommentInput, CreateBlockCommentOutput} from "@cabildo-abierto/api";
import {useToast} from "@/components/ui/toast";
import {del, get, post} from "@/utils/react/fetch";

export function useTopicBlockComments(topicId: string, blockNumber: string, enabled = true) {
    const queryClient = useQueryClient();
    const {toast} = useToast();
    const commentsKey = ["topic", topicId, "block", blockNumber, "comments"] as const;
    const versionsKey = ["topic", topicId, "block", blockNumber, "versions"] as const;
    const blocksKey = ["topic", topicId, "blocks"] as const;
    const commentsQuery = useQuery({
        queryKey: commentsKey,
        queryFn: async () => {
            const result = await get<BlockCommentsOutput>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(blockNumber)}/comments`);
            if ("error" in result) throw new Error(result.error);
            return result.value.comments;
        },
        enabled,
    });
    const publishMutation = useMutation({
        mutationFn: async (input: CreateBlockCommentInput) => {
            const result = await post<CreateBlockCommentInput, CreateBlockCommentOutput>(
                `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(blockNumber)}/comments`, input,
            );
            if ("error" in result) throw new Error(result.error);
            return result.value.comment;
        },
        onSuccess: (comment, input) => {
            queryClient.setQueryData<BlockComment[]>(commentsKey, current => {
                const next = (current ?? []).map(existing => existing.id === input.replyToId
                    ? {...existing, directReplyCount: existing.directReplyCount + 1}
                    : existing);
                return [comment, ...next];
            });
            void queryClient.invalidateQueries({queryKey: versionsKey});
            void queryClient.invalidateQueries({queryKey: blocksKey});
            if (input.reject || input.replica) {
                void queryClient.invalidateQueries({queryKey: commentsKey});
            }
        },
        onError: (error, input) => toast({
            title: input.replica
                ? "No pudimos publicar la réplica"
                : input.reject
                    ? "No pudimos publicar el rechazo"
                    : "No pudimos publicar el comentario",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
        }),
    });
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const result = await del(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(blockNumber)}/comments/${encodeURIComponent(commentId)}`);
            if ("error" in result) throw new Error(result.error);
            return commentId;
        },
        onSuccess: commentId => {
            queryClient.setQueryData<BlockComment[]>(commentsKey, current => current?.map(comment =>
                comment.id === commentId ? {...comment, deleted: true} : comment));
            void queryClient.invalidateQueries({queryKey: commentsKey});
            void queryClient.invalidateQueries({queryKey: versionsKey});
            void queryClient.invalidateQueries({queryKey: blocksKey});
        },
        onError: error => toast({
            title: "No pudimos eliminar el comentario",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
        }),
    });
    const commentCount = commentsQuery.data?.filter(comment => !comment.deleted && comment.replyToId === comment.rootId).length;
    return {commentsQuery, publishMutation, deleteMutation, commentCount};
}
