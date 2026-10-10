"use client";

import type {ReactNode} from "react";
import {Dialog} from "@base-ui/react/dialog";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export function LccaValueDialog({title, onClose, children}: {title: string; onClose: () => void; children: ReactNode}) {
    return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
        <Dialog.Portal>
            <Dialog.Backdrop data-attachment-editor-popup className={cn("fixed inset-0 z-50 bg-black/40")}/>
            <Dialog.Popup data-attachment-editor-popup className={cn("fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none")}
                onMouseDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") event.stopPropagation(); }}>
                <header className={cn("mb-3 flex items-center gap-2")}>
                    <Dialog.Title className={cn("flex-1 text-sm font-medium")}>{title}</Dialog.Title>
                    <Dialog.Close render={<Button type="button" variant="ghost" size="icon-sm"/>} aria-label="Cerrar"><XIcon/></Dialog.Close>
                </header>
                <Dialog.Description className={cn("sr-only")}>Consulta LCCA que devuelve un valor para mostrar dentro del texto.</Dialog.Description>
                {children}
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>;
}
