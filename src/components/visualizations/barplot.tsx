import {Barplot as BarplotSpec, View as VisualizationView} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {defaultStyles, useTooltip, useTooltipInPortal} from "@visx/tooltip";
import {Plotter, ValueType} from "@/components/visualizations/editor/plotter";
import useMeasure from "react-use-measure";
import {scaleBand, scaleLinear} from "@visx/scale";
import {Group} from "@visx/group";
import {Bar, LinePath} from "@visx/shape";
import {localPoint} from "@visx/event";
import {AxisBottom, AxisLeft} from "@visx/axis";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {TwoAxisTooltip} from "@/components/visualizations/two-axis-plot";
import {useMemo} from "react";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {curveMonotoneX} from "d3-shape";
import {ScaleBand} from "d3-scale";

function groupSameX(data: any[], xAxis: string, yAxis: string) {
    const grouped = new Map<string, number[]>();

    data.forEach((d: any) => {
        const xVal = d[xAxis]
        const yRaw = d[yAxis]
        const yVal = typeof yRaw === 'number' ? yRaw : parseFloat(yRaw)

        if (xVal != null && !isNaN(yVal)) {
            if (!grouped.has(xVal)) {
                grouped.set(xVal, [])
            }
            grouped.get(xVal)!.push(yVal)
        }
    });

    return Array.from(grouped.entries()).map(([x, ys]) => ({
        x,
        y: ys.reduce((sum, val) => sum + val, 0) / ys.length,
    }))
}


