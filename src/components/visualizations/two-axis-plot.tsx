import {$Typed} from "@atproto/api";
import {
    Barplot as BarplotSpec, isBarplot, isLines,
    Lines,
    Scatterplot,
    View as VisualizationView
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {CurvePlotContent} from "@/components/visualizations/curve-plot";
import {useTooltip, useTooltipInPortal} from "@visx/tooltip";
import {Plotter, ValueType} from "@/components/visualizations/editor/plotter";
import useMeasure from "react-use-measure";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {Zoom} from "@visx/zoom";
import {Group} from "@visx/group";
import {localPoint} from "@visx/event";
import {AxisBottom, AxisLeft} from "@visx/axis";
import {zoomIdentity, ZoomTransform} from 'd3-zoom';
import {BarplotContent} from "@/components/visualizations/barplot"
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale"


export function TwoAxisTooltip({xLabel, yLabel, xValue, yValue}: {
    xLabel: string,
    yLabel: string,
    xValue: string,
    yValue: string
}) {
    return (
        <div className={"bg-[var(--background)] border-2 border-black p-1 text-sm"}>
            <div className={"flex justify-between space-x-2"}>
                <div className={"font-bold"}>{yLabel}</div>
                <div>{yValue}</div>
            </div>
            <div className={"flex justify-between space-x-2"}>
                <span className={"font-bold"}>{xLabel}</span>
                <div>{xValue}</div>
            </div>
        </div>
    )
}


type TwoAxisPlotSpec = $Typed<BarplotSpec> | $Typed<Lines> | $Typed<Scatterplot>


type TwoAxisPlotProps = {
    spec: TwoAxisPlotSpec
    visualization: VisualizationView
}


function validColumn(column: string, dataset: DatasetView | DatasetViewBasic) {
    return dataset.columns.some(c => c.name === column)
}


const toD3ZoomTransform = (matrix: TransformMatrix): ZoomTransform =>
    zoomIdentity
        .translate(matrix.translateX, matrix.translateY)
        .scale(matrix.scaleX); // assumes uniform scale


export const TwoAxisPlotPlot = ({spec, visualization}: TwoAxisPlotProps) => {
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip<{ x: ValueType; y: ValueType }>();

    const {containerRef: tooltipContainerRef, TooltipInPortal} = useTooltipInPortal({scroll: true});
    const [measureRef, bounds] = useMeasure();

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        tooltipContainerRef(node);
        measureRef(node);
    }, [tooltipContainerRef, measureRef]);

    const zoomContainerRef = useRef<SVGRectElement | null>(null);
    const handleWheelRef = useRef<(e: WheelEvent) => void>(null);

    useEffect(() => {
        const node = zoomContainerRef.current;
        if (!node) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (handleWheelRef.current) {
                handleWheelRef.current?.(e);
            }
        };

        node.addEventListener("wheel", handleWheel, {passive: false});

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

    const plotter = useMemo(() => new Plotter(visualization.dataset.data, spec.xAxis, spec.yAxis, spec.$type), [visualization.dataset.data, spec.xAxis, spec.yAxis, spec.$type]);
    const data = useMemo(() => plotter.prepareForPlot(), [plotter]);

    const xScale = plotter.getScale('x', innerWidth)
    const yScale = plotter.getScale('y', innerHeight)

    const allowZoom = plotter.isCurvePlot()

    const initialTransform: TransformMatrix = {
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        skewX: 0,
        skewY: 0,
    };

    return (
        <div className="relative w-full h-full" ref={containerRef}>
            {visualization.title && (
                <div className="text-center font-semibold text-lg h-[30px] pt-2 items-baseline flex justify-center">
                    {visualization.title}
                </div>
            )}
            {tooltipOpen && tooltipData && (
                <TooltipInPortal
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={{
                        position: "absolute",
                        zIndex: 2000,
                        pointerEvents: "none",
                    }}
                >
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

                    let axisLeftScale
                    let axisBottomScale

                    if (allowZoom) {
                        const d3Transform = toD3ZoomTransform(zoom.transformMatrix);
                        axisBottomScale = d3Transform.rescaleY(xScale)
                        axisLeftScale = d3Transform.rescaleX(yScale)
                    } else {
                        axisBottomScale = xScale
                        axisLeftScale = yScale
                    }

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
                                onWheel={(e) => {
                                    zoom.handleWheel(e)
                                }}
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
                                {isLines(spec) && <CurvePlotContent
                                    transformMatrix={zoom.transformMatrix}
                                    xScale={xScale as ScaleLinear<number, number> | ScaleTime<number, number>}
                                    yScale={yScale as ScaleLinear<number, number>}
                                    data={data}
                                    showTooltip={showTooltip}
                                    hideTooltip={hideTooltip}
                                />}
                                {isBarplot(spec) && <BarplotContent
                                    xScale={xScale as ScaleBand<string>}
                                    yScale={yScale as ScaleLinear<number, number>}
                                    data={data}
                                    innerHeight={innerHeight}
                                    hideTooltip={hideTooltip}
                                    showTooltip={showTooltip}
                                />}
                            </Group>
                            <AxisLeft
                                scale={axisLeftScale}
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
                                scale={axisBottomScale}
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
                <div className="italic text-center text-[var(--text-light)] h-[20px] leading-[20px] mt-1 px-2 break-all"
                     style={{maxWidth: svgWidth}}>
                    {visualization.caption}
                </div>
            )}
        </div>
    );
}


export const TwoAxisPlot = ({spec, visualization}: TwoAxisPlotProps) => {
    const {xAxis, yAxis} = spec;

    if (!xAxis || xAxis.length == 0) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Elegí un eje x.
        </div>
    }
    if (!yAxis || yAxis.length == 0) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Elegí un eje y.
        </div>
    }

    if (!validColumn(xAxis, visualization.dataset) || !validColumn(yAxis, visualization.dataset)) {
        return <div className={"text-[var(--text-light)]"}>
            No se encontraron las columnas especificadas en el dataset.
        </div>
    }

    return <TwoAxisPlotPlot spec={spec} visualization={visualization}/>
}