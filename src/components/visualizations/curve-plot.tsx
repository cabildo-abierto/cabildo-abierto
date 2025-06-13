import {DataPoint, TooltipHookType} from "@/components/visualizations/editor/plotter";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {LinePath} from "@visx/shape";
import {curveMonotoneX} from "d3-shape";
import {localPoint} from "@visx/event";
import {zoomIdentity, ZoomTransform} from 'd3-zoom';
import {ScaleLinear, ScaleTime} from "d3-scale";


const toD3ZoomTransform = (matrix: TransformMatrix): ZoomTransform =>
    zoomIdentity
        .translate(matrix.translateX, matrix.translateY)
        .scale(matrix.scaleX); // assumes uniform scale


export function CurvePlotContent<X, Y>({data, xScale, yScale, showTooltip, hideTooltip, transformMatrix}: {
    data: DataPoint[],
    xScale: ScaleLinear<number, number> | ScaleTime<number, number>
    yScale: ScaleLinear<number, number>
    showTooltip: TooltipHookType["showTooltip"]
    hideTooltip: TooltipHookType["hideTooltip"]
    transformMatrix: TransformMatrix
}) {
    const d3Transform = toD3ZoomTransform(transformMatrix);
    const transformedXScale = d3Transform.rescaleX(xScale)
    const transformedYScale = d3Transform.rescaleY(yScale)

    return <LinePath
        data={data}
        x={(d) => transformedXScale(d.x) ?? 0}
        y={(d) => transformedYScale(d.y)}
        stroke="var(--primary)"
        strokeWidth={2}
        curve={curveMonotoneX}
        onMouseMove={(event) => {
            const {x} = localPoint(event) || {x: 0};
            const nearest = data.reduce((prev, curr) =>
                Math.abs(transformedXScale(curr.x)! - x) < Math.abs(transformedXScale(prev.x)! - x) ? curr : prev
            );
            showTooltip({
                tooltipData: nearest,
                tooltipLeft: transformedXScale(nearest.x),
                tooltipTop: transformedYScale(nearest.y),
            });
        }}
        onMouseLeave={() => hideTooltip()}
    />


    /*data.map((d, i) => (
                        <circle
                            key={`point-${i}`}
                            cx={xScale(d.x)}
                            cy={yScale(d.y)}
                            r={4}
                            fill="var(--primary)"
                            onMouseMove={(event) => {
                                const coords = localPoint(event);
                                if (!coords) return;
                                showTooltip({
                                    tooltipData: d,
                                    tooltipLeft: coords.x,
                                    tooltipTop: coords.y,
                                });
                            }}
                            onMouseLeave={hideTooltip}
                        />
                    ))*/
}