import {Lines, View as VisualizationView} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {defaultStyles, useTooltip, useTooltipInPortal} from "@visx/tooltip";
import {Plotter, ValueType} from "@/components/visualizations/editor/plotter";
import useMeasure from "react-use-measure";
import {useEffect, useMemo, useRef} from "react";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {Zoom} from '@visx/zoom';
import {Group} from "@visx/group";
import {LinePath} from "@visx/shape";
import {curveMonotoneX} from "d3-shape";
import {localPoint} from "@visx/event";
import {AxisBottom, AxisLeft} from "@visx/axis";
import {TwoAxisTooltip} from "@/components/visualizations/two-axis-plot";
import { scaleLinear } from '@visx/scale';
import { zoomIdentity, ZoomTransform } from 'd3-zoom';

const toD3ZoomTransform = (matrix: TransformMatrix): ZoomTransform =>
    zoomIdentity
        .translate(matrix.translateX, matrix.translateY)
        .scale(matrix.scaleX); // assumes uniform scale

export const CurvePlot = ({
                              spec,
                              visualization,
                          }: {
    spec: Lines;
    visualization: VisualizationView;
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
    const zoomContainerRef = useRef<SVGRectElement | null>(null);
    const handleWheelRef = useRef<(e: WheelEvent) => void>(null);

    useEffect(() => {
        const node = zoomContainerRef.current;
        if (!node) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleWheelRef.current?.(e);
        };

        node.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            node.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const totalWidth = bounds.width || 400;
    const totalHeight = bounds.height || 300;

    const titleHeight = visualization.title ? 30 : 0;
    const captionHeight = visualization.caption ? 50 : 0;
    const reservedHeight = titleHeight + captionHeight;

    const svgWidth = totalWidth;
    const svgHeight = totalHeight - reservedHeight;

    const margin = {top: 20, right: 20, bottom: 50, left: 60};
    const innerWidth = svgWidth - margin.left - margin.right;
    const innerHeight = svgHeight - margin.top - margin.bottom;

    const plotter = useMemo(() => new Plotter(visualization.dataset.data, spec.xAxis, spec.yAxis, "CurvePlot"), [visualization.dataset.data, spec.xAxis, spec.yAxis]);
    const data = useMemo(() => plotter.prepareForPlot(), [plotter]);

    const xScale = plotter.getScale('x', innerWidth)
    const yScale = plotter.getScale('y', innerHeight)

    const initialTransform: TransformMatrix = {
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        skewX: 0,
        skewY: 0,
    };

    return (
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

            <Zoom
                width={innerWidth}
                height={innerHeight}
                scaleXMin={0.5}
                scaleXMax={10}
                scaleYMin={0.5}
                scaleYMax={10}
                initialTransformMatrix={initialTransform}
            >
                {zoom => {
                    handleWheelRef.current = zoom.handleWheel;
                    const d3Transform = toD3ZoomTransform(zoom.transformMatrix);
                    const transformedXScale = d3Transform.rescaleX(xScale)
                    const transformedYScale = d3Transform.rescaleY(yScale)
                    return <svg width={svgWidth} height={svgHeight}>
                        <defs>
                            <clipPath id="zoom-clip">
                                <rect width={innerWidth} height={innerHeight}/>
                            </clipPath>
                        </defs>
                        <Group top={margin.top} left={margin.left}>
                            <rect
                                ref={zoomContainerRef}
                                width={innerWidth}
                                height={innerHeight}
                                fill="transparent"
                                onWheel={(e) => {zoom.handleWheel(e)}}
                                onMouseDown={zoom.dragStart}
                                onMouseMove={zoom.dragMove}
                                onMouseUp={zoom.dragEnd}
                                onMouseLeave={() => {
                                    zoom.dragEnd();
                                    hideTooltip();
                                }}
                                onDoubleClick={(e) => {
                                    const point = localPoint(e);
                                    if (!point) return;
                                    zoom.scale({scaleX: 1.5, scaleY: 1.5, point});
                                }}
                            />
                            <Group clipPath="url(#zoom-clip)">
                                <LinePath
                                    data={data}
                                    x={(d) => transformedXScale(d.x) ?? 0}
                                    y={(d) => transformedYScale(d.y)}
                                    stroke="var(--primary)"
                                    strokeWidth={2}
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
                            </Group>
                            {/*data.map((d, i) => (
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
                    ))*/}
                            <AxisLeft
                                scale={transformedYScale}
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
                                scale={transformedXScale}
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
                }}
            </Zoom>

            {visualization.caption && (
                <div className="italic text-center text-[var(--text-light)] h-[20px] leading-[20px] mt-1">
                    {visualization.caption}
                </div>
            )}
        </div>
    );
};