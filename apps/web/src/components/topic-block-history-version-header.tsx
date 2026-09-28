"use client";

import type {TopicBlockVersion} from "@cabildo-abierto/api";
import {ChatCircleIcon, CheckIcon, DotsThreeIcon, TrashIcon, XIcon} from "@phosphor-icons/react";
import {useAuth} from "@/components/auth-provider";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {formatRelativeDate, formatTopicBlockDate} from "@/components/topic-block-date";
import {topicAuthorName} from "@/components/topic-author-name";
import {cn} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";

export function TopicBlockHistoryVersionHeader({version, selected, voting, pendingVote, onSelect, onAccept, onReject, onCancelReaction, onDelete}: {
    version: TopicBlockVersion;
    selected: boolean;
    voting: boolean;
    pendingVote: "accept" | "reject" | null;
    onSelect: (version: TopicBlockVersion) => void;
    onAccept: (version: TopicBlockVersion) => void;
    onReject: (version: TopicBlockVersion) => void;
    onCancelReaction: (version: TopicBlockVersion) => void;
    onDelete: (version: TopicBlockVersion) => void;
}) {
    const {user} = useAuth();
    const author = topicAuthorName(version.author, user?.id);
    const votes = [
        {type: "accept", label: "aceptación", count: version.acceptCount, Icon: CheckIcon, onVote: onAccept,
            className: "text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300", activeClassName: "bg-green-500/15"},
        {type: "reject", label: "rechazo", count: version.rejectCount, Icon: XIcon, onVote: onReject,
            className: "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300", activeClassName: "bg-red-500/15"},
    ] as const;

    return <div className={cn("@container mb-2 min-w-0 space-y-1.5 text-xs text-muted-foreground")}>
        <div className={cn("grid min-w-0 gap-1.5 @min-[30rem]:grid-cols-[minmax(0,1fr)_auto] @min-[30rem]:items-center @min-[30rem]:gap-x-3")}>
            <div className={cn("flex min-w-0 items-start gap-1")}>
                <div className={cn("flex min-w-0 flex-1 flex-col items-start gap-1")}>
                    <div className={cn("flex min-w-0 max-w-full items-center gap-1")}>
                        <span title={author} className={cn("min-w-0 truncate font-medium")}>{author}</span>
                        <span aria-hidden="true" className={cn("shrink-0")}>·</span>
                        <time dateTime={version.createdAt} title={formatTopicBlockDate(version.createdAt)}
                            className={cn("shrink-0 whitespace-nowrap tabular-nums")}>{formatRelativeDate(version.createdAt)}</time>
                    </div>
                    {version.current && <span className={cn("shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary")}>Versión actual</span>}
                </div>
                {user?.id === version.author.id && !version.deleted && <DropdownMenu>
                    <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Acciones de la edición"/>}><DotsThreeIcon/></DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className={cn("w-max min-w-32")}>
                        {/* <DropdownMenuItem className={cn("whitespace-nowrap")}><FlagIcon/>Reportar</DropdownMenuItem> */}
                        <DropdownMenuItem variant="destructive" className={cn("whitespace-nowrap")} onClick={() => onDelete(version)}><TrashIcon/>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>}
            </div>
            <div className={cn("flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1")}>
                <Button type="button" variant="ghost" size="sm"
                    className={cn("h-6 gap-1 px-1 text-[10px] tabular-nums aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-muted/70")}
                    aria-pressed={selected} aria-label={`${selected ? "Dejar de filtrar" : "Ver"} comentarios de esta versión (${version.commentCount})`}
                    onClick={() => onSelect(version)}><ChatCircleIcon className={cn("size-3")}/><span>{version.commentCount}</span></Button>
                <div className={cn("ml-auto flex shrink-0 items-center gap-1")}>
                    {votes.map(({type, label, count, Icon, onVote, className, activeClassName}) => {
                        const active = version.userReaction === type;
                        const action = active ? `Cancelar voto de ${label}` : `Votar ${label}`;
                        return <Button key={type} type="button" variant="ghost" size="sm" disabled={voting || !user || user.id === version.author.id}
                            className={cn("h-6 gap-1 px-1 tabular-nums disabled:opacity-50", className, active && activeClassName)}
                            aria-pressed={active} aria-busy={pendingVote === type} aria-label={`${action} (${count})`} title={action}
                            onClick={() => active ? onCancelReaction(version) : onVote(version)}>{pendingVote === type ? <Spinner className={cn("size-3")}/> : <Icon className={cn("size-3")}/>}<span>{count}</span></Button>;
                    })}
                </div>
            </div>
        </div>
        {version.replicatedRejectCount > 0 && <div className={cn("flex justify-end")}>
            <span className={cn("rounded-full bg-muted px-2 py-0.5 text-[10px]")}>{version.replicatedRejectCount} {version.replicatedRejectCount === 1 ? "rechazo replicado" : "rechazos replicados"}</span>
        </div>}
    </div>;
}
