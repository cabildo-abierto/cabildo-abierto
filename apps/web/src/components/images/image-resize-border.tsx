"use client";

import {useRef} from "react";
import type {ImageContent} from "@cabildo-abierto/api";
import {cn} from "@/lib/utils";

type Edge = "left" | "right" | "top" | "bottom";
const edges: Record<Edge, string> = {
    left: "inset-y-0 -left-1 w-2 cursor-ew-resize",
    right: "inset-y-0 -right-1 w-2 cursor-ew-resize",
    top: "-top-1 inset-x-0 h-2 cursor-ns-resize",
    bottom: "-bottom-1 inset-x-0 h-2 cursor-ns-resize",
};
const clamp = (width: number) => Math.round(Math.min(100, Math.max(10, width)) * 10) / 10;

export function ImageResizeBorder({value, onChange, disabled}: {
    value: ImageContent;
    onChange: (width: number) => void;
    disabled?: boolean;
}) {
    const drag = useRef<{x: number; y: number; width: number; height: number; available: number} | null>(null);

    return <>
        {(Object.entries(edges) as [Edge, string][]).map(([edge, className]) => <div
            key={edge}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label="Tamaño de la imagen"
            aria-valuemin={10}
            aria-valuemax={100}
            aria-valuenow={value.widthPercent}
            aria-disabled={disabled}
            className={cn("absolute z-10 hidden touch-none outline-none focus-visible:bg-primary/30 md:block", className, disabled && "pointer-events-none")}
            draggable={false}
            onDragStart={event => { event.preventDefault(); event.stopPropagation(); }}
            onPointerDown={event => {
                if (disabled || event.button !== 0) return;
                event.preventDefault();
                event.stopPropagation();
                const frame = event.currentTarget.closest("[data-image-frame]");
                const flow = frame?.closest("[data-topic-flow]");
                const available = flow ? parseFloat(getComputedStyle(flow).getPropertyValue("--topic-flow-width")) : 0;
                if (!frame || !available) return;
                const bounds = event.currentTarget.parentElement!.getBoundingClientRect();
                drag.current = {x: event.clientX, y: event.clientY, width: bounds.width, height: bounds.height, available};
                event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
                const start = drag.current;
                if (!start || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                event.stopPropagation();
                const horizontal = edge === "left" || edge === "right";
                const delta = horizontal
                    ? (event.clientX - start.x) * (edge === "left" ? -1 : 1) * (value.alignment === "center" ? 2 : 1)
                    : (event.clientY - start.y) * (edge === "top" ? -1 : 1) * start.width / start.height;
                onChange(clamp((start.width + delta) / start.available * 100));
            }}
            onPointerUp={event => {
                event.stopPropagation();
                drag.current = null;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onLostPointerCapture={() => { drag.current = null; }}
            onKeyDown={event => {
                if (disabled || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                event.stopPropagation();
                onChange(event.key === "Home" ? 10 : event.key === "End" ? 100 : clamp(value.widthPercent + (["ArrowRight", "ArrowUp"].includes(event.key) ? 5 : -5)));
            }}
        />)}
    </>;
}
