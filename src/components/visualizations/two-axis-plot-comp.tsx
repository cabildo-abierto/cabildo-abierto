import {
    isBarplot, isHistogram, isLines, isOneAxisPlot, isScatterplot, isTwoAxisPlot, OneAxisPlot,
    TwoAxisPlot,
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
import {$Typed} from "@atproto/api";
import {pxToNumber} from "@/utils/strings";
import {ScatterplotContent} from "@/components/visualizations/scatterplot";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";


const PlotCaption = ({caption}: { caption?: string }) => {
    if (!caption) return null;

    return <div
        className="italic text-center text-[var(--text-light)] h-[20px] leading-[20px] mt-1 px-2 break-all"
    >
        {caption}
    </div>
}

const PlotTitle = ({title}: { title?: string }) => {
    if (!title) return null;
    return <div
        className="text-center font-semibold text-lg h-[30px] pt-2 items-baseline flex justify-center"
    >
        {title}
    </div>
}


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


type TwoAxisPlotProps = {
    spec: $Typed<TwoAxisPlot> | $Typed<OneAxisPlot>
    visualization: VisualizationView
}


function validColumn(column: string, dataset: DatasetView | DatasetViewBasic) {
    return dataset.columns.some(c => c.name === column)
}


const toD3ZoomTransform = (matrix: TransformMatrix): ZoomTransform =>
    zoomIdentity
        .translate(matrix.translateX, matrix.translateY)
        .scale(matrix.scaleX); // assumes uniform scale


const initialTransform: TransformMatrix = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
}


