"use client";

import {useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject} from "react";
import {panPlotDomain, zoomPlotDomain, type PlotDomain} from "@/lib/visualization-zoom";

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
    const latest = useRef(current);
    useLayoutEffect(() => { latest.current = current; }, [current]);
    const [dragging, setDragging] = useState(false);
    const canPan = enabled && !!current && current.x[1] - current.x[0] < xDomain[1] - xDomain[0];

    useEffect(() => {
        const element = svg.current;
        if (!element || !enabled) return;
        let drag: {pointerId: number; clientX: number; domain: PlotDomain; moved: boolean} | null = null;
        const position = (event: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height) return null;
            return {
                x: (event.clientX - rect.left) * element.width.baseVal.value / rect.width - left,
                y: (event.clientY - rect.top) * element.height.baseVal.value / rect.height - top,
                scaleX: element.width.baseVal.value / rect.width,
            };
        };
        const inside = (point: {x: number; y: number}) => point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
        const finish = () => {
            if (!drag) return;
            const pointerId = drag.pointerId;
            drag = null;
            setDragging(false);
            if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
        };
        const down = (event: PointerEvent) => {
            if (!event.isPrimary || event.button !== 0 || drag) return;
            const point = position(event);
            const domain = latest.current?.x ?? xDomain;
            if (!point || !inside(point) || domain[1] - domain[0] >= xDomain[1] - xDomain[0]) return;
            drag = {pointerId: event.pointerId, clientX: event.clientX, domain, moved: false};
            element.setPointerCapture(event.pointerId);
        };
        const move = (event: PointerEvent) => {
            if (!drag || drag.pointerId !== event.pointerId) return;
            const point = position(event);
            if (!point) return;
            const dx = event.clientX - drag.clientX;
            if (!drag.moved && Math.abs(dx) < 3) return;
            drag.moved = true;
            setDragging(true);
            event.preventDefault();
            event.stopPropagation();
            onZoom();
            const x = panPlotDomain(drag.domain, xDomain, -dx * point.scaleX / width * (drag.domain[1] - drag.domain[0]));
            setState(previous => ({resetKey, x, y: previous?.resetKey === resetKey ? previous.y : yDomain}));
        };
        const up = (event: PointerEvent) => {
            if (event.pointerId !== drag?.pointerId) return;
            if (drag.moved) { event.preventDefault(); event.stopPropagation(); onZoom(); }
            finish();
        };
        const wheel = (event: WheelEvent) => {
            const point = position(event);
            if (!point || !inside(point) || !event.deltaY || !Number.isFinite(event.deltaY)) return;
            finish();
            const {x: px, y: py} = point;
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
        element.addEventListener('pointerdown', down, true);
        element.addEventListener('pointermove', move, true);
        element.addEventListener('pointerup', up, true);
        element.addEventListener('pointercancel', up, true);
        element.addEventListener('lostpointercapture', up, true);
        return () => {
            element.removeEventListener('wheel', wheel);
            element.removeEventListener('pointerdown', down, true);
            element.removeEventListener('pointermove', move, true);
            element.removeEventListener('pointerup', up, true);
            element.removeEventListener('pointercancel', up, true);
            element.removeEventListener('lostpointercapture', up, true);
            finish();
        };
    }, [svg, resetKey, enabled, xDomain, yDomain, left, top, width, height, onZoom]);

    const style: CSSProperties = {cursor: dragging ? 'grabbing' : canPan ? 'grab' : undefined, touchAction: canPan ? 'pan-y' : undefined, userSelect: canPan ? 'none' : undefined};
    return {x: current?.x ?? xDomain, y: current?.y ?? yDomain, style};
}