export const Barplot = ({spec, visualization}: {
    spec: BarplotSpec,
    visualization: VisualizationView
}) => {
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip<{ x: ValueType; y: ValueType }>();

    const {containerRef, TooltipInPortal} = useTooltipInPortal({scroll: true});
    const [ref, bounds] = useMeasure();

    const totalWidth = bounds.width || 400;
    const totalHeight = bounds.height || 300;

    // Assume fixed space for title and caption
    const titleHeight = visualization.title ? 30 : 0;
    const captionHeight = visualization.caption ? 50 : 0;
    const reservedHeight = titleHeight + captionHeight;

    const svgWidth = totalWidth;
    const svgHeight = totalHeight - reservedHeight;

    const margin = {top: 20, right: 20, bottom: 50, left: 60};
    const innerWidth = svgWidth - margin.left - margin.right;
    const innerHeight = svgHeight - margin.top - margin.bottom;

    const plotter = useMemo(() => new Plotter(visualization.dataset.data, spec.xAxis, spec.yAxis, "Barplot"), [visualization.dataset.data, spec.xAxis, spec.yAxis]);
    const data = useMemo(() => plotter.prepareForPlot(), [plotter]);

    const xScale = plotter.getScale('x', innerWidth)
    const yScale = plotter.getScale('y', innerHeight)

    return (
        /*<div className="relative w-full h-full" ref={ref}>
            {visualization.title && (
                <div className="text-center font-semibold text-lg h-[30px] pt-2 items-baseline flex justify-center">
                    {visualization.title}
                </div>
            )}
            {tooltipOpen && tooltipData && (
                <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={{...defaultStyles, zIndex: 2000}}>
                    <TwoAxisTooltip
                        xLabel={spec.xLabel ?? spec.xAxis}
                        yLabel={spec.yLabel ?? spec.yAxis}
                        xValue={plotter.xValueToString(tooltipData.x)}
                        yValue={plotter.yValueToString(tooltipData.y)}
                    />
                </TooltipInPortal>
            )}

            <svg ref={containerRef} width={svgWidth} height={svgHeight}>
            <Group top={margin.top} left={margin.left}>
                {data.map((d, i) => {
                    const barWidth = (xScale as ScaleBand<string>).bandwidth();
                    const barHeight = innerHeight - yScale(d.y);
                    const barX = xScale(d.x);
                    const barY = yScale(d.y);
                    if (barX == null || isNaN(barY) || isNaN(barHeight)) return null;

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
                <AxisLeft
                    scale={yScale}
                    stroke="var(--text-light)"
                    tickStroke="var(--text-light)"
                    tickLabelProps={() => ({
                        fill: 'var(--text)',
                        fontSize: 12,
                        textAnchor: 'end',
                        dx: '-0.25em',
                        dy: '0.25em',
                    })}
                />
                <AxisBottom
                    top={innerHeight}
                    scale={xScale}
                    stroke="var(--text-light)"
                    tickStroke="var(--text-light)"
                    tickLabelProps={() => ({
                        fill: 'var(--text)',
                        fontSize: 12,
                        textAnchor: 'middle',
                    })}
                />
                <text
                    x={-innerHeight / 2}
                    y={-margin.left + 15}
                    transform="rotate(-90)"
                    textAnchor="middle"
                    fontSize={14}
                    fill="var(--text)"
                >
                    {spec.yLabel ?? spec.yAxis}
                </text>
                <text
                    x={innerWidth / 2}
                    y={innerHeight + 40}
                    textAnchor="middle"
                    fontSize={14}
                    fill="var(--text)"
                >
                    {spec.xLabel ?? spec.xAxis}
                </text>
            </Group>
            </svg>
        </div>*/

        <div className="relative w-full h-full" ref={ref}>
            {visualization.title && (
                <div className="text-center font-semibold text-lg h-[30px] pt-2 items-baseline flex justify-center">
                    {visualization.title}
                </div>
            )}

            {tooltipOpen && tooltipData && (
                <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={{...defaultStyles, zIndex: 2000}}>
                    <TwoAxisTooltip
                        xLabel={spec.xLabel ?? spec.xAxis}
                        yLabel={spec.yLabel ?? spec.yAxis}
                        xValue={plotter.xValueToString(tooltipData.x)}
                        yValue={plotter.yValueToString(tooltipData.y)}
                    />
                </TooltipInPortal>
            )}

            <svg ref={containerRef} width={svgWidth} height={svgHeight}>
                <Group left={margin.left} top={margin.top}>
                    {data.map((d, i) => {
                        const barWidth = (xScale as ScaleBand<string>).bandwidth();
                        const barHeight = innerHeight - yScale(d.y);
                        const barX = xScale(d.x);
                        const barY = yScale(d.y);
                        if (barX == null || isNaN(barY) || isNaN(barHeight)) return null;

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
                    <AxisLeft
                        scale={yScale}
                        stroke="var(--text-light)"
                        tickStroke="var(--text-light)"
                        tickLabelProps={() => ({
                            fill: 'var(--text)',
                            fontSize: 12,
                            textAnchor: 'end',
                            dx: '-0.25em',
                            dy: '0.25em',
                        })}
                    />
                    <AxisBottom
                        top={innerHeight}
                        scale={xScale}
                        stroke="var(--text-light)"
                        tickStroke="var(--text-light)"
                        tickLabelProps={() => ({
                            fill: 'var(--text)',
                            fontSize: 12,
                            textAnchor: 'middle',
                        })}
                    />
                    <text
                        x={-innerHeight / 2}
                        y={-margin.left + 15}
                        transform="rotate(-90)"
                        textAnchor="middle"
                        fontSize={14}
                        fill="var(--text)"
                    >
                        {spec.yLabel ?? spec.yAxis}
                    </text>
                    <text
                        x={innerWidth / 2}
                        y={innerHeight + 40}
                        textAnchor="middle"
                        fontSize={14}
                        fill="var(--text)"
                    >
                        {spec.xLabel ?? spec.xAxis}
                    </text>
                </Group>
            </svg>
            {visualization.caption && (
                <div className="italic text-center text-[var(--text-light)] mt-1 px-2 break-words w-full max-w-full">
                    {visualization.caption}
                </div>
            )}
        </div>
    )
};


export const BarplotContent = ({data, xScale, yScale, innerHeight, hideTooltip, showTooltip}: {
    data: DataPoint[], xScale: ScaleBand, yScale: ScaleLinear, innerHeight: number,
    hideTooltip: () => void
    showTooltip: () => void
}) => {
    return <>
        {data.map((d, i) => {
            console.log("plotting bar", xScale, yScale, data)
            const barWidth = xScale.bandwidth();
            const barHeight = innerHeight - yScale(d.y);
            const barX = xScale(d.x);
            const barY = yScale(d.y);
            if (barX == null || isNaN(barY) || isNaN(barHeight)) return null;

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