import type {TopicTitleEdit} from "@cabildo-abierto/api";
import {TopicTitleEditDetail} from "@/components/topic-title-edit-detail";
import {TopicTitleEditSummary} from "@/components/topic-title-edit-summary";
import {cn} from "@/lib/utils";

export function TopicTitleEditListItem({edit, commentsOpen, onCommentsOpenChange}: {
    edit: TopicTitleEdit;
    commentsOpen: boolean;
    onCommentsOpenChange: (open: boolean) => void;
}) {
    return <li id={`propuesta-${edit.id}`} className="relative scroll-mt-20 space-y-3">
        <span aria-hidden="true" className="absolute top-0.5 -left-6 flex size-4 items-center justify-center rounded-full border-2 border-border bg-background">
            <span className={cn("size-2 rounded-full", edit.status === "rejected" ? "bg-red-500/65" : edit.status === "deleted" ? "bg-muted-foreground" : "bg-green-500/65")}/>
        </span>
        <TopicTitleEditSummary edit={edit}/>
        <TopicTitleEditDetail edit={edit} commentsOpen={commentsOpen} onCommentsOpenChange={onCommentsOpenChange}/>
    </li>;
}
