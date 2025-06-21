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
import {fontSize} from "@mui/system";


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

    const plotter = useMemo(() => {
            const plotter = new Plotter(visualization.dataset.data, spec.xAxis, spec.yAxis, spec.$type)
            plotter.prepareForPlot()
            return plotter
        },
        [visualization.dataset.data, spec.xAxis, spec.yAxis, spec.$type]);

    const data = plotter.getDataPoints()

    const marginTop = 20
    const marginRight = 20

    const characterPxWidth = 6

    const maxYLabelLength = plotter.maxValueWidth('y') * characterPxWidth
    const maxXLabelLength = plotter.maxValueWidth('x') * characterPxWidth
    const yLabelSpacing = 10
    const yTickLabelsWidth = 6
    const marginLeft = maxYLabelLength + characterPxWidth + yLabelSpacing + yTickLabelsWidth
    const innerWidth = svgWidth - marginLeft - marginRight;

    const {scale: xScale, tickCount: xTickCount, error: xScaleError} = plotter.getScale('x', innerWidth)

    const availableWidthPerTick = innerWidth / xTickCount;
    const shouldRotateXTicks = maxXLabelLength > availableWidthPerTick;
    const xTickLabelAngle = shouldRotateXTicks ? -65 : 0;
    const xTickTextAnchor = shouldRotateXTicks ? 'end' : 'middle';
    const xTickDx = shouldRotateXTicks ? '0.25em' : '0.0em';
    const xTickDy = shouldRotateXTicks ? '-0.4em' : '0.0em';
    const XLabelOffset = shouldRotateXTicks ? Math.cos(xTickLabelAngle / 360 * 2 * 3.14) * maxXLabelLength + 5 : characterPxWidth
    const YLabelOffset = yLabelSpacing + 20
    const marginBottom = XLabelOffset + characterPxWidth + 10
    const innerHeight = svgHeight - marginTop - marginBottom;

    const {scale: yScale, tickCount: yTickCount, error: yScaleError} = plotter.getScale('y', innerHeight)

    if (xScaleError || yScaleError) {
        return (
            <div className="text-center text-[var(--text-light)] w-full h-full flex justify-center items-center">
                {xScaleError ?? yScaleError}.
            </div>
        )
    }
    const margin = {
        bottom: marginBottom,
        top: marginTop,
        left: marginLeft,
        right: marginRight
    }

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
                                label={spec.yLabel ?? spec.yAxis}
                                labelOffset={YLabelOffset}
                                labelProps={{
                                    fontSize: 12,
                                    fill: 'var(--text)'
                                }}
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
                                label={spec.xLabel ?? spec.xAxis}
                                labelOffset={XLabelOffset}
                                labelProps={{
                                    fontSize: 12,
                                    fill: 'var(--text)'
                                }}
                                tickLabelProps={() => ({
                                    fill: 'var(--text)',
                                    fontSize: 12,
                                    textAnchor: xTickTextAnchor,
                                    angle: xTickLabelAngle,
                                    dx: xTickDx,
                                    dy: xTickDy,
                                })}
                            />
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
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            No se encontraron las columnas especificadas en el dataset.
        </div>
    }

    return <TwoAxisPlotPlot spec={spec} visualization={visualization}/>
}