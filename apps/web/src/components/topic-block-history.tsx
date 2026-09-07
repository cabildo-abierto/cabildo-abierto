"use client"

import {useState, type MouseEvent} from "react";
import type {TopicBlock, TopicBlockVersion, TopicBlockVersionsOutput} from "@cabildo-abierto/api";
import {GitDiffIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockContent} from "@/components/topic-block-content";
import {get} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
});

export function TopicBlockHistory({topicId, block, buttonClassName}: {topicId: string; block: TopicBlock; buttonClassName?: string}) {
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState<TopicBlockVersion[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const nextOpen = !open;
        setOpen(nextOpen);
        if (!nextOpen || versions || loading) return;

        setLoading(true);
        setError(null);
        const result = await get<TopicBlockVersionsOutput>(
            `/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}/versions`,
        );
        setLoading(false);
        if ("error" in result) {
            setError(result.error);
            return;
        }
        setVersions(result.value.versions);
    };

    return <div onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
                "absolute top-2 left-full ml-3 cursor-pointer text-muted-foreground opacity-0 transition-opacity group-hover/block:opacity-100 group-focus-within/block:opacity-100",
                buttonClassName,
            )}
            aria-label={open ? "Cerrar historial de versiones" : "Ver historial de versiones"}
            aria-expanded={open}
            title="Historial de versiones"
            onClick={event => void toggle(event)}
        >
            <GitDiffIcon className="size-4"/>
        </Button>

        {open && <section className="mt-4 rounded-lg border bg-muted/20 p-3" aria-label={`Historial de ${block.blockNumber}`}>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <GitDiffIcon/>
                <span>Versiones de</span>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{block.blockNumber}</span>
            </div>
            {loading && <p className="text-xs text-muted-foreground">Cargando historial…</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            {versions && <ol className="space-y-4 border-l pl-4">
                {versions.map((version, index) => <li key={version.id} className="relative space-y-2">
                    <span className="absolute top-1.5 -left-[1.2rem] size-2 rounded-full bg-border" aria-hidden="true"/>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">@{version.author.username}</span>
                        <time dateTime={version.createdAt}>{dateFormatter.format(new Date(version.createdAt))}</time>
                        {index === 0 && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Actual</span>}
                    </div>
                    <TopicBlockContent block={version}/>
                </li>)}
            </ol>}
        </section>}
    </div>;
}
