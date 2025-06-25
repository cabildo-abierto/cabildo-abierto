import {DataPoint, TooltipHookType} from "@/components/visualizations/editor/plotter";
import {ScaleLinear, ScaleTime} from "d3-scale";
import {Circle} from "@visx/shape";
import {localPoint} from "@visx/event";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {Group} from "@visx/group";


export function ScatterplotContent({data, xScale, yScale, hideTooltip, showTooltip}: {
    data: DataPoint[]
    xScale: ScaleLinear<number, number> | ScaleTime<number, number>
    yScale: ScaleLinear<number, number>
    innerHeight: number
    showTooltip: TooltipHookType["showTooltip"]
    hideTooltip: TooltipHookType["hideTooltip"]
}) {

    return <Group
        onMouseMove={(event) => {
            const { x } = localPoint(event) || { x: 0 };
            const nearest = data.reduce((prev, curr) =>
                Math.abs(xScale(curr.x)! - x) < Math.abs(xScale(prev.x)! - x) ? curr : prev
            );
            showTooltip({
                tooltipData: nearest,
                tooltipLeft: xScale(nearest.x),
                tooltipTop: yScale(nearest.y),
            });
        }}
        onMouseLeave={hideTooltip}
    >
        {data.map((d, i) => (
            <Circle
                key={`circle-${i}`}
                cx={xScale(d.x)}
                cy={yScale(d.y)}
                r={3}
                fill="var(--primary)"
            />
        ))}
    </Group>
}