import {memo, useId, useMemo} from "react";
import {AxisBottom, AxisLeft} from "@visx/axis";
import {GridRows} from "@visx/grid";
import {scaleLinear} from "@visx/scale";
import {Bar} from "@visx/shape";
import type {HistogramChart} from "@cabildo-abierto/api";
import {formatTableValue, type BarRow} from "@cabildo-abierto/utils";
import {useChartTooltip} from "@/hooks/use-chart-tooltip";
import {useChartWheelZoom} from "@/hooks/use-chart-wheel-zoom";
import {plotDomain} from "@/lib/visualization-zoom";
import {plotColors} from "./visualization-legend";
import {VisualizationTooltip} from "./visualization-tooltip";

export const VisualizationHistogramPlot = memo(function VisualizationHistogramPlot({chart, rows, width, height, preview = false}: {
    chart: HistogramChart;
    rows: BarRow[];
    width: number;
    height: number;
    preview?: boolean;
}) {
    const tooltip = useChartTooltip(rows, width, height);
    const clipId = useId();
    const margin = preview ? {left: 6, bottom: 6, right: 6, top: 6} : {left: 70, bottom: 70, right: 20, top: 15};
    const w = Math.max(1, width - margin.left - margin.right), h = Math.max(1, height - margin.top - margin.bottom);
    const domain = useMemo(() => {
        let min = Infinity, max = -Infinity;
        for (const row of rows) {
            if (!row.interval) continue;
            min = Math.min(min, row.interval[0]);
            max = Math.max(max, row.interval[1]);
        }
        const padding = (max - min) / Math.max(1, rows.length) * 0.2;
        return plotDomain(min - padding, max + padding);
    }, [rows]);
    const zoom = useChartWheelZoom({svg: tooltip.svg, resetKey: rows, enabled: !preview,
        xDomain: domain, left: margin.left, top: margin.top, width: w, height: h, onZoom: tooltip.close});
    const visible = useMemo(() => rows.filter(row => row.interval && row.interval[1] > zoom.x[0] && row.interval[0] < zoom.x[1]), [rows, zoom.x]);
    let max = 0;
    for (const row of visible) max = Math.max(max, row.values[0] ?? 0);
    const x = scaleLinear({domain: zoom.x, range: [0, w]});
    const y = scaleLinear({domain: [0, max || 1], range: [h, 0], nice: true});
    const formatter = (value: number) => formatTableValue(value, chart.yAxis?.format ?? (chart.frequency === "relative" ? {type: "percent"} : undefined));
    const tickStyle = {fill: "var(--foreground)", fontSize: 10};
    return <><svg ref={tooltip.svg} width={width} height={height} role={preview ? "img" : "group"} aria-label="Histograma"
        onPointerLeave={preview ? undefined : event => { if (event.pointerType !== "touch") tooltip.close(); }}>
        <defs><clipPath id={clipId}><rect width={w} height={h}/></clipPath></defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
            {!preview && chart.showGrid !== false && <GridRows scale={y} width={w} stroke="var(--border)"/>}
            <g clipPath={`url(#${clipId})`}>{visible.map(row => {
                const [lower, upper] = row.interval!;
                const value = row.values[0] ?? 0;
                const bx = x(lower), by = y(value);
                const gap = Math.min(2, (x(upper) - bx) * 0.2);
                const bw = Math.max(0, x(upper) - bx - gap), bh = h - by;
                const visibleLeft = Math.max(0, bx), visibleRight = Math.min(w, bx + bw);
                const title = `Intervalo: ${row.label}`;
                const details = {title, rows: [{label: "Frecuencia", value: formatter(value), color: plotColors[0]}]};
                return <g key={row.key}>
                    <Bar x={bx + gap / 2} y={by} width={bw} height={bh} fill={plotColors[0]} pointerEvents="none"/>
                    {!preview && visibleRight > visibleLeft && <rect x={visibleLeft} y={Math.max(0, Math.min(by, h - 8))}
                        width={visibleRight - visibleLeft} height={Math.min(h, Math.max(8, bh))} fill="transparent"
                        tabIndex={0} role="img" aria-label={`${title} · Frecuencia: ${formatter(value)}`}
                        onPointerMove={event => tooltip.show({...details, clientX: event.clientX, clientY: event.clientY})}
                        onPointerDown={event => tooltip.show({...details, clientX: event.clientX, clientY: event.clientY})}
                        onFocus={() => tooltip.show({...details, ...tooltip.position(margin.left + (visibleLeft + visibleRight) / 2, margin.top + by)})}
                        onBlur={tooltip.close}/>}
                </g>;
            })}</g>
            {!preview && <>
                <AxisBottom top={h} scale={x} tickFormat={v => formatTableValue(Number(v), chart.x.format)}
                    numTicks={chart.x.tickCount ?? Math.max(2, Math.floor(w / 90))} label={chart.x.label ?? chart.x.field}
                    labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)"
                    tickLabelProps={{...tickStyle, angle: chart.x.tickLabelAngle ?? 0}}/>
                <AxisLeft scale={y} tickFormat={v => formatter(Number(v))} numTicks={chart.yAxis?.tickCount ?? 5} label={chart.yAxis?.label}
                    labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)"
                    tickLabelProps={{...tickStyle, angle: chart.yAxis?.tickLabelAngle ?? 0}}/>
            </>}
        </g>
    </svg>{!preview && <VisualizationTooltip data={tooltip.data}/>}</>;
});
