"use client";

import {useEffect, useRef, useState} from "react";
import {parseDocumentBlock, parseDatasetBlock} from "@cabildo-abierto/utils";
import {useTopicRoute} from "@/components/topic-route-provider";
import {Button} from "@/components/ui/button";
import {AttachmentEditorPopup} from "./attachment-editor-popup";
import {cn} from "@/lib/utils";

export type AttachmentInsertionAction = {
    onInsert: (content: string) => Promise<boolean>;
    onChange: (id: string, content: string) => void;
    canSave: boolean;
    saving: boolean;
    error: string | null;
    onBusyChange: (busy: boolean) => void;
};

export function AttachmentInsertionPicker({action, type, onCancel}: {action: AttachmentInsertionAction; type: "documento" | "dataset"; onCancel: () => void}) {
    const dataset = type === "dataset";
    const parseContent = dataset ? parseDatasetBlock : parseDocumentBlock;
    const topic = useTopicRoute();
    const [content, setContent] = useState("");
    const [uploading, setBusy] = useState(false);
    const [id] = useState(() => `new-${crypto.randomUUID()}`);
    const staged = useRef(false);
    const busy = uploading || action.saving;
    const onBusyChangeRef = useRef(action.onBusyChange);
    onBusyChangeRef.current = action.onBusyChange;
    useEffect(() => () => onBusyChangeRef.current(false), []);

    const changeContent = (value: string) => {
        setContent(value);
        if (!action.canSave && (staged.current || parseContent(value))) {
            staged.current = true;
            action.onChange(id, value);
        }
    };
    const changeBusy = (value: boolean) => { setBusy(value); action.onBusyChange(value); };
    const submit = () => { if (!busy && action.canSave && parseContent(content)) void action.onInsert(content); };
    const actions = <>
        {action.error && <p role="alert" className={cn("mb-2 text-xs text-destructive")}>{action.error}</p>}
        <div className={cn("flex justify-end gap-2")}>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onCancel}>{action.canSave ? "Cancelar" : "Cerrar"}</Button>
            {action.canSave && <Button type="submit" size="sm" disabled={busy || !parseContent(content)}>{action.saving ? "Guardando…" : "Guardar"}</Button>}
        </div>
    </>;

    return <AttachmentEditorPopup type={type} topicId={topic.id} content={content} disabled={busy} inserting
        onChange={changeContent} onBusyChange={changeBusy} onClose={onCancel} onSubmit={submit}>{actions}</AttachmentEditorPopup>;
}
