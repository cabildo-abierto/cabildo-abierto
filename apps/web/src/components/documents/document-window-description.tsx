"use client";

import {useId, useState} from "react";
import {MinusIcon, PlusIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";

export function DocumentWindowDescription({title, description}: {title: string; description?: string}) {
    const [minimized, setMinimized] = useState(false);
    const contentId = useId();
    return <aside aria-label="Descripción"
        className={cn("flex max-h-[40%] shrink-0 flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl")}>
        <header className={cn("flex shrink-0 items-center justify-between gap-2 px-3 py-2")}>
            <h2 className={cn("text-sm font-medium")}>Descripción</h2>
            <Button type="button" variant="ghost" size="icon-sm" aria-controls={contentId} aria-expanded={!minimized}
                aria-label={minimized ? "Expandir descripción" : "Minimizar descripción"}
                title={minimized ? "Expandir descripción" : "Minimizar descripción"}
                onClick={() => setMinimized(value => !value)}>
                {minimized ? <PlusIcon/> : <MinusIcon/>}
            </Button>
        </header>
        <ScrollArea id={contentId} hidden={minimized} className={cn("min-h-0 max-h-64", minimized && "hidden")}
            viewportClassName={cn("h-full")}>
            <div className={cn("space-y-2 px-3 pb-3")}>
                <h3 className={cn("text-sm font-medium leading-relaxed whitespace-pre-wrap break-words")}>{title}</h3>
                {description && <p className={cn("text-xs leading-relaxed whitespace-pre-wrap break-words text-muted-foreground")}>{description}</p>}
            </div>
        </ScrollArea>
    </aside>;
}