export const TwoAxisPlotPlot = ({spec, visualization}: TwoAxisPlotProps) => {
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip<{ x: ValueType; y: ValueType }>();

    const {containerRef: tooltipContainerRef, TooltipInPortal} = useTooltipInPortal({scroll: true})
    const [measureRef, bounds] = useMeasure()

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        tooltipContainerRef(node)
        measureRef(node)
    }, [tooltipContainerRef, measureRef])

    const zoomContainerRef = useRef<SVGRectElement | null>(null)
    const handleWheelRef = useRef<(e: WheelEvent) => void>(null)

    useEffect(() => {
        const node = zoomContainerRef.current
        if (!node) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (handleWheelRef.current) {
                handleWheelRef.current?.(e)
            }
        }

        node.addEventListener("wheel", handleWheel, {passive: false})

        return () => {
            node.removeEventListener("wheel", handleWheel)
        }
    }, [])

    const plotter = useMemo(() => {
        const plotter = Plotter.create(visualization.dataset.data, spec)
        plotter.prepareForPlot()
        return plotter
    }, [visualization.dataset.data, spec])

    const data = plotter.getDataPoints()

    const aspectRatio = parseFloat(visualization.aspectRatio ?? "1.33")

    const totalWidth = bounds.width
    const totalHeight = bounds.height

    if(!bounds.width || !bounds.height) return <div className={"w-full h-full"} ref={containerRef}><LoadingSpinner/></div>

    const titleHeight = visualization.title ? 30 : 0
    const captionHeight = visualization.caption ? 50 : 0
    const reservedHeight = titleHeight + captionHeight

    const availableHeight = totalHeight - reservedHeight
    let svgWidth = totalWidth
    let svgHeight = totalWidth / aspectRatio

    if(svgHeight > availableHeight){
        svgHeight = availableHeight
        svgWidth = availableHeight * aspectRatio
    }

    const margin = {
        top: 0,
        right: 0,
        left: spec.dimensions?.marginLeft ?? 55,
        bottom: spec.dimensions?.marginBottom ?? 55
    }

    const plotInnerWidth = svgWidth - margin.left - margin.right
    const plotInnerHeight = svgHeight - margin.top - margin.bottom

    const {scale: xScale, error: xScaleError} = plotter.getScale('x', plotInnerWidth)
    const {scale: yScale, error: yScaleError} = plotter.getScale('y', plotInnerHeight)

    if (xScaleError || yScaleError) {
        return (
            <div className="text-center text-[var(--text-light)] w-full h-full flex justify-center items-center">
                {xScaleError ?? yScaleError}.
            </div>
        )
    }

    const allowZoom = plotter.isCurvePlot() || plotter.isScatterPlot()
    const randId = Math.random().toString()

    const yLabel = isTwoAxisPlot(spec) ? spec.yLabel ?? spec.yAxis : "Cantidad"

    return (
        <div className="relative w-full h-full flex flex-col justify-center items-center" ref={containerRef}>
            <PlotTitle title={visualization.title}/>
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
                        yLabel={yLabel}
                        xValue={plotter.xValueToString(tooltipData.x)}
                        yValue={plotter.yValueToString(tooltipData.y)}
                    />
                </TooltipInPortal>
            )}

            <Zoom
                width={plotInnerWidth}
                height={plotInnerHeight}
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
                        axisBottomScale = d3Transform.rescaleX(xScale)
                        axisLeftScale = d3Transform.rescaleY(yScale)
                    } else {
                        axisBottomScale = xScale
                        axisLeftScale = yScale
                    }

                    return <svg width={svgWidth} height={svgHeight}>
                        <defs>
                            <clipPath id={`zoom-clip-${randId}`}>
                                <rect width={plotInnerWidth} height={plotInnerHeight}/>
                            </clipPath>
                        </defs>
                        <Group top={margin.top} left={margin.left}>
                            <rect
                                ref={zoomContainerRef}
                                width={plotInnerWidth}
                                height={plotInnerHeight}
                                fill={"transparent"}
                                onWheel={(e) => {
                                    zoom.handleWheel(e)
                                }}
                                onMouseDown={zoom.dragStart}
                                onMouseMove={zoom.dragMove}
                                onMouseUp={zoom.dragEnd}
                                onMouseLeave={() => {
                                    zoom.dragEnd()
                                    hideTooltip()
                                }}
                                onDoubleClick={(e) => {
                                    const point = localPoint(e);
                                    if (!point) return;
                                    zoom.scale({scaleX: 1.5, scaleY: 1.5, point});
                                }}
                            />
                            <Group clipPath={`url(#zoom-clip-${randId})`}>
                                {isLines(spec.plot) && <CurvePlotContent
                                    xScale={axisBottomScale as ScaleLinear<number, number> | ScaleTime<number, number>}
                                    yScale={axisLeftScale as ScaleLinear<number, number>}
                                    data={data}
                                    showTooltip={showTooltip}
                                    hideTooltip={hideTooltip}
                                />}
                                {(isBarplot(spec.plot) || isHistogram(spec.plot)) && <BarplotContent
                                    xScale={axisBottomScale as ScaleBand<string>}
                                    yScale={axisLeftScale as ScaleLinear<number, number>}
                                    data={data}
                                    innerHeight={plotInnerHeight}
                                    hideTooltip={hideTooltip}
                                    showTooltip={showTooltip}
                                />}
                                {isScatterplot(spec.plot) && <ScatterplotContent
                                    xScale={axisBottomScale as ScaleLinear<number, number> | ScaleTime<number, number>}
                                    yScale={axisLeftScale as ScaleLinear<number, number>}
                                    data={data}
                                    innerHeight={plotInnerHeight}
                                    hideTooltip={hideTooltip}
                                    showTooltip={showTooltip}
                                />}
                            </Group>
                            <AxisLeft
                                scale={axisLeftScale}
                                stroke="var(--text-light)"
                                tickStroke="var(--text-light)"
                                label={yLabel}
                                labelOffset={spec.dimensions?.yLabelOffset}
                                labelProps={{
                                    fontSize: spec.dimensions?.yLabelFontSize ?? 14,
                                    fill: 'var(--text)'
                                }}
                                tickLabelProps={() => ({
                                    fill: 'var(--text)',
                                    fontSize: spec.dimensions?.yTickLabelsFontSize ?? 12,
                                    textAnchor: 'end',
                                    dx: '-0.25em',
                                    dy: '0.25em',
                                })}
                            />
                            <AxisBottom
                                top={plotInnerHeight}
                                scale={axisBottomScale}
                                stroke="var(--text-light)"
                                tickStroke="var(--text-light)"
                                label={spec.xLabel ?? spec.xAxis}
                                labelOffset={spec.dimensions?.xLabelOffset}
                                labelProps={{
                                    fontSize: spec.dimensions?.xLabelFontSize ?? 14,
                                    fill: 'var(--text)'
                                }}
                                tickLabelProps={() => ({
                                    fill: 'var(--text)',
                                    fontSize: spec.dimensions?.xTickLabelsFontSize ?? 12,
                                    textAnchor: spec.dimensions?.xTickLabelsAngle != 0 ? 'end' : 'middle',
                                    angle: -spec.dimensions?.xTickLabelsAngle,
                                    dx: spec.dimensions?.xTickLabelsAngle != 0 ? '0.25em' : '0.0em',
                                })}
                            />
                        </Group>
                    </svg>
                }}
            </Zoom>
            <PlotCaption caption={visualization.caption}/>
        </div>
    );
}


const TwoAxisPlotComp = ({spec, visualization}: TwoAxisPlotProps) => {

    if (!spec.xAxis || spec.xAxis.length == 0) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Elegí un eje x.
        </div>
    }
    if(isOneAxisPlot(spec) && !validColumn(spec.xAxis, visualization.dataset)){
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            No se encontró la columna especificada en los datos.
        </div>
    }

    if(isTwoAxisPlot(spec)){
        if (!spec.yAxis || spec.yAxis.length == 0) {
            return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
                Elegí un eje y.
            </div>
        }

        if (!validColumn(spec.xAxis, visualization.dataset) || !validColumn(spec.yAxis, visualization.dataset)) {
            return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
                No se encontraron las columnas especificadas en los datos.
            </div>
        }
    }


    return <TwoAxisPlotPlot spec={spec} visualization={visualization}/>
}


export default TwoAxisPlotComp