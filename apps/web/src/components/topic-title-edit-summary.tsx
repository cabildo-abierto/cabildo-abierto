import type {TopicTitleEdit} from "@cabildo-abierto/api";
import {formatRelativeDate, formatTopicBlockDate} from "@/components/topic-block-date";
export function TopicTitleEditSummary({edit}: {edit: TopicTitleEdit}) {
    return <header className="min-w-0 space-y-2 pr-8">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="min-w-0 space-y-0.5">
                <h2 className="break-words text-sm font-semibold">{edit.title}</h2>
                <span className="flex items-start gap-1 text-xs font-normal text-muted-foreground">
                    <span className="min-w-0 break-all">{edit.slug}</span>
                </span>
            </div>
            {edit.status === "current" && <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">Título vigente</span>}
        </div>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-muted-foreground">
            <span className="break-all">@{edit.author.username}</span>
            <time dateTime={edit.createdAt} title={formatTopicBlockDate(edit.createdAt)}>Hace {formatRelativeDate(edit.createdAt)}</time>
        </span>
    </header>;
}
