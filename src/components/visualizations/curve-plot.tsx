import React from "react";
import { DataPoint, TooltipHookType } from "@/components/visualizations/editor/plotter";
import { LinePath, Circle } from "@visx/shape";
import { curveMonotoneX } from "d3-shape";
import { localPoint } from "@visx/event";
import { ScaleLinear, ScaleTime } from "d3-scale";

export function CurvePlotContent({
                                     data,
                                     xScale,
                                     yScale,
                                     showTooltip,
                                     hideTooltip,
                                     scaleFactorY,
                                     scaleFactorX,
                                     markerRadius = 4,
                                 }: {
    data: DataPoint[];
    xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    showTooltip: TooltipHookType["showTooltip"];
    hideTooltip: TooltipHookType["hideTooltip"];
    scaleFactorX: number;
    scaleFactorY: number;
    /** Radius (in px) of the point markers. Scaled internally by scaleFactor props. */
    markerRadius?: number;
}) {
    // Scale marker radius based on the current zoom so it remains visually consistent.
    const effectiveRadius = markerRadius * Math.min(scaleFactorX, scaleFactorY);

    const handleMouseMove = (event: React.MouseEvent<SVGPathElement | SVGCircleElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const nearest = data.reduce((prev, curr) =>
            Math.abs((xScale(curr.x) ?? 0) - x) < Math.abs((xScale(prev.x) ?? 0) - x) ? curr : prev,
        );
        showTooltip({
            tooltipData: nearest,
            tooltipLeft: xScale(nearest.x),
            tooltipTop: yScale(nearest.y),
        });
    };

    return (
        <g>
            <LinePath
                data={data}
                x={(d) => xScale(d.x) ?? 0}
                y={(d) => yScale(d.y)}
                stroke="var(--primary)"
                strokeWidth={2 * Math.min(scaleFactorX, scaleFactorY)}
                curve={curveMonotoneX}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => hideTooltip()}
            />

            {data.length < 30 && data.map((d, i) => (
                <Circle
                    key={i}
                    cx={xScale(d.x) ?? 0}
                    cy={yScale(d.y)}
                    r={effectiveRadius}
                    fill="var(--primary)"
                    stroke="var(--background)"
                    strokeWidth={1}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => hideTooltip()}
                />
            ))}
        </g>
    );
}