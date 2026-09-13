"use client";

import {ArrowClockwiseIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";

export function TopicConvergenceNotice({onUpdate}: {onUpdate: () => void}) {
    return <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground" role="status">
        <span>Se modificó la convergencia.</span>
        <Button type="button" variant="link" size="xs" className="h-auto gap-1 p-0 text-xs" onClick={onUpdate}>
            <ArrowClockwiseIcon className="size-3.5"/>Ver la versión actual.
        </Button>
    </div>;
}
