"use client";

import {useEffect, useRef, useState, type KeyboardEvent, type PointerEvent} from "react";

type Bounds = {left: number; top: number; width: number; height: number};
export type WindowResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Operation = "move" | WindowResizeDirection;
const margin = 16;

function fit(bounds: Bounds, sidePanelWidth: number): Bounds {
    const width = Math.min(Math.max(360 + sidePanelWidth, bounds.width), window.innerWidth - margin * 2);
    const height = Math.min(Math.max(280, bounds.height), window.innerHeight - margin * 2);
    return {
        width, height,
        left: Math.max(margin, Math.min(bounds.left, window.innerWidth - width - margin)),
        top: Math.max(margin, Math.min(bounds.top, window.innerHeight - height - margin)),
    };
}

export function useDocumentWindow(sidePanelWidth = 0) {
    const [bounds, setBounds] = useState(() => {
        const width = Math.min(960 + sidePanelWidth, window.innerWidth - 64);
        const height = Math.min(820, window.innerHeight - 64);
        return fit({width, height, left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2}, sidePanelWidth);
    });
    const [maximized, setMaximized] = useState(false);
    const [interacting, setInteracting] = useState(false);
    const gesture = useRef<{operation: Operation; x: number; y: number; bounds: Bounds} | null>(null);
    const previousSidePanelWidth = useRef(sidePanelWidth);

    useEffect(() => {
        const difference = sidePanelWidth - previousSidePanelWidth.current;
        previousSidePanelWidth.current = sidePanelWidth;
        setBounds(current => fit({...current, width: current.width + difference}, sidePanelWidth));
    }, [sidePanelWidth]);

    useEffect(() => {
        const onResize = () => setBounds(current => fit(current, sidePanelWidth));
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [sidePanelWidth]);

    const adjust = (initial: Bounds, operation: Operation, dx: number, dy: number): Bounds => {
        if (operation === "move") return fit({...initial, left: initial.left + dx, top: initial.top + dy}, sidePanelWidth);
        const minWidth = Math.min(360 + sidePanelWidth, window.innerWidth - margin * 2);
        const minHeight = Math.min(280, window.innerHeight - margin * 2);
        let {left, top} = initial;
        let right = initial.left + initial.width;
        let bottom = initial.top + initial.height;
        if (operation.includes("w")) left = Math.max(margin, Math.min(left + dx, right - minWidth));
        if (operation.includes("e")) right = Math.min(window.innerWidth - margin, Math.max(right + dx, left + minWidth));
        if (operation.includes("n")) top = Math.max(margin, Math.min(top + dy, bottom - minHeight));
        if (operation.includes("s")) bottom = Math.min(window.innerHeight - margin, Math.max(bottom + dy, top + minHeight));
        return {left, top, width: right - left, height: bottom - top};
    };

    const controls = (operation: Operation) => ({
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
            if (event.button !== 0 || maximized) return;
            event.preventDefault();
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            gesture.current = {operation, x: event.clientX, y: event.clientY, bounds};
            setInteracting(true);
        },
        onPointerMove: (event: PointerEvent<HTMLElement>) => {
            const current = gesture.current;
            if (current) setBounds(adjust(current.bounds, current.operation, event.clientX - current.x, event.clientY - current.y));
        },
        onPointerUp: (event: PointerEvent<HTMLElement>) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            gesture.current = null;
            setInteracting(false);
        },
        onLostPointerCapture: () => { gesture.current = null; setInteracting(false); },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (maximized || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            const step = event.shiftKey ? 40 : 10;
            const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
            const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
            setBounds(current => adjust(current, operation, dx, dy));
        },
    });

    return {
        style: maximized ? {inset: margin} : bounds,
        maximized, interacting,
        toggleMaximized: () => setMaximized(current => !current),
        moveControls: controls("move"),
        resizeControls: (direction: WindowResizeDirection) => controls(direction),
    };
}
