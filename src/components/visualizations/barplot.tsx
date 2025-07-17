import {DataPoint, TooltipHookType} from "@/components/visualizations/editor/plotter";
import {Bar} from "@visx/shape";
import {localPoint} from "@visx/event";
import {ScaleBand} from "d3-scale";
import {ScaleLinear} from "d3-scale";


export function BarplotContent<X>({data, xScale, yScale, innerHeight, hideTooltip, showTooltip}: {
    data: DataPoint[]
    xScale: ScaleBand<X>
    yScale: ScaleLinear<number, number>
    innerHeight: number
    showTooltip: TooltipHookType["showTooltip"]
    hideTooltip: TooltipHookType["hideTooltip"]
}) {

    return <>
        {data.map((d, i) => {
            const barWidth = xScale.bandwidth();
            const barHeight = innerHeight - yScale(d.y as number);
            const barX = xScale(d.x as X)
            const barY = yScale(d.y as number)

            if (barX == null || isNaN(barY) || isNaN(barX) || isNaN(barHeight)) return null;

            return (
                <Bar
                    key={`bar-${i}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill="var(--primary)"
                    onMouseLeave={() => hideTooltip()}
                    onMouseMove={(event) => {
                        const eventSvgCoords = localPoint(event);
                        const left = barX + barWidth / 2;
                        showTooltip({
                            tooltipData: {x: d.x, y: d.y},
                            tooltipTop: eventSvgCoords?.y,
                            tooltipLeft: left,
                        });
                    }}
                />
            );
        })}
    </>
}