"use client";

import {useState} from "react";
import type {DiscussionComment} from "@cabildo-abierto/api";
import {KeyReturnIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";

export function CommentComposer({replyTo, rejectionLabel, replicaVote, onPublish, onCancel}: {
    replyTo?: DiscussionComment;
    rejectionLabel?: string;
    replicaVote?: "accept" | "reject";
    onPublish: (content: string, replyToId?: string) => Promise<boolean>;
    onCancel?: () => void;
}) {
    const [content, setContent] = useState("");
    const [publishing, setPublishing] = useState(false);

    const publish = async () => {
        if (publishing || !content.trim()) return;
        setPublishing(true);
        try {
            const published = await onPublish(content, replyTo?.id);
            if (published) {
                setContent("");
                onCancel?.();
            }
        } finally { setPublishing(false); }
    };

    const suggestedVote = rejectionLabel ? "reject" : replicaVote ?? null;
    const voting = suggestedVote !== null;
    const rejection = suggestedVote === "reject";
    const acceptance = suggestedVote === "accept";
    return <div className="relative">
        {rejectionLabel && <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">Rechazando {rejectionLabel}</p>}
        {replicaVote && <p className={cn("mb-1 text-xs text-[11px] font-medium text-muted-foreground")}>
            Replicando para {acceptance ? "invalidar" : "mantener"} el rechazo.
        </p>}
        <div className="relative">
            <Textarea value={content} onChange={event => setContent(event.target.value)} readOnly={publishing} aria-busy={publishing}
            placeholder={replicaVote ? "Justificá tu réplica…" : rejection ? "Explicá el motivo del rechazo…" : replyTo ? "Escribí una respuesta…" : "Escribí un comentario…"}
            onKeyDown={event => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
                event.preventDefault();
                if (!publishing && content.trim()) void publish();
            }}
            maxLength={20_000}
            autoFocus={voting}
            className={cn(
                "min-h-[3lh] cursor-text resize-none rounded-lg pb-8",
                rejection && "border-red-500/60 bg-red-500/5 text-red-950 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 dark:border-red-400/60 dark:bg-red-500/10 dark:text-red-100 dark:focus-visible:border-red-400",
                acceptance && "border-green-500/60 bg-green-500/5 text-green-950 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20 dark:border-green-400/60 dark:bg-green-500/10 dark:text-green-100 dark:focus-visible:border-green-400",
                !voting && "border-[rgb(229_229_229)] focus-visible:border-ring focus-visible:ring-0 dark:border-[rgb(38_38_38)] dark:focus-visible:border-ring",
            )}/>
            <div className="absolute right-1 bottom-1 flex items-center gap-1">
            {replyTo && !publishing && <Button type="button" variant="ghost" size="icon-lg" className={cn("size-7 p-0", rejection && "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300", acceptance && "text-green-700 hover:bg-green-500/10 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300")}
                onClick={() => { setContent(""); onCancel?.(); }} disabled={publishing}
                aria-label="Cancelar respuesta" title="Cancelar respuesta">
                <XIcon className="size-3"/>
            </Button>}
            {!replyTo && !publishing && <Button type="button" variant="ghost" size="icon-lg" className={cn("size-7 p-0", rejection && "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300", acceptance && "text-green-700 hover:bg-green-500/10 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300")}
                onClick={() => setContent("")} disabled={publishing || !content}
                aria-label="Cancelar comentario" title="Cancelar">
                <XIcon className="size-3"/>
            </Button>}
            <Button type="button" variant="ghost" size={publishing ? "sm" : "icon-lg"}
                className={cn("h-7 rounded-md", publishing ? "cursor-default gap-1.5 bg-transparent px-2 text-muted-foreground hover:bg-transparent dark:hover:bg-transparent" : "w-7 p-0 [&_svg]:size-5", !publishing && rejection && "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300", !publishing && acceptance && "text-green-700 hover:bg-green-500/10 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300", !publishing && !voting && "hover:bg-muted dark:hover:bg-muted/50")}
                onClick={() => void publish()} disabled={!publishing && !content.trim()} aria-disabled={publishing} aria-busy={publishing}
                aria-label={publishing ? "Publicando comentario" : "Publicar comentario"} title={publishing ? "Publicando…" : "Publicar"}>
                {publishing ? <><Spinner className={cn("size-3.5")} aria-label="Publicando comentario"/><span aria-live="polite">Publicando…</span></> : <KeyReturnIcon/>}
            </Button>
            </div>
        </div>
    </div>;
}
