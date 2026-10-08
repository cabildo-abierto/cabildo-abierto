"use client";

import {isAttachmentBlock} from '@cabildo-abierto/utils';

import {useTopicBlockComments} from "@/hooks/use-topic-block-comments";
import {useTopicRoute} from "@/components/topic-route-provider";

import {useId, useState, type MouseEvent, type ReactNode} from "react";
import Link from "next/link";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {CreateBlockCommentInput, CreateBlockReactionInput, TopicBlock, TopicBlockVersion, TopicBlockVersionsOutput, TopicBlocksOutput, TopicEditorDataOutput} from "@cabildo-abierto/api";
import {ChatCircleIcon, GitDiffIcon, TableIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockComments} from "@/components/topic-block-comments";
import {TopicBlockHistory} from "@/components/topic-block-history";
import {VisualizationSourcesPanel} from "@/components/visualizations/visualization-sources-panel";
import {VisualizationExpandButton} from '@/components/visualizations/visualization-expand-button';
import {TopicBlockPanel} from "@/components/topic-block-panel";
import {del, get, post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";
import {useToast} from "@/components/ui/toast";
import {notifyTopicLocalConvergence, topicDeleteVersionKey} from "@/hooks/use-topic-local-convergence";

export const topicBlockVersionsKey = (topicId: string, blockNumber: string) =>
    ["topic", topicId, "block", blockNumber, "versions"] as const;

export function TopicBlockTools({topicId, block, actions, buttonClassName, openInPage = false, pageLayout = false, initialHistoryOpen = false, commentsOpen: controlledCommentsOpen, onCommentsOpenChange, historyOpen: controlledHistoryOpen, onHistoryOpenChange, sourcesOpen: controlledSourcesOpen, onSourcesOpenChange, hideDiscussion = false, onSectionOpen}: {
    topicId: string;
    block: TopicBlock;
    actions?: ReactNode;
    buttonClassName?: string;
    openInPage?: boolean;
    pageLayout?: boolean;
    initialHistoryOpen?: boolean;
    commentsOpen?: boolean;
    onCommentsOpenChange?: (open: boolean) => void;
    historyOpen?: boolean;
    onHistoryOpenChange?: (open: boolean) => void;
    sourcesOpen?: boolean;
    onSourcesOpenChange?: (open: boolean) => void;
    hideDiscussion?: boolean;
    onSectionOpen?: (section: "comments" | "history" | "sources") => void;
}) {
    const sourcesId = useId();
    const attachmentTools = isAttachmentBlock(block.typeId) || block.typeId === "imagen";
    const visualization = block.typeId === "visualizacion";
    const [localSourcesOpen, setLocalSourcesOpen] = useState(false);
    const sourcesOpen = controlledSourcesOpen ?? localSourcesOpen;
    const setSourcesOpen = (open: boolean) => {
        if (controlledSourcesOpen === undefined) setLocalSourcesOpen(open);
        onSourcesOpenChange?.(open);
    };
    const {slug: topicSlug} = useTopicRoute();
    const [localCommentsOpen, setLocalCommentsOpen] = useState(pageLayout);
    const commentsOpen = controlledCommentsOpen ?? localCommentsOpen;
    const setCommentsOpen = (open: boolean) => {
        if (controlledCommentsOpen === undefined) setLocalCommentsOpen(open);
        onCommentsOpenChange?.(open);
    };
    const [localHistoryOpen, setLocalHistoryOpen] = useState(initialHistoryOpen);
    const historyOpen = controlledHistoryOpen ?? localHistoryOpen;
    const setHistoryOpen = (open: boolean) => {
        if (controlledHistoryOpen === undefined) setLocalHistoryOpen(open);
        onHistoryOpenChange?.(open);
    };
    const [selectedVersion, setSelectedVersion] = useState<TopicBlockVersion | null>(null);
    const [previewVersion, setPreviewVersion] = useState<TopicBlockVersion | null>(null);
    const [rejectionVersion, setRejectionVersion] = useState<TopicBlockVersion | null>(null);
    const [voting, setVoting] = useState<{versionId: string; type: "accept" | "reject"} | null>(null);
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const commentsKey = ["topic", topicId, "block", block.blockNumber, "comments"] as const;
    const versionsKey = topicBlockVersionsKey(topicId, block.blockNumber);
    const blocksKey = ["topic", topicId, "blocks"] as const;
    const {commentsQuery, publishMutation, deleteMutation, commentCount: loadedCommentCount} = useTopicBlockComments(topicId, block.blockNumber, commentsOpen && !hideDiscussion);
    const versionsQuery = useQuery({
        queryKey: versionsKey,
        queryFn: async () => {
            const result = await get<TopicBlockVersionsOutput>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions`);
            if ("error" in result) throw new Error(result.error);
            return result.value.versions;
        },
        enabled: historyOpen && !hideDiscussion,
    });
    const reactionMutation = useMutation({
        mutationFn: async ({version, input}: {version: TopicBlockVersion; input: CreateBlockReactionInput}) => {
            const result = await post<CreateBlockReactionInput, unknown>(
                `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions/${encodeURIComponent(version.id)}/reactions`, input,
            );
            if ("error" in result) throw new Error(result.error);
        },
        onMutate: ({version}) => setVoting({versionId: version.id, type: "accept"}),
        onSuccess: () => toast({title: "Se registró el voto"}),
        onError: error => toast({title: "No pudimos registrar el voto", description: error instanceof Error ? error.message : undefined, variant: "destructive"}),
        onSettled: async () => {
            try {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: versionsKey}),
                    queryClient.invalidateQueries({queryKey: blocksKey}),
                    queryClient.invalidateQueries({queryKey: commentsKey}),
                ]);
            } finally { setVoting(null); }
        },
    });
    const cancelReactionMutation = useMutation({
        mutationFn: async ({version, deleteReason}: {version: TopicBlockVersion; deleteReason: boolean}) => {
            const result = await del<unknown>(
                `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions/${encodeURIComponent(version.id)}/reactions`,
                {deleteReason},
            );
            if ("error" in result) throw new Error(result.error);
        },
        onMutate: ({version}) => setVoting({versionId: version.id, type: version.userReaction === "accept" ? "accept" : "reject"}),
        onSuccess: () => toast({title: "Se canceló el voto"}),
        onError: error => toast({title: "No pudimos cancelar el voto", description: error instanceof Error ? error.message : undefined, variant: "destructive"}),
        onSettled: async () => {
            try {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: versionsKey}),
                    queryClient.invalidateQueries({queryKey: commentsKey}),
                    queryClient.invalidateQueries({queryKey: blocksKey}),
                ]);
            } finally { setVoting(null); }
        },
    });
    const deleteVersionMutation = useMutation({
        mutationKey: topicDeleteVersionKey(topicId),
        mutationFn: async (version: TopicBlockVersion) => {
            const result = await del(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions/${encodeURIComponent(version.id)}`);
            if ("error" in result) throw new Error(result.error);
        },
        onSuccess: async () => {
            setSelectedVersion(null);
            setPreviewVersion(null);
            const result = await get<TopicEditorDataOutput>(`/topics/${encodeURIComponent(topicId)}/editor-data`);
            if ("error" in result) {
                toast({title: "La edición se eliminó, pero no pudimos actualizar el tema", description: result.error, variant: "destructive"});
            } else {
                await Promise.all([
                    queryClient.cancelQueries({queryKey: blocksKey, exact: true}),
                    queryClient.cancelQueries({queryKey: ["topic", topicId, "editor-data"], exact: true}),
                ]);
                const data = result.value;
                queryClient.setQueryData<TopicEditorDataOutput>(["topic", topicId, "editor-data"], data);
                queryClient.setQueryData<TopicBlocksOutput>(blocksKey, {
                    blocks: data.blocks.filter(block => !block.deleted),
                    deletedBlocks: data.blocks.filter(block => block.deleted),
                    blockTypes: data.blockTypes,
                });
                notifyTopicLocalConvergence(topicId, data.blocks);
            }
            void queryClient.invalidateQueries({queryKey: ["topic", topicId], refetchType: "all"});
        },
        onError: error => toast({
            title: "No pudimos eliminar la edición",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
        }),
    });
    const toggleComments = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !commentsOpen;
        if (nextOpen) onSectionOpen?.("comments");
        setCommentsOpen(nextOpen);
        if (!nextOpen) setRejectionVersion(null);
        setSelectedVersion(null);
        setPreviewVersion(null);
    };
    const toggleHistory = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !historyOpen;
        if (nextOpen) onSectionOpen?.("history");
        setHistoryOpen(nextOpen);
    };
    const selectVersion = (version: TopicBlockVersion) => {
        setRejectionVersion(null);
        setCommentsOpen(true);
        setPreviewVersion(null);
        setSelectedVersion(current => current?.id === version.id ? null : version);
    };
    const publish = async (content: string, replyToId?: string, blockVersionId = block.id, reject = false, replica = false): Promise<boolean> => {
        const input: CreateBlockCommentInput = {blockVersionId, replyToId, content, reject, replica};
        try { await publishMutation.mutateAsync(input); } catch { return false; }
        if (reject || replica) setRejectionVersion(null);
        setSelectedVersion(null);
        setPreviewVersion(null);
        return true;
    };
    const acceptVersion = (version: TopicBlockVersion, deleteReason?: boolean) => {
        if (voting) return;
        reactionMutation.mutate({version, input: {type: "accept", deleteReason}});
    };
    const rejectVersion = (version: TopicBlockVersion) => {
        setRejectionVersion(version);
        setSelectedVersion(version);
        setPreviewVersion(null);
        setCommentsOpen(true);
    };

    const comments = commentsQuery.data ?? null;
    const versions = versionsQuery.data ?? null;
    const commentsError = commentsQuery.error instanceof Error ? commentsQuery.error.message : null;
    const commentCount = loadedCommentCount ?? block.commentCount;
    const filteredVersion = previewVersion ?? selectedVersion;
    const commentsSection = !hideDiscussion && commentsOpen && <TopicBlockComments comments={comments} loading={commentsQuery.isPending} error={commentsError}
        filteredVersion={filteredVersion} pinnedVersionId={selectedVersion?.id} rejectionVersion={rejectionVersion}
        conversationHref={`/tema/${encodeURIComponent(topicSlug)}/bloque/${encodeURIComponent(block.blockNumber)}?seccion=comentarios`}
        pageLayout={pageLayout} onShowAll={() => { setSelectedVersion(null); setPreviewVersion(null); }} onPublish={publish}
        onCancelRejection={() => setRejectionVersion(null)}
        onDelete={commentId => deleteMutation.mutateAsync(commentId).then(() => true).catch(() => false)}/>;
    const historySection = !hideDiscussion && historyOpen && <TopicBlockHistory block={block} versions={versions} loading={versionsQuery.isPending} error={versionsQuery.error instanceof Error ? versionsQuery.error.message : null}
        selectedVersionId={selectedVersion?.id ?? null}
        onPreview={version => { if (commentsOpen) setPreviewVersion(version); }} onSelect={selectVersion}
        voting={voting} onAccept={acceptVersion} onReject={rejectVersion}
        onDelete={version => deleteVersionMutation.mutateAsync(version).then(() => true).catch(() => false)}
        onCancelReaction={(version, deleteReason) => {
            if (!voting) cancelReactionMutation.mutate({version, deleteReason});
        }}/>;
    const sourcesSection = visualization && sourcesOpen && <VisualizationSourcesPanel block={block} id={sourcesId}/>;
    const visualizationControls = visualization && <div className={cn("flex items-center justify-end gap-1")}>
        <Button type="button" variant="ghost" size="sm" className={cn("text-muted-foreground", sourcesOpen && "bg-muted")}
            aria-label={sourcesOpen ? "Ocultar conjuntos de datos" : "Ver conjuntos de datos"} aria-expanded={sourcesOpen}
            aria-controls={sourcesId} title="Conjuntos de datos" onClick={event => {
                event.stopPropagation();
                if (!sourcesOpen) onSectionOpen?.("sources");
                setSourcesOpen(!sourcesOpen);
            }}><TableIcon className={cn("size-4")}/></Button>
        <VisualizationExpandButton block={block}/>
        {actions}
    </div>;
    if (openInPage && !attachmentTools && !hideDiscussion) return <>{visualizationControls}<div className={cn("flex items-center justify-end gap-1", buttonClassName)} draggable={false} onDragStart={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
        <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topicSlug)}/bloque/${encodeURIComponent(block.blockNumber)}?seccion=comentarios`}/>} type="button" variant="ghost" size="sm"
            className="h-7 gap-1 px-1.5 text-xs text-muted-foreground" aria-label={`Ver comentarios (${commentCount})`} title="Comentarios">
            <ChatCircleIcon className="size-3.5"/>{commentCount > 0 && <span>{commentCount}</span>}
        </Button>
        <Button nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(topicSlug)}/bloque/${encodeURIComponent(block.blockNumber)}?seccion=historial`}/>} type="button" variant="ghost" size="sm"
            className="h-7 gap-1 px-1.5 text-xs text-muted-foreground" aria-label="Ver historial de versiones" title="Historial de versiones">
            <GitDiffIcon className="size-3.5"/>
        </Button>
        {!visualization && actions}
    </div><TopicBlockPanel sources={sourcesSection} history={null} comments={null} pageLayout={pageLayout}/></>;
    return <div className={cn(pageLayout ? "relative mt-4" : "")} draggable={false} onDragStart={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        {visualizationControls}
        {hideDiscussion && !visualization && actions && <div className={cn("flex items-center justify-end gap-1")}>{actions}</div>}
        {!hideDiscussion && <div className={cn(pageLayout ? "flex items-center gap-1" : attachmentTools ? "flex items-center justify-end gap-1" : "absolute top-2 left-full ml-5 flex items-center gap-1", buttonClassName)}>
            <Button type="button" variant="ghost" size="sm"
                className={cn(
                    "text-muted-foreground transition-opacity",
                    pageLayout || commentCount > 0 || attachmentTools
                        ? "opacity-100"
                        : "opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100",
                )}
                aria-label={commentsOpen ? "Cerrar comentarios" : `Ver comentarios (${commentCount})`}
                aria-expanded={commentsOpen} title="Comentarios" onClick={toggleComments}>
                <ChatCircleIcon className="size-4"/>{commentCount > 0 && <span>{commentCount}</span>}
            </Button>
            <Button type="button" variant="ghost" size="sm"
                className={cn("text-muted-foreground transition-opacity", pageLayout || attachmentTools ? "opacity-100" : "opacity-0 group-hover/block:opacity-100 group-focus-within/block:opacity-100")}
                aria-label={historyOpen ? "Cerrar historial de versiones" : "Ver historial de versiones"}
                aria-expanded={historyOpen} title="Historial de versiones" onClick={toggleHistory}>
                <GitDiffIcon className="size-4"/>
            </Button>
            {!visualization && actions}
        </div>}
        <TopicBlockPanel sources={sourcesSection} history={historySection} comments={commentsSection} pageLayout={pageLayout}/>
    </div>;
}
