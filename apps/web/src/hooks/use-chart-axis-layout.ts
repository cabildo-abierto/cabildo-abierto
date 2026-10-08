import {useLayoutEffect, useMemo, useState, type RefObject} from 'react';

type Margin = {left: number; right: number; top: number; bottom: number};
type Bounds = {left: number; right: number; top: number; bottom: number};
const padding = 8;

function fitMargins(start: number, end: number, size: number, previousStart = 0, previousEnd = 0): [number, number] {
    // Grow within a layout pass: changing margins can also change automatic ticks.
    // Keep a usable plot even when a title is longer than the entire SVG.
    const extraStart = Math.max(0, start - previousStart), extraEnd = Math.max(0, end - previousEnd);
    const available = Math.max(0, size - 48 - previousStart - previousEnd);
    const ratio = Math.min(1, available / Math.max(1, extraStart + extraEnd));
    return [previousStart + Math.floor(extraStart * ratio), previousEnd + Math.floor(extraEnd * ratio)];
}

// Anchor rotated labels away from the plot, instead of rotating around their center.
export function chartTickLabelProps(angle: number, orientation: 'bottom' | 'left') {
    return {fill: 'var(--foreground)', fontSize: 10, angle, dx: 0, dy: 0,
        textAnchor: orientation === 'left' || angle < 0 ? 'end' as const : angle > 0 ? 'start' as const : 'middle' as const,
        verticalAnchor: orientation === 'bottom' ? 'start' as const : 'middle' as const};
}

export function chartTickCount(requested: number | undefined, fallback: number, span: number, compact: boolean, horizontal = true) {
    const count = requested ?? fallback;
    return compact ? Math.min(count, Math.max(2, Math.floor(span / (horizontal ? 90 : 55)))) : count;
}

export function useChartAxisLayout(svg: RefObject<SVGSVGElement | null>, width: number, height: number, preview: boolean, base: Margin, resetKey: unknown) {
    const key = useMemo(() => ({resetKey, width, height, preview}), [resetKey, width, height, preview]);
    const compact = width < 480;
    const [left, right] = fitMargins(compact ? Math.min(base.left, base.left > 70 ? 90 : 46) : base.left, compact ? 12 : base.right, width);
    const [top, bottom] = fitMargins(base.top, compact ? 48 : base.bottom, height);
    const initial = {key, margin: {left, right, top, bottom}, bottomLabelOffset: 8, leftLabelOffset: 36};
    const [layout, setLayout] = useState(initial);
    const current = layout.key === key ? layout : initial;
    const margin = preview ? {left: 6, right: 6, top: 6, bottom: 6} : current.margin;
    // Read the actual SVG text, including formatting, font metrics and rotation.
    // Re-measure after zoom, resize, or any change to the chart's axis options.
    useLayoutEffect(() => {
        const element = svg.current;
        if (preview || !element) return;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const bounds = (selector: string): Bounds[] => [...element.querySelectorAll<SVGTextElement>(selector)].map(node => {
            const box = node.getBoundingClientRect();
            return {left: (box.left - rect.left) * width / rect.width, right: (box.right - rect.left) * width / rect.width,
                top: (box.top - rect.top) * height / rect.height, bottom: (box.bottom - rect.top) * height / rect.height};
        });
        const bottomTicks = bounds('.visx-axis-bottom .visx-axis-tick text');
        const leftTicks = bounds('.visx-axis-left .visx-axis-tick text');
        if (!bottomTicks.length && !leftTicks.length) return;
        const bottomDepth = Math.max(0, ...bottomTicks.map(box => box.bottom - (height - margin.bottom)));
        const leftDepth = Math.max(0, ...leftTicks.map(box => margin.left - box.left));
        const bottomLabelOffset = Math.max(current.bottomLabelOffset, Math.ceil(bottomDepth - 10));
        const leftLabelOffset = Math.max(current.leftLabelOffset, Math.ceil(leftDepth + 6));
        const labels = [
            ...bounds('.visx-axis-bottom .visx-axis-label').map(box => ({...box, top: box.top + bottomLabelOffset - current.bottomLabelOffset, bottom: box.bottom + bottomLabelOffset - current.bottomLabelOffset})),
            ...bounds('.visx-axis-left .visx-axis-label').map(box => ({...box, left: box.left - leftLabelOffset + current.leftLabelOffset, right: box.right - leftLabelOffset + current.leftLabelOffset})),
        ];
        const all = [...bottomTicks, ...leftTicks, ...labels];
        const next = {
            left: Math.max(margin.left, Math.ceil(margin.left + padding - Math.min(...all.map(box => box.left)))),
            right: Math.max(margin.right, Math.ceil(margin.right + padding + Math.max(...all.map(box => box.right)) - width)),
            top: Math.max(margin.top, Math.ceil(margin.top + padding - Math.min(...all.map(box => box.top)))),
            bottom: Math.max(margin.bottom, Math.ceil(margin.bottom + padding + Math.max(...all.map(box => box.bottom)) - height)),
        };
        [next.left, next.right] = fitMargins(next.left, next.right, width, margin.left, margin.right);
        [next.top, next.bottom] = fitMargins(next.top, next.bottom, height, margin.top, margin.bottom);
        if (layout.key !== key || Object.keys(next).some(key => Math.abs(next[key as keyof Margin] - margin[key as keyof Margin]) > 1)
            || bottomLabelOffset !== current.bottomLabelOffset || leftLabelOffset !== current.leftLabelOffset) {
            setLayout({key, margin: next, bottomLabelOffset, leftLabelOffset});
        }
    });
    return {...current, margin, compact};
}
