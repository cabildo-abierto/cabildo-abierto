"use client"

import {useTopicRoute} from "@/components/topic-route-provider";

import type {TopicBlock, TopicBlockVersion} from "@cabildo-abierto/api";
import Link from "next/link";
import {GitDiffIcon, TrashIcon} from "@phosphor-icons/react";
import {useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {TopicBlockContent} from "@/components/topic-block-content";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {TopicBlockHistoryVersionHeader} from "@/components/topic-block-history-version-header";

export function TopicBlockHistory({
                                      block,
                                      versions,
                                      loading,
                                      error,
                                      selectedVersionId,
                                      voting,
                                      onPreview,
                                      onSelect,
                                      onAccept,
                                      onReject,
                                      onDelete,
                                      onCancelReaction
                                  }: {
    block: TopicBlock
    versions: TopicBlockVersion[] | null
    loading: boolean
    error: string | null
    selectedVersionId: string | null
    voting: {versionId: string; type: "accept" | "reject"} | null
    onPreview: (version: TopicBlockVersion | null) => void
    onSelect: (version: TopicBlockVersion) => void
    onAccept: (version: TopicBlockVersion, deleteReason?: boolean) => void
    onReject: (version: TopicBlockVersion) => void
    onDelete: (version: TopicBlockVersion) => Promise<boolean>
    onCancelReaction: (version: TopicBlockVersion, deleteReason: boolean) => void
}) {
    const {slug: topicSlug} = useTopicRoute();
    const [reasonDialog, setReasonDialog] = useState<{version: TopicBlockVersion; action: "cancel" | "accept"} | null>(null);
    const [deleteVersion, setDeleteVersion] = useState<TopicBlockVersion | null>(null);
    const requestCancel = (version: TopicBlockVersion) => {
        if (version.userReaction === "reject") setReasonDialog({version, action: "cancel"});
        else onCancelReaction(version, false);
    };
    const requestAccept = (version: TopicBlockVersion) => {
        if (version.userReaction === "reject") setReasonDialog({version, action: "accept"});
        else onAccept(version);
    };
    return <section className={cn("mt-4 mb-2 min-w-0 rounded-lg border bg-muted/20 p-3 wrap-anywhere")}
                    aria-label={`Historial de ${block.blockNumber}`}>
        <div className={cn("mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground")}>
            <GitDiffIcon/>
            <span>Versiones de</span>
            <Link href={`/tema/${encodeURIComponent(topicSlug)}/bloque/${encodeURIComponent(block.blockNumber)}`}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground underline-offset-2 hover:underline">{block.blockNumber}</Link>
        </div>
        {loading && <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Spinner/>Cargando
            historial…</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {versions &&
            <ol className="relative space-y-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:rounded-full before:bg-border">
                {versions.map(version => {
                    const selected = selectedVersionId === version.id;
                    return <li key={version.id} className="group/version relative"
                               onMouseEnter={() => onPreview(version)} onMouseLeave={() => onPreview(null)}
                               onFocus={() => onPreview(version)}
                               onBlur={event => {
                                   if (!event.currentTarget.contains(event.relatedTarget)) onPreview(null);
                               }}
                    >
                    <span
                        className="absolute top-0.5 -left-6 flex size-4 items-center justify-center rounded-full border-2 border-border bg-background transition-transform duration-150 group-hover/version:scale-110"
                        aria-label={version.rejected ? "Edición rechazada" : "Edición aceptada"}
                    >
                        <span
                            className={cn("size-2 rounded-full", version.rejected ? "bg-red-500/65" : "bg-green-500/65")}/>
                    </span>
                        <TopicBlockHistoryVersionHeader version={version} selected={selected} voting={voting !== null}
                            pendingVote={voting?.versionId === version.id ? voting.type : null}
                            onSelect={onSelect} onAccept={requestAccept} onReject={onReject}
                            onCancelReaction={requestCancel} onDelete={setDeleteVersion}/>
                        {version.message && <div className="flex justify-start pb-1">
                            <div
                                className={cn("rounded-md bg-muted px-2 py-0 text-xs font-medium leading-relaxed text-foreground whitespace-pre-wrap break-words")}>
                                {version.message}
                            </div>
                        </div>}
                        {version.deleted
                            ? <p className="flex space-x-1 items-center text-xs italic text-muted-foreground"><TrashIcon/>Bloque eliminado.</p>
                            : <TopicBlockContent block={version} refreshOnMount={false} preview/>}
                    </li>;
                })}
            </ol>}
        <AlertDialog open={Boolean(reasonDialog)} onOpenChange={open => {
            if (!open) setReasonDialog(null);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{reasonDialog?.action === "accept" ? "Cambiar a aceptación" : "Cancelar rechazo"}</AlertDialogTitle>
                    <AlertDialogDescription>¿Querés borrar también la justificación o conservarla como
                        comentario?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={cn("w-full sm:flex-col")}>
                    <AlertDialogCancel className="w-full"
                                       onClick={() => setReasonDialog(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="w-full" onClick={() => {
                        if (reasonDialog) (reasonDialog.action === "accept" ? onAccept : onCancelReaction)(reasonDialog.version, false);
                        setReasonDialog(null);
                    }}>Conservar comentario</AlertDialogAction>
                    <AlertDialogAction className="w-full" variant="destructive" onClick={() => {
                        if (reasonDialog) (reasonDialog.action === "accept" ? onAccept : onCancelReaction)(reasonDialog.version, true);
                        setReasonDialog(null);
                    }}>Borrar justificación</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={Boolean(deleteVersion)} onOpenChange={open => {
            if (!open) setDeleteVersion(null);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar edición</AlertDialogTitle>
                    <AlertDialogDescription>
                        {deleteVersion?.message
                            ? "Esta edición modificó varios bloques. Al eliminarla, dejarán de aparecer todas las versiones creadas por esta edición."
                            : "Esta versión del bloque va a dejar de aparecer."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={async () => {
                        if (deleteVersion && await onDelete(deleteVersion)) setDeleteVersion(null);
                    }}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </section>;
}
