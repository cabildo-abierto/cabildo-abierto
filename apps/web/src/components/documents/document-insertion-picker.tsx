"use client";

import {useEffect, useRef, useState} from "react";
import {parseDocumentBlock} from "@cabildo-abierto/utils";
import {useTopicRoute} from "@/components/topic-route-provider";
import {Button} from "@/components/ui/button";
import {DocumentBlockForm} from "./document-block-form";
import {cn} from "@/lib/utils";

export type DocumentInsertionAction = {
    onInsert: (content: string) => Promise<boolean>;
    onChange: (id: string, content: string) => void;
    canSave: boolean;
    saving: boolean;
    error: string | null;
    onBusyChange: (busy: boolean) => void;
};

export function DocumentInsertionPicker({action, onCancel}: {action: DocumentInsertionAction; onCancel: () => void}) {
    const topic = useTopicRoute();
    const [content, setContent] = useState("");
    const [uploading, setBusy] = useState(false);
    const [id] = useState(() => `new-${crypto.randomUUID()}`);
    const staged = useRef(false);
    const busy = uploading || action.saving;
    const onBusyChangeRef = useRef(action.onBusyChange);
    onBusyChangeRef.current = action.onBusyChange;
    useEffect(() => () => onBusyChangeRef.current(false), []);

    return <form role="dialog" aria-label="Insertar documento"
        className={cn("w-80 max-w-[calc(100vw-3rem)] space-y-3 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md")}
        onMouseDown={event => event.stopPropagation()}
        onKeyDown={event => {
            event.stopPropagation();
            if (event.key === "Escape" && !busy) { event.preventDefault(); onCancel(); }
        }}
        onSubmit={event => {
            event.preventDefault();
            if (!busy && action.canSave && parseDocumentBlock(content)) void action.onInsert(content);
        }}>
        <DocumentBlockForm topicId={topic.id} content={content} disabled={busy} embedded onChange={value => {
            setContent(value);
            if (!action.canSave && (staged.current || parseDocumentBlock(value))) {
                staged.current = true;
                action.onChange(id, value);
            }
        }}
            onBusyChange={value => { setBusy(value); action.onBusyChange(value); }}/>
        {action.error && <p role="alert" className={cn("text-xs text-destructive")}>{action.error}</p>}
        <div className={cn("flex justify-end gap-2")}>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onCancel}>{action.canSave ? "Cancelar" : "Cerrar"}</Button>
            {action.canSave && <Button type="submit" size="sm" disabled={busy || !parseDocumentBlock(content)}>{action.saving ? "Guardando…" : "Guardar"}</Button>}
        </div>
    </form>;
}
