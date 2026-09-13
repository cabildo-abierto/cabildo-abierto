"use client"

import {useState, type MouseEvent} from "react";
import Link from "next/link";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {BlockComment, BlockCommentsOutput, CreateBlockCommentInput, CreateBlockCommentOutput, CreateBlockReactionInput, TopicBlock, TopicBlockVersion, TopicBlockVersionsOutput} from "@cabildo-abierto/api";
import {ChatCircleIcon, GitDiffIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockComments} from "@/components/topic-block-comments";
import {TopicBlockHistory} from "@/components/topic-block-history";
import {del, get, post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";
import {useToast} from "@/components/ui/toast";

export const topicBlockVersionsKey = (topicId: string, blockNumber: string) =>
    ["topic", topicId, "block", blockNumber, "versions"] as const;

export function TopicBlockTools({topicId, block, buttonClassName, openInPage = false, pageLayout = false, initialHistoryOpen = false, commentsOpen: controlledCommentsOpen, onCommentsOpenChange}: {
    topicId: string;
    block: TopicBlock;
    buttonClassName?: string;
    openInPage?: boolean;
    pageLayout?: boolean;
    initialHistoryOpen?: boolean;
    commentsOpen?: boolean;
    onCommentsOpenChange?: (open: boolean) => void;
}) {
    const [localCommentsOpen, setLocalCommentsOpen] = useState(pageLayout);
    const commentsOpen = controlledCommentsOpen ?? localCommentsOpen;
    const setCommentsOpen = (open: boolean) => {
        if (controlledCommentsOpen === undefined) setLocalCommentsOpen(open);
        onCommentsOpenChange?.(open);
    };
    const [historyOpen, setHistoryOpen] = useState(initialHistoryOpen);
    const [selectedVersion, setSelectedVersion] = useState<TopicBlockVersion | null>(null);
    const [previewVersion, setPreviewVersion] = useState<TopicBlockVersion | null>(null);
    const [rejectionVersion, setRejectionVersion] = useState<TopicBlockVersion | null>(null);
    const {toast} = useToast();
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
                    next.set(input.blockVersionId, (next.get(input.blockVersionId) ?? 0) + 1);
                    return next;
                });
            }
            if (input.reject) {
                setRejectionVersion(null);
                void queryClient.invalidateQueries({queryKey: versionsKey});
            }
        },
    });
    const reactionMutation = useMutation({
        mutationFn: async ({version, input}: {version: TopicBlockVersion; input: CreateBlockReactionInput}) => {
            const result = await post<CreateBlockReactionInput, unknown>(
                `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions/${encodeURIComponent(version.id)}/reactions`, input,
            );
            if ("error" in result) throw new Error(result.error);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: versionsKey});
        },
        onError: error => toast({title: "No pudimos registrar el voto", description: error instanceof Error ? error.message : undefined, variant: "destructive"}),
    });
    const cancelReactionMutation = useMutation({
        mutationFn: async ({version, deleteReason}: {version: TopicBlockVersion; deleteReason: boolean}) => {
            const result = await del<unknown>(
                `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions/${encodeURIComponent(version.id)}/reactions`,
                {deleteReason},
            );
            if ("error" in result) throw new Error(result.error);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: versionsKey});
            void queryClient.invalidateQueries({queryKey: commentsKey});
        },
        onError: error => toast({title: "No pudimos cancelar el voto", description: error instanceof Error ? error.message : undefined, variant: "destructive"}),
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
            void queryClient.invalidateQueries({queryKey: commentsKey});
            void queryClient.invalidateQueries({queryKey: versionsKey});
        },
    });
    const toggleComments = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !commentsOpen;
        setCommentsOpen(nextOpen);
        if (!nextOpen) setRejectionVersion(null);
        setSelectedVersion(null);
        setPreviewVersion(null);
    };
    const toggleHistory = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !historyOpen;
        setHistoryOpen(nextOpen);
    };
    const selectVersion = (version: TopicBlockVersion) => {
        setRejectionVersion(null);
        setCommentsOpen(true);
        setPreviewVersion(null);
        setSelectedVersion(current => current?.id === version.id ? null : version);
    };
    const publish = async (content: string, replyToId?: string, blockVersionId = block.id, reject = false): Promise<boolean> => {
        const input: CreateBlockCommentInput = {blockVersionId, replyToId, content, reject};
        try { await publishMutation.mutateAsync(input); } catch { return false; }
        setSelectedVersion(null);
        setPreviewVersion(null);
        return true;
    };
    const acceptVersion = (version: TopicBlockVersion) => {
        reactionMutation.mutate({version, input: {type: "accept"}});
    };
    const rejectVersion = (version: TopicBlockVersion) => {
        setRejectionVersion(version);
        setSelectedVersion(version);
        setPreviewVersion(null);
        setCommentsOpen(true);
    };

    const comments = commentsQuery.data ?? null;
    const versions = versionsQuery.data ?? null;
    const commentsError = commentsQuery.error instanceof Error ? commentsQuery.error.message : publishMutation.error instanceof Error ? publishMutation.error.message : deleteMutation.error instanceof Error ? deleteMutation.error.message : null;
    const commentCount = block.commentCount + addedCommentTotal;
    const filteredVersion = previewVersion ?? selectedVersion;
    const commentsSection = commentsOpen && <TopicBlockComments comments={comments} loading={commentsQuery.isPending} error={commentsError}
        filteredVersion={filteredVersion} pinnedVersionId={selectedVersion?.id} rejectionVersion={rejectionVersion} pageLayout={pageLayout} onShowAll={() => { setSelectedVersion(null); setPreviewVersion(null); }} onPublish={publish}
        onCancelRejection={() => setRejectionVersion(null)}
        onDelete={commentId => deleteMutation.mutateAsync(commentId).then(() => true).catch(() => false)}/>;
    const historySection = historyOpen && <TopicBlockHistory topicId={topicId} block={block} versions={versions} loading={versionsQuery.isPending} error={versionsQuery.error instanceof Error ? versionsQuery.error.message : null}
        selectedVersionId={selectedVersion?.id ?? null} addedCommentCounts={addedCommentCounts}
        onPreview={version => { if (commentsOpen) setPreviewVersion(version); }} onSelect={selectVersion}
        onAccept={acceptVersion} onReject={rejectVersion}
        onCancelReaction={(version, deleteReason) => cancelReactionMutation.mutate({version, deleteReason})}/>;
    if (openInPage) return <div className={cn("flex items-center justify-end gap-1 md:absolute md:top-2 md:left-full md:ml-5", buttonClassName)} draggable={false} onDragStart={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
        <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topicId)}/bloque/${encodeURIComponent(block.blockNumber)}?seccion=comentarios`}/>} type="button" variant="ghost" size="sm"
            className="h-7 gap-1 px-1.5 text-xs text-muted-foreground" aria-label={`Ver comentarios (${commentCount})`} title="Comentarios">
            <ChatCircleIcon className="size-3.5"/>{commentCount > 0 && <span>{commentCount}</span>}
        </Button>
        <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topicId)}/bloque/${encodeURIComponent(block.blockNumber)}?seccion=historial`}/>} type="button" variant="ghost" size="sm"
            className="h-7 gap-1 px-1.5 text-xs text-muted-foreground" aria-label="Ver historial de versiones" title="Historial de versiones">
            <GitDiffIcon className="size-3.5"/>
        </Button>
    </div>;
    return <div className={cn(pageLayout ? "relative mt-4" : "")} draggable={false} onDragStart={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        <div className={cn(pageLayout ? "flex items-center gap-1" : "absolute top-2 left-full ml-5 flex items-center gap-1", buttonClassName)}>
            <Button type="button" variant="ghost" size="sm"
                className={cn(
                    "text-muted-foreground transition-opacity",
                    pageLayout || commentCount > 0
                        ? "opacity-100"
                        : "opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100",
                )}
                aria-label={commentsOpen ? "Cerrar comentarios" : `Ver comentarios (${commentCount})`}
                aria-expanded={commentsOpen} title="Comentarios" onClick={toggleComments}>
                <ChatCircleIcon className="size-4"/>{commentCount > 0 && <span>{commentCount}</span>}
            </Button>
            <Button type="button" variant="ghost" size="sm"
                className={cn("text-muted-foreground transition-opacity", pageLayout ? "opacity-100" : "opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100")}
                aria-label={historyOpen ? "Cerrar historial de versiones" : "Ver historial de versiones"}
                aria-expanded={historyOpen} title="Historial de versiones" onClick={toggleHistory}>
                <GitDiffIcon className="size-4"/>
            </Button>
        </div>
        {pageLayout ? <>{historySection}{commentsSection}</> : <>{commentsSection}{historySection}</>}
    </div>;
}
