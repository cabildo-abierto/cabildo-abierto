"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {Dialog} from "@base-ui/react/dialog";
import {FileTextIcon, TableIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import {DatasetBlockForm} from "@/components/datasets/dataset-block-form";
import {DocumentBlockForm} from "@/components/documents/document-block-form";

export function AttachmentEditorPopup({type, topicId, content, onChange, onClose, onBusyChange, disabled, inserting = false, onSubmit, children}: {
    type: "documento" | "dataset";
    topicId: string;
    content: string;
    onChange: (content: string) => void;
    onClose: () => void;
    onBusyChange: (busy: boolean) => void;
    disabled: boolean;
    inserting?: boolean;
    onSubmit?: () => void;
    children: ReactNode;
}) {
    const dataset = type === "dataset";
    const Form = dataset ? DatasetBlockForm : DocumentBlockForm;
    const Icon = dataset ? TableIcon : FileTextIcon;
    const title = `${inserting ? "Insertar" : "Editar"} ${dataset ? "conjunto de datos" : "documento"}`;
    const [loading, setLoading] = useState(false);
    const busy = disabled || loading;
    const busyCallback = useRef(onBusyChange);
    busyCallback.current = onBusyChange;
    useEffect(() => () => busyCallback.current(false), []);

    return <Dialog.Root open disablePointerDismissal onOpenChange={open => { if (!open && !busy) onClose(); }}>
        <Dialog.Portal>
            <Dialog.Backdrop data-attachment-editor-popup className={cn("fixed inset-0 z-50 bg-black/40")}/>
            <Dialog.Popup data-attachment-editor-popup
                className={cn("fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none", dataset ? "max-w-4xl" : "max-w-xl")}
                onMouseDown={event => event.stopPropagation()}>
                <header className={cn("flex shrink-0 items-center gap-2 border-b px-4 py-3")}>
                    <Icon aria-hidden="true" className={cn("size-4 text-muted-foreground")}/>
                    <Dialog.Title className={cn("flex-1 text-sm font-medium")}>{title}</Dialog.Title>
                    <Dialog.Close render={<Button type="button" variant="ghost" size="icon-sm" disabled={busy}/>}
                        aria-label="Cerrar" title="Cerrar"><XIcon/></Dialog.Close>
                </header>
                <form className={cn("flex min-h-0 flex-col")} onSubmit={event => { event.preventDefault(); if (!busy) onSubmit?.(); }}>
                    <ScrollArea className={cn("flex min-h-0 flex-col")} viewportClassName={cn("min-h-0 flex-1")}>
                        <div className={cn("p-4")}>
                            <Form topicId={topicId} content={content} disabled={disabled} embedded onChange={onChange}
                                onBusyChange={value => { setLoading(value); busyCallback.current(value); }}/>
                        </div>
                    </ScrollArea>
                    <footer className={cn("shrink-0 border-t px-4 py-3")}>
                        {children || <div className={cn("flex justify-end")}><Button type="button" size="sm" variant="outline" disabled={busy} onClick={onClose}>Cerrar</Button></div>}
                    </footer>
                </form>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>;
}
