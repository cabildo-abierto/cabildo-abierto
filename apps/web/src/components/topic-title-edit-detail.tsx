"use client";

import {useId, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {TopicTitleEdit, DiscussionCommentsOutput} from "@cabildo-abierto/api";
import {ChatCircleIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {get} from "@/utils/react/fetch";
import {useTopicTitleEditActions} from "@/hooks/use-topic-title-edit-actions";
import {TopicTitleEditActions} from "@/components/topic-title-edit-actions";
import {DiscussionComments} from "@/components/discussion-comments";

export function TopicTitleEditDetail({edit, commentsOpen, onCommentsOpenChange}: {
    edit: TopicTitleEdit;
    commentsOpen: boolean;
    onCommentsOpenChange: (open: boolean) => void;
}) {
    const commentsId = useId();
    const [rejecting, setRejecting] = useState(false);
    const actions = useTopicTitleEditActions(edit);
    const comments = useQuery({
        enabled: commentsOpen,
        queryKey: ["topic-title-edit", edit.topic.id, edit.id, "comments"],
        queryFn: async () => {
            const result = await get<DiscussionCommentsOutput>(`/topics/${encodeURIComponent(edit.topic.id)}/title-edits/${encodeURIComponent(edit.id)}/comments`);
            if ("error" in result) throw new Error(result.error);
            return result.value.comments;
        },
    });
    return <div className="space-y-2">
        <div className="space-y-2">
            {edit.message && <div className="space-y-1">
                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">{edit.message}</p>
            </div>}
            <TopicTitleEditActions edit={edit} pending={actions.pending} onAccept={actions.accept} onCancelReaction={actions.cancelReaction}
                onDelete={actions.deleteEdit} onReject={() => { setRejecting(true); onCommentsOpenChange(true); }}>
                <Button variant="ghost" size="sm" className={cn("text-muted-foreground", commentsOpen && "bg-muted")}
                    aria-expanded={commentsOpen} aria-controls={commentsId}
                    aria-label={`${commentsOpen ? "Ocultar" : "Mostrar"} comentarios (${edit.commentCount})`}
                    onClick={() => onCommentsOpenChange(!commentsOpen)}>
                    <ChatCircleIcon/><span className="tabular-nums">{edit.commentCount}</span>
                </Button>
            </TopicTitleEditActions>
            {actions.error && <p role="alert" className="text-sm text-destructive">{actions.error}</p>}
        </div>
        <div id={commentsId} aria-hidden={!commentsOpen} inert={!commentsOpen}
            className={cn("grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none", commentsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
            <div className="min-h-0 overflow-hidden">
                <DiscussionComments comments={comments.data ?? null} loading={comments.isPending} error={comments.error?.message ?? null}
                    filteredVersion={null} rejectionVersion={rejecting ? edit : null} scope="title" readOnly={edit.status === "deleted"}
                    conversationHref={`/tema/${encodeURIComponent(edit.topic.slug)}/titulo#propuesta-${encodeURIComponent(edit.id)}`} pageLayout onShowAll={() => {}}
                    onCancelRejection={() => setRejecting(false)} onDelete={actions.deleteComment}
                    onPublish={async (content, replyToId, _rootId, reject, replica) => {
                        const success = await actions.publish({content, replyToId, reject, replica});
                        if (success) setRejecting(false);
                        return success;
                    }}/>
            </div>
        </div>
    </div>;
}
