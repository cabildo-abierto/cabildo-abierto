import React, {useMemo} from "react";
import {DataPoint, TooltipHookType} from "@/components/visualizations/editor/plotter";
import {LinePath, Circle} from "@visx/shape";
import {curveMonotoneX} from "d3-shape";
import {localPoint} from "@visx/event";
import {ScaleLinear, ScaleTime} from "d3-scale";
import {palette} from "@/components/visualizations/palette";
import {dist} from "@/utils/math";

type Props = {
    data: DataPoint<number, number>[];
    xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    showTooltip: TooltipHookType["showTooltip"];
    hideTooltip: TooltipHookType["hideTooltip"];
    scaleFactorX: number;
    scaleFactorY: number;
    /** Radius (in px) of the point markers. Scaled internally by scaleFactor props. */
    markerRadius?: number;
    margin: { left: number, top: number }
}

export function CurvePlotContent({
    data,
    xScale,
    yScale,
    showTooltip,
    hideTooltip,
    scaleFactorY,
    scaleFactorX,
    markerRadius = 4,
    margin
}: Props) {
    const effectiveRadius = markerRadius * Math.min(scaleFactorX, scaleFactorY);

    const handleMouseMove = (event: React.MouseEvent<SVGPathElement | SVGCircleElement>) => {
        const point = localPoint(event);
        if (!point) return;

        const x = point.x - margin.left
        const y = point.y - margin.top

        const nearest = data.reduce((prev, curr) =>
            dist([xScale(curr.x) ?? 0, yScale(curr.y)], [x, y]) < dist([xScale(prev.x) ?? 0, yScale(prev.y)], [x, y]) ? curr : prev
        );

        if(dist([xScale(nearest.x), yScale(nearest.y)], [x, y]) < 50){
            showTooltip({
                tooltipData: nearest,
                tooltipLeft: xScale(nearest.x),
                tooltipTop: yScale(nearest.y) + 15,
            });
        }
    }

    const {dataByColor, colors} = useMemo(() => {
        const colors = Array.from(new Set<string>(data.map(d => d.color ?? "")))
        const dataByColor = new Map<string, DataPoint<number, number>[]>()
        data.forEach(d => {
            const color = d.color ?? ""
            dataByColor.set(color, [...(dataByColor.get(color) ?? []), d])
        })
        return {colors, dataByColor}
    }, [data])

    return colors.map((color, colorIndex) => {
        const colorData = dataByColor.get(color)
        const showMarkers = colorData.length < 200
        return <g key={color} onMouseMove={handleMouseMove}>
            <LinePath
                data={colorData}
                x={(d) => xScale(d.x) ?? 0}
                y={(d) => yScale(d.y)}
                stroke={palette(colorIndex)}
                strokeWidth={2 * Math.min(scaleFactorX, scaleFactorY)}
                curve={curveMonotoneX}
                onMouseLeave={() => hideTooltip()}
            />
            {showMarkers && colorData.map((d, i) => (
                <Circle
                    key={i}
                    cx={xScale(d.x) ?? 0}
                    cy={yScale(d.y)}
                    r={effectiveRadius}
                    fill={palette(colorIndex)}
                    stroke="var(--background)"
                    strokeWidth={1}
                    onMouseLeave={() => hideTooltip()}
                />
            ))}
        </g>
    })
}