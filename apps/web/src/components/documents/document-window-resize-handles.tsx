import {DotsSixIcon} from "@phosphor-icons/react";
import type {useDocumentWindow, WindowResizeDirection} from "@/hooks/use-document-window";
import {cn} from "@/lib/utils";

const handles: {direction: WindowResizeDirection; label: string; className: string}[] = [
    {direction: "n", label: "borde superior", className: "inset-x-3 top-0 h-1.5 cursor-ns-resize"},
    {direction: "s", label: "borde inferior", className: "right-5 bottom-0 left-3 h-1.5 cursor-ns-resize"},
    {direction: "w", label: "borde izquierdo", className: "inset-y-3 left-0 w-1.5 cursor-ew-resize"},
    {direction: "e", label: "borde derecho", className: "top-3 right-0 bottom-5 w-1.5 cursor-ew-resize"},
    {direction: "nw", label: "esquina superior izquierda", className: "top-0 left-0 size-3 cursor-nwse-resize"},
    {direction: "ne", label: "esquina superior derecha", className: "top-0 right-0 size-3 cursor-nesw-resize"},
    {direction: "sw", label: "esquina inferior izquierda", className: "bottom-0 left-0 size-3 cursor-nesw-resize"},
    {direction: "se", label: "esquina inferior derecha", className: "right-0 bottom-0 size-5 cursor-nwse-resize rounded-tl-md bg-background text-muted-foreground"},
];

export function DocumentWindowResizeHandles({controls}: {controls: ReturnType<typeof useDocumentWindow>["resizeControls"]}) {
    return handles.map(({direction, label, className}) => <button key={direction} type="button" {...controls(direction)}
        className={cn("absolute z-10 touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset", className)}
        aria-label={`Cambiar tamaño desde ${label}; usá las flechas del teclado o arrastrá`} title={`Cambiar tamaño desde ${label}`}>
        {direction === "se" && <DotsSixIcon aria-hidden="true" className={cn("size-5")}/>}
    </button>);
}
