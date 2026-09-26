"use client"

import * as React from "react";
import {ScrollArea as ScrollAreaPrimitive} from "@base-ui/react/scroll-area";
import {cn} from "@/lib/utils";

function ScrollArea({className, children, viewportClassName, horizontal = false, ...props}: ScrollAreaPrimitive.Root.Props & {
    viewportClassName?: string;
    horizontal?: boolean;
}) {
    return <ScrollAreaPrimitive.Root
        data-slot="scroll-area"
        className={cn("relative overflow-hidden", className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport
            data-slot="scroll-area-viewport"
            className={cn("max-h-[inherit] w-full rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30", viewportClassName)}
        >
            <ScrollAreaPrimitive.Content style={horizontal ? undefined : {minWidth: 0}}>{children}</ScrollAreaPrimitive.Content>
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar/>
        {horizontal && <ScrollBar orientation="horizontal"/>}
    </ScrollAreaPrimitive.Root>;
}

function ScrollBar({className, orientation = "vertical", ...props}: ScrollAreaPrimitive.Scrollbar.Props) {
    return <ScrollAreaPrimitive.Scrollbar
        data-slot="scroll-area-scrollbar"
        orientation={orientation}
        className={cn(
            "flex touch-none p-px opacity-0 transition-opacity select-none data-hovering:opacity-100 data-scrolling:opacity-100",
            orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
            orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
            className,
        )}
        {...props}
    >
        <ScrollAreaPrimitive.Thumb
            data-slot="scroll-area-thumb"
            className="relative flex-1 rounded-full bg-border"
        />
    </ScrollAreaPrimitive.Scrollbar>;
}

export {ScrollArea, ScrollBar};
