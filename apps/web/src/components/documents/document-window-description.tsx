"use client";

import {TextWithLinks} from "@/components/ui/text-with-links";
import {documentWindowPanelAnimation, useDocumentWindowPanelVisibility} from "./document-window-panel-transition";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";

export function DocumentWindowDescription({id, title, description, onClose, open}: {open: boolean; id: string; title: string; description?: string; onClose: () => void}) {
    const visible = useDocumentWindowPanelVisibility(open);
    if (!visible) return null;
    return <aside id={id} inert={!open} aria-hidden={!open} aria-label="Descripción"
        className={cn("flex max-h-[40%] shrink-0 flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl", documentWindowPanelAnimation(open))}>
        <header className={cn("flex shrink-0 items-center justify-between gap-2 px-3 py-2")}>
            <h2 className={cn("text-sm font-medium")}>Descripción</h2>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Cerrar descripción" title="Cerrar descripción" onClick={onClose}>
                <XIcon/>
            </Button>
        </header>
        <ScrollArea className={cn("min-h-0 max-h-64")}
            viewportClassName={cn("h-full")}>
            <div className={cn("space-y-2 px-3 pb-3")}>
                <h3 className={cn("text-sm font-medium leading-relaxed whitespace-pre-wrap break-words")}>{title}</h3>
                {description && <p className={cn("text-xs leading-relaxed whitespace-pre-wrap break-words text-muted-foreground")}><TextWithLinks text={description}/></p>}
            </div>
        </ScrollArea>
    </aside>;
}
