"use client"

import {useState, type MouseEvent} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {BlockComment, BlockCommentsOutput, CreateBlockCommentInput, CreateBlockCommentOutput, TopicBlock, TopicBlockVersion, TopicBlockVersionsOutput} from "@cabildo-abierto/api";
import {ChatCircleIcon, GitDiffIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockComments} from "@/components/topic-block-comments";
import {TopicBlockHistory} from "@/components/topic-block-history";
import {del, get, post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";

export const topicBlockVersionsKey = (topicId: string, blockNumber: string) =>
    ["topic", topicId, "block", blockNumber, "versions"] as const;

export function TopicBlockTools({topicId, block, buttonClassName, commentsOpen: controlledCommentsOpen, onCommentsOpenChange}: {
    topicId: string;
    block: TopicBlock;
    buttonClassName?: string;
    commentsOpen?: boolean;
    onCommentsOpenChange?: (open: boolean) => void;
}) {
    const [localCommentsOpen, setLocalCommentsOpen] = useState(false);
    const commentsOpen = controlledCommentsOpen ?? localCommentsOpen;
    const setCommentsOpen = (open: boolean) => {
        if (controlledCommentsOpen === undefined) setLocalCommentsOpen(open);
        onCommentsOpenChange?.(open);
    };
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<TopicBlockVersion | null>(null);
    const [previewVersion, setPreviewVersion] = useState<TopicBlockVersion | null>(null);
    const [addedCommentCounts, setAddedCommentCounts] = useState<ReadonlyMap<string, number>>(new Map());
    const [addedCommentTotal, setAddedCommentTotal] = useState(0);
    const queryClient = useQueryClient();
    const commentsKey = ["topic", topicId, "block", block.blockNumber, "comments"] as const;
    const versionsKey = topicBlockVersionsKey(topicId, block.blockNumber);
    const commentsQuery = useQuery({
        queryKey: commentsKey,
        queryFn: async () => {
            const result = await get<BlockCommentsOutput>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/comments`);
            if ("error" in result) throw new Error(result.error);
            return result.value.comments;
        },
        enabled: commentsOpen,
    });
    const versionsQuery = useQuery({
        queryKey: versionsKey,
        queryFn: async () => {
            const result = await get<TopicBlockVersionsOutput>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions`);
            if ("error" in result) throw new Error(result.error);
            return result.value.versions;
        },
        enabled: historyOpen,
    });
    const publishMutation = useMutation({
        mutationFn: async (input: CreateBlockCommentInput) => {
            const result = await post<CreateBlockCommentInput, CreateBlockCommentOutput>(
                `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/comments`, input,
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
            if (!input.replyToId) {
                setAddedCommentTotal(current => current + 1);
                setAddedCommentCounts(current => {
                    const next = new Map(current);
                    next.set(block.id, (next.get(block.id) ?? 0) + 1);
                    return next;
                });
            }
        },
    });
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const result = await del(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/comments/${encodeURIComponent(commentId)}`);
            if ("error" in result) throw new Error(result.error);
            return commentId;
        },
        onSuccess: commentId => {
            queryClient.setQueryData<BlockComment[]>(commentsKey, current => current?.map(comment =>
                comment.id === commentId ? {...comment, deleted: true} : comment));
        },
    });
    const toggleComments = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !commentsOpen;
        setCommentsOpen(nextOpen);
        setSelectedVersion(null);
        setPreviewVersion(null);
    };
    const toggleHistory = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !historyOpen;
        setHistoryOpen(nextOpen);
    };
    const selectVersion = (version: TopicBlockVersion) => {
        setCommentsOpen(true);
        setPreviewVersion(null);
        setSelectedVersion(current => current?.id === version.id ? null : version);
    };
    const publish = async (content: string, replyToId?: string): Promise<boolean> => {
        const input: CreateBlockCommentInput = {blockVersionId: block.id, replyToId, content};
        try { await publishMutation.mutateAsync(input); } catch { return false; }
        setSelectedVersion(null);
        setPreviewVersion(null);
        return true;
    };

    const comments = commentsQuery.data ?? null;
    const versions = versionsQuery.data ?? null;
    const commentsError = commentsQuery.error instanceof Error ? commentsQuery.error.message : publishMutation.error instanceof Error ? publishMutation.error.message : deleteMutation.error instanceof Error ? deleteMutation.error.message : null;
    const commentCount = block.commentCount + addedCommentTotal;
    const filteredVersion = previewVersion ?? selectedVersion;
    return <div draggable={false} onDragStart={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        <div className={cn("absolute top-2 left-full ml-5 flex items-center gap-1", buttonClassName)}>
            <Button type="button" variant="ghost" size="sm"
                className={cn(
                    "text-muted-foreground transition-opacity",
                    commentCount > 0
                        ? "opacity-100"
                        : "opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100",
                )}
                aria-label={commentsOpen ? "Cerrar comentarios" : `Ver comentarios (${commentCount})`}
                aria-expanded={commentsOpen} title="Comentarios" onClick={toggleComments}>
                <ChatCircleIcon className="size-4"/>{commentCount > 0 && <span>{commentCount}</span>}
            </Button>
            <Button type="button" variant="ghost" size="sm"
                className="text-muted-foreground opacity-0 transition-opacity group-hover/block:opacity-100 group-focus-within/block:opacity-100"
                aria-label={historyOpen ? "Cerrar historial de versiones" : "Ver historial de versiones"}
                aria-expanded={historyOpen} title="Historial de versiones" onClick={toggleHistory}>
                <GitDiffIcon className="size-4"/>
            </Button>
        </div>
        {commentsOpen && <TopicBlockComments comments={comments} loading={commentsQuery.isPending} error={commentsError}
            filteredVersion={filteredVersion} onShowAll={() => { setSelectedVersion(null); setPreviewVersion(null); }} onPublish={publish}
            onDelete={commentId => deleteMutation.mutateAsync(commentId).then(() => true).catch(() => false)}/>} 
        {historyOpen && <TopicBlockHistory block={block} versions={versions} loading={versionsQuery.isPending} error={versionsQuery.error instanceof Error ? versionsQuery.error.message : null}
            selectedVersionId={selectedVersion?.id ?? null} addedCommentCounts={addedCommentCounts}
            onPreview={version => { if (commentsOpen) setPreviewVersion(version); }} onSelect={selectVersion}/>}
    </div>;
}
