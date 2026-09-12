"use client";

import {useState} from "react";
import type {BlockComment} from "@cabildo-abierto/api";
import {KeyReturnIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";

export function CommentComposer({replyTo, onPublish, onCancel}: {
    replyTo?: BlockComment;
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

    return <div className="relative">
        <Textarea value={content} onChange={event => setContent(event.target.value)}
            placeholder={replyTo ? `Respondé a @${replyTo.author.username}…` : "Escribí un comentario…"}
            onKeyDown={event => {
                if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
                event.preventDefault();
                if (!publishing && content.trim()) void publish();
            }}
            maxLength={20_000}
            className="min-h-[3lh] resize-none rounded-lg border-[rgb(229_229_229)] pb-8 focus-visible:border-ring focus-visible:ring-0 dark:border-[rgb(38_38_38)] dark:focus-visible:border-ring"/>
        <div className="absolute right-1 bottom-1 flex items-center gap-1">
            {replyTo && <Button type="button" variant="ghost" size="icon-lg" className="size-7 p-0"
                onClick={() => { setContent(""); onCancel?.(); }} disabled={publishing}
                aria-label="Cancelar respuesta" title="Cancelar respuesta">
                <XIcon className="size-3"/>
            </Button>}
            {!replyTo && <Button type="button" variant="ghost" size="icon-lg" className="size-7 p-0"
                onClick={() => setContent("")} disabled={publishing || !content}
                aria-label="Cancelar comentario" title="Cancelar">
                <XIcon className="size-3"/>
            </Button>}
            <Button type="button" variant="ghost" size="icon-lg"
                className="size-7 rounded-md p-0 hover:bg-muted dark:hover:bg-muted/50 [&_svg]:size-5"
                onClick={() => void publish()} disabled={publishing || !content.trim()}
                aria-label={publishing ? "Publicando comentario" : "Publicar comentario"} title="Publicar">
                <KeyReturnIcon/>
            </Button>
        </div>
    </div>;
}
