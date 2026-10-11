"use client"

import {PlusIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export function TopicBlockInsertButton({onClick, className, reserveSpace = false}: {onClick: () => void; className?: string; reserveSpace?: boolean}) {
    return <div className={cn("relative", reserveSpace ? "h-6" : "h-0", className)}>
        <Button
            type="button"
            variant="ghost"
            className={cn("group/insert absolute left-0 z-10 w-full -translate-y-1/2 p-0 hover:bg-transparent dark:hover:bg-transparent", reserveSpace ? "top-1/2 h-6" : "top-1 h-4")}
            aria-label="Agregar bloque en esta posición"
            onClick={onClick}
        >
            <span className={cn("absolute inset-x-0 top-1/2 border-t border-transparent transition-colors group-hover/insert:border-border group-focus-visible/insert:border-border")}/>
            <span className={cn("relative z-10 inline-flex size-5 items-center justify-center rounded-full border bg-background opacity-0 transition-opacity group-hover/insert:opacity-100 group-focus-visible/insert:opacity-100")}>
                <PlusIcon className={cn("size-3")}/>
            </span>
        </Button>
    </div>;
}
