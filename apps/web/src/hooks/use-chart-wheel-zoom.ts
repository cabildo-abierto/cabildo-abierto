"use client";

import {useEffect, useState, type RefObject} from "react";
import {zoomPlotDomain, type PlotDomain} from "@/lib/visualization-zoom";

type ZoomState = {resetKey: unknown; x: PlotDomain; y?: PlotDomain};
export function useChartWheelZoom({svg, resetKey, enabled, xDomain, yDomain, left, top, width, height, onZoom}: {
    svg: RefObject<SVGSVGElement | null>;
    resetKey: unknown;
    enabled: boolean;
    xDomain: PlotDomain;
    yDomain?: PlotDomain;
    left: number;
    top: number;
    width: number;
    height: number;
    onZoom: () => void;
}) {
    const [state, setState] = useState<ZoomState | null>(null);
    const current = state?.resetKey === resetKey ? state : null;

    useEffect(() => {
        const element = svg.current;
        if (!element || !enabled) return;
        const wheel = (event: WheelEvent) => {
            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height || !event.deltaY || !Number.isFinite(event.deltaY)) return;
            const px = (event.clientX - rect.left) * element.width.baseVal.value / rect.width - left;
            const py = (event.clientY - rect.top) * element.height.baseVal.value / rect.height - top;
            if (px < 0 || px > width || py < 0 || py > height) return;
            event.preventDefault();
            event.stopPropagation();
            const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
            const factor = Math.exp(Math.max(-100, Math.min(100, delta)) * 0.002);
            onZoom();
            setState(previous => {
                const active = previous?.resetKey === resetKey ? previous : null;
                return {
                    resetKey,
                    x: zoomPlotDomain(active?.x ?? xDomain, xDomain, factor, px / width),
                    y: yDomain ? zoomPlotDomain(active?.y ?? yDomain, yDomain, factor, 1 - py / height) : undefined,
                };
            });
        };
        element.addEventListener("wheel", wheel, {passive: false});
        return () => element.removeEventListener("wheel", wheel);
    }, [svg, resetKey, enabled, xDomain, yDomain, left, top, width, height, onZoom]);

    return {x: current?.x ?? xDomain, y: current?.y ?? yDomain};
}
