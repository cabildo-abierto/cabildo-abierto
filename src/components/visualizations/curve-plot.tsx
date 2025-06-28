import {DataPoint, TooltipHookType} from "@/components/visualizations/editor/plotter";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {LinePath} from "@visx/shape";
import {curveMonotoneX} from "d3-shape";
import {localPoint} from "@visx/event";
import {ScaleLinear, ScaleTime} from "d3-scale";


export function CurvePlotContent({data, xScale, yScale, showTooltip, hideTooltip, scaleFactorY, scaleFactorX}: {
    data: DataPoint[],
    xScale: ScaleLinear<number, number> | ScaleTime<number, number>
    yScale: ScaleLinear<number, number>
    showTooltip: TooltipHookType["showTooltip"]
    hideTooltip: TooltipHookType["hideTooltip"]
    scaleFactorX: number
    scaleFactorY: number
}) {
    return <LinePath
        data={data}
        x={(d) => xScale(d.x) ?? 0}
        y={(d) => yScale(d.y)}
        stroke="var(--primary)"
        strokeWidth={2 * Math.min(scaleFactorX, scaleFactorY)}
        curve={curveMonotoneX}
        onMouseMove={(event) => {
            const {x} = localPoint(event) || {x: 0};
            const nearest = data.reduce((prev, curr) =>
                Math.abs(xScale(curr.x)! - x) < Math.abs(xScale(prev.x)! - x) ? curr : prev
            );
            showTooltip({
                tooltipData: nearest,
                tooltipLeft: xScale(nearest.x),
                tooltipTop: yScale(nearest.y),
            });
        }}
        onMouseLeave={() => hideTooltip()}
    />
}