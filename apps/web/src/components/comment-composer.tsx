"use client";

import {useState} from "react";
import type {BlockComment} from "@cabildo-abierto/api";
import {KeyReturnIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

export function CommentComposer({replyTo, rejectionLabel, onPublish, onCancel}: {
    replyTo?: BlockComment;
    rejectionLabel?: string;
    onPublish: (content: string, replyToId?: string) => Promise<boolean>;
    onCancel?: () => void;
}) {
    const [content, setContent] = useState("");
    const [publishing, setPublishing] = useState(false);

    const publish = async () => {
        setPublishing(true);
        const published = await onPublish(content, replyTo?.id);
        setPublishing(false);
        if (published) {
            setContent("");
            onCancel?.();
        }
    };

    const rejection = Boolean(rejectionLabel);
    return <div className="relative">
        {rejectionLabel && <p className="mb-2 text-xs font-medium text-red-600 dark:text-red-400">Rechazando {rejectionLabel}</p>}
        <div className="relative">
            <Textarea value={content} onChange={event => setContent(event.target.value)}
            placeholder={rejection ? "Explicá por qué rechazás esta edición…" : replyTo ? `Respondé a @${replyTo.author.username}…` : "Escribí un comentario…"}
            onKeyDown={event => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
                event.preventDefault();
                if (!publishing && content.trim()) void publish();
            }}
            maxLength={20_000}
            autoFocus={rejection}
            className={rejection
                ? "min-h-[3lh] resize-none rounded-lg border-red-500/60 bg-red-500/5 pb-8 text-red-950 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20 dark:border-red-400/60 dark:bg-red-500/10 dark:text-red-100 dark:focus-visible:border-red-400"
                : "min-h-[3lh] resize-none rounded-lg border-[rgb(229_229_229)] pb-8 focus-visible:border-ring focus-visible:ring-0 dark:border-[rgb(38_38_38)] dark:focus-visible:border-ring"}/>
            <div className="absolute right-1 bottom-1 flex items-center gap-1">
            {replyTo && <Button type="button" variant="ghost" size="icon-lg" className={cn("size-7 p-0", rejection && "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300")}
                onClick={() => { setContent(""); onCancel?.(); }} disabled={publishing}
                aria-label="Cancelar respuesta" title="Cancelar respuesta">
                <XIcon className="size-3"/>
            </Button>}
            {!replyTo && <Button type="button" variant="ghost" size="icon-lg" className={cn("size-7 p-0", rejection && "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300")}
                onClick={() => setContent("")} disabled={publishing || !content}
                aria-label="Cancelar comentario" title="Cancelar">
                <XIcon className="size-3"/>
            </Button>}
            <Button type="button" variant="ghost" size="icon-lg"
                className={cn("size-7 rounded-md p-0 [&_svg]:size-5", rejection ? "text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" : "hover:bg-muted dark:hover:bg-muted/50")}
                onClick={() => void publish()} disabled={publishing || !content.trim()}
                aria-label={publishing ? "Publicando comentario" : "Publicar comentario"} title="Publicar">
                <KeyReturnIcon/>
            </Button>
            </div>
        </div>
    </div>;
}
