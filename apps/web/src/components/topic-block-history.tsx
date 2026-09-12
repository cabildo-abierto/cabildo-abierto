"use client"

import type {TopicBlock, TopicBlockVersion} from "@cabildo-abierto/api";
import {ChatCircleIcon, GitDiffIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockContent} from "@/components/topic-block-content";
import {formatTopicBlockDate} from "@/components/topic-block-date";
import {Spinner} from "@/components/ui/spinner";

export function TopicBlockHistory({block, versions, loading, error, selectedVersionId, addedCommentCounts, onPreview, onSelect}: {
    block: TopicBlock
    versions: TopicBlockVersion[] | null
    loading: boolean
    error: string | null
    selectedVersionId: string | null
    addedCommentCounts: ReadonlyMap<string, number>
    onPreview: (version: TopicBlockVersion | null) => void
    onSelect: (version: TopicBlockVersion) => void
}) {
    return <section className="mt-4 mb-2 rounded-lg border bg-muted/20 p-3" aria-label={`Historial de ${block.blockNumber}`}>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <GitDiffIcon/>
            <span>Versiones de</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{block.blockNumber}</span>
        </div>
        {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Spinner/>Cargando historial…</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {versions && <ol className="space-y-4 border-l pl-4">
            {versions.map((version, index) => {
                const commentCount = version.commentCount + (addedCommentCounts.get(version.id) ?? 0);
                const selected = selectedVersionId === version.id;
                return <li key={version.id} className="relative space-y-2"
                    onMouseEnter={() => onPreview(version)} onMouseLeave={() => onPreview(null)}
                    onFocus={() => onPreview(version)}
                    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onPreview(null); }}>
                    <span className="absolute top-1.5 -left-[1.2rem] size-2 rounded-full bg-border" aria-hidden="true"/>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-muted-foreground">@{version.author.username}</span>
                        <time dateTime={version.createdAt}>{formatTopicBlockDate(version.createdAt)}</time>
                        {index === 0 && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Actual</span>}
                        <Button type="button" variant="ghost" size="xs"
                            className="h-5 gap-1 px-1 text-[10px] aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-muted/70"
                            aria-pressed={selected}
                            aria-label={`${selected ? "Dejar de filtrar" : "Ver"} comentarios de esta versión (${commentCount})`}
                            onClick={() => onSelect(version)}>
                            <ChatCircleIcon className="size-3"/><span>{commentCount}</span>
                        </Button>
                    </div>
                    {version.message && <p className="text-sm text-foreground">{version.message}</p>}
                    <TopicBlockContent block={version}/>
                </li>;
            })}
        </ol>}
    </section>;
}
