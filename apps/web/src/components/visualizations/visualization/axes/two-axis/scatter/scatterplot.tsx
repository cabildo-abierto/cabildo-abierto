import {DataPoint, TooltipHookType} from "../../../plotter";
import {ScaleLinear, ScaleTime} from "d3-scale";
import {Circle} from "@visx/shape";
import {localPoint} from "@visx/event";
import {Group} from "@visx/group";
import React, {useMemo} from "react";
import {palette} from "../../../palette";
import {dist} from "@cabildo-abierto/utils";

type Props = {
    data: DataPoint<number, number>[]
    xScale: ScaleLinear<number, number> | ScaleTime<number, number>
    yScale: ScaleLinear<number, number>
    innerHeight: number
    showTooltip: TooltipHookType["showTooltip"]
    hideTooltip: TooltipHookType["hideTooltip"]
    scaleFactorX: number
    scaleFactorY: number
    margin: {left: number, top: number}
}

export function ScatterplotContent({data, xScale, yScale, hideTooltip, showTooltip, scaleFactorY, scaleFactorX, margin}: Props) {
    const handleMouseMove = (event: React.MouseEvent<SVGPathElement | SVGCircleElement>) => {
        const point = localPoint(event);
        if (!point) return;

        const x = point.x - margin.left
        const y = point.y - margin.top

        const nearest = data.reduce((prev, curr) =>
            dist([xScale(curr.x) ?? 0, yScale(curr.y)], [x, y]) < dist([xScale(prev.x) ?? 0, yScale(prev.y)], [x, y]) ? curr : prev
        );

        showTooltip({
            tooltipData: nearest,
            tooltipLeft: xScale(nearest.x),
            tooltipTop: yScale(nearest.y) + 15,
        });
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

    return <Group
        onMouseLeave={hideTooltip}
        onMouseMove={handleMouseMove}
    >
        {colors.map((color, colorIndex) => {
            const colorData = dataByColor.get(color)
            return <g key={color}>
                {colorData.map((d, i) => (
                    <Circle
                        key={`circle-${i}`}
                        cx={xScale(d.x)}
                        cy={yScale(d.y)}
                        r={3 * Math.min(scaleFactorX, scaleFactorY)}
                        fill={palette(colorIndex)}
                    />
                ))}
            </g>
        })}
    </Group>
}