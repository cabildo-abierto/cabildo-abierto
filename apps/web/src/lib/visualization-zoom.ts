import type {PlotSeries} from "@cabildo-abierto/utils";

export type PlotDomain = [number, number];

export function plotDomain(min: number, max: number): PlotDomain {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
    return min === max ? [min - 0.5, max + 0.5] : [min, max];
}

export function zoomPlotDomain(current: PlotDomain, full: PlotDomain, factor: number, anchor: number): PlotDomain {
    const fullSpan = full[1] - full[0];
    const minimumSpan = Math.min(fullSpan, Math.max(fullSpan / 1000, Math.max(Math.abs(full[0]), Math.abs(full[1])) * Number.EPSILON * 16));
    const span = Math.min(fullSpan, Math.max(minimumSpan, (current[1] - current[0]) * factor));
    if (span === fullSpan) return [...full];
    const lower = current[0] + anchor * (current[1] - current[0] - span);
    const bounded = Math.max(full[0], Math.min(full[1] - span, lower));
    return [bounded, bounded + span];
}

export function panPlotDomain(current: PlotDomain, full: PlotDomain, offset: number): PlotDomain {
    const span = Math.min(current[1] - current[0], full[1] - full[0]);
    const lower = Math.max(full[0], Math.min(full[1] - span, current[0] + offset));
    return [lower, lower + span];
}

export function visibleLineDomain(series: PlotSeries[], x: PlotDomain): PlotDomain {
    let min = Infinity, max = -Infinity;
    const include = (value: number) => { min = Math.min(min, value); max = Math.max(max, value); };
    for (const line of series) {
        let previous: PlotSeries["points"][number] | undefined;
        for (const point of line.points) {
            if (point.y === null) { previous = undefined; continue; }
            if (point.x >= x[0] && point.x <= x[1]) include(point.y);
            if (previous && previous.y !== null && point.x > previous.x) {
                for (const edge of x) {
                    if (previous.x < edge && point.x > edge) include(previous.y + (point.y - previous.y) * (edge - previous.x) / (point.x - previous.x));
                }
            }
            previous = point;
        }
    }
    return plotDomain(min, max);
}
