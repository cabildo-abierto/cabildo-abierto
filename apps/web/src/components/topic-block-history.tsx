"use client"

import type {TopicBlock, TopicBlockVersion} from "@cabildo-abierto/api";
import Link from "next/link";
import {ChatCircleIcon, CheckIcon, GitDiffIcon, XIcon} from "@phosphor-icons/react";
import {useState} from "react";
import {useAuth} from "@/components/auth-provider";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {TopicBlockContent} from "@/components/topic-block-content";
import {formatTopicBlockDate} from "@/components/topic-block-date";
import {Spinner} from "@/components/ui/spinner";

export function TopicBlockHistory({topicId, block, versions, loading, error, selectedVersionId, addedCommentCounts, onPreview, onSelect, onAccept, onReject, onCancelReaction}: {
    topicId: string
    block: TopicBlock
    versions: TopicBlockVersion[] | null
    loading: boolean
    error: string | null
    selectedVersionId: string | null
    addedCommentCounts: ReadonlyMap<string, number>
    onPreview: (version: TopicBlockVersion | null) => void
    onSelect: (version: TopicBlockVersion) => void
    onAccept: (version: TopicBlockVersion) => void
    onReject: (version: TopicBlockVersion) => void
    onCancelReaction: (version: TopicBlockVersion, deleteReason: boolean) => void
}) {
    const {user} = useAuth();
    const [cancelVersion, setCancelVersion] = useState<TopicBlockVersion | null>(null);
    const requestCancel = (version: TopicBlockVersion) => {
        if (version.userReaction === "reject") setCancelVersion(version);
        else onCancelReaction(version, false);
    };
    return <section className="mt-4 mb-2 rounded-lg border bg-muted/20 p-3" aria-label={`Historial de ${block.blockNumber}`}>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <GitDiffIcon/>
            <span>Versiones de</span>
            <Link href={`/tema/${encodeURIComponent(topicId)}/bloque/${encodeURIComponent(block.blockNumber)}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground underline-offset-2 hover:underline">{block.blockNumber}</Link>
        </div>
        {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Spinner/>Cargando historial…</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {versions && <ol className="space-y-4 border-l pl-4">
            {versions.map((version, index) => {
                const commentCount = version.commentCount + (addedCommentCounts.get(version.id) ?? 0);
                const selected = selectedVersionId === version.id;
                return <li key={version.id} className="group/version relative"
                    onMouseEnter={() => onPreview(version)} onMouseLeave={() => onPreview(null)}
                    onFocus={() => onPreview(version)}
                    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onPreview(null); }}
                >
                    <span className={`absolute top-1.5 -left-[1.2rem] size-2 rounded-full transition-transform duration-150 group-hover/version:scale-120 ${version.rejected ? "bg-red-500" : "bg-green-500"}`} aria-label={version.rejected ? "Edición rechazada" : "Edición aceptada"}/>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-muted-foreground">@{version.author.username}</span>
                        <time dateTime={version.createdAt}>{formatTopicBlockDate(version.createdAt)}</time>
                        {version.current && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Actual</span>}
                        <Button type="button" variant="ghost" size="xs"
                            className="h-5 gap-1 px-1 text-[10px] aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-muted/70"
                            aria-pressed={selected}
                            aria-label={`${selected ? "Dejar de filtrar" : "Ver"} comentarios de esta versión (${commentCount})`}
                            onClick={() => onSelect(version)}>
                            <ChatCircleIcon className="size-3"/><span>{commentCount}</span>
                        </Button>
                        <span className="ml-auto inline-flex items-center gap-1">
                            <Button type="button" variant="ghost" size="sm" disabled={!user || user.id === version.author.id}
                                className={`h-6 gap-1 px-1 text-green-600 hover:bg-green-500/10 hover:text-green-700 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300 ${version.userReaction === "accept" ? "bg-green-500/15" : ""}`}
                                aria-pressed={version.userReaction === "accept"} aria-label={version.userReaction === "accept" ? `Cancelar voto de aceptación (${version.acceptCount})` : `Votar aceptación (${version.acceptCount})`} title={version.userReaction === "accept" ? "Cancelar voto de aceptación" : "Votar aceptación"}
                                onClick={() => version.userReaction === "accept" ? requestCancel(version) : onAccept(version)}>
                                <CheckIcon className="size-3"/><span>{version.acceptCount}</span>
                            </Button>
                            <Button type="button" variant="ghost" size="sm" disabled={!user || user.id === version.author.id}
                                className={`h-6 gap-1 px-1 text-red-600 hover:bg-red-500/10 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300 ${version.userReaction === "reject" ? "bg-red-500/15" : ""}`}
                                aria-pressed={version.userReaction === "reject"} aria-label={version.userReaction === "reject" ? `Cancelar voto de rechazo (${version.rejectCount})` : `Votar rechazo (${version.rejectCount})`} title={version.userReaction === "reject" ? "Cancelar voto de rechazo" : "Votar rechazo"}
                                onClick={() => version.userReaction === "reject" ? requestCancel(version) : onReject(version)}>
                                <XIcon className="size-3"/><span>{version.rejectCount}</span>
                            </Button>
                        </span>
                    </div>
                    {version.message && <div className="flex justify-start pb-1">
                        <div className={"rounded-md bg-muted px-2 py-0 text-[10px] font-medium leading-relaxed text-foreground whitespace-pre-wrap break-words"}>
                            {version.message}
                        </div>
                    </div>}
                    <TopicBlockContent block={version}/>
                </li>;
            })}
        </ol>}
        <AlertDialog open={Boolean(cancelVersion)} onOpenChange={open => { if (!open) setCancelVersion(null); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar rechazo</AlertDialogTitle>
                    <AlertDialogDescription>¿Querés borrar también la justificación o conservarla como comentario?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="w-full flex-col">
                    <AlertDialogCancel className="w-full" onClick={() => setCancelVersion(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="w-full" onClick={() => { if (cancelVersion) onCancelReaction(cancelVersion, false); setCancelVersion(null); }}>Conservar comentario</AlertDialogAction>
                    <AlertDialogAction className="w-full" variant="destructive" onClick={() => { if (cancelVersion) onCancelReaction(cancelVersion, true); setCancelVersion(null); }}>Borrar justificación</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </section>;
}
