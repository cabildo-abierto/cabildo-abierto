"use client";

import {useRef, useState} from "react";
import {PlusIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {AttachmentInsertionPicker, type AttachmentInsertionAction} from "./attachment-insertion-picker";

export function AttachmentSectionAddButton({type, action, disabled}: {
    type: "documento" | "dataset";
    action: AttachmentInsertionAction;
    disabled: boolean;
}) {
    const [open, setOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    const close = () => { setOpen(false); trigger.current?.focus(); };
    const label = type === "dataset" ? "Agregar conjunto de datos" : "Agregar documento";

    return <div className={cn("relative flex items-center")}>
        <Button ref={trigger} type="button" variant="ghost" size="icon-xs" disabled={disabled} aria-label={label} title={label}
            aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
            <PlusIcon aria-hidden="true"/>
        </Button>
        {open && <>
            <AttachmentInsertionPicker type={type} action={{...action, onInsert: async content => {
                const saved = await action.onInsert(content);
                if (saved) close();
                return saved;
            }}} onCancel={close}/>
        </>}
    </div>;
}
