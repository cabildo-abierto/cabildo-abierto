"use client"

import {PlusIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";

export function TopicBlockInsertButton({onClick}: {onClick: () => void}) {
    return <div className="relative h-0">
        <Button
            type="button"
            variant="ghost"
            className="group/insert absolute top-1 left-0 z-10 h-4 w-full -translate-y-1/2 p-0 hover:bg-transparent dark:hover:bg-transparent"
            aria-label="Agregar bloque en esta posición"
            onClick={onClick}
        >
            <span className="absolute inset-x-0 top-1/2 border-t border-transparent transition-colors group-hover/insert:border-border group-focus-visible/insert:border-border"/>
            <span className="relative z-10 inline-flex size-5 items-center justify-center rounded-full border bg-background opacity-0 transition-opacity group-hover/insert:opacity-100 group-focus-visible/insert:opacity-100">
                <PlusIcon className="size-3"/>
            </span>
        </Button>
    </div>;
}
