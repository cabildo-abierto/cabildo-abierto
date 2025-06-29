import {
    isBarplot, isHistogram, isLines, isOneAxisPlot, isScatterplot, isTwoAxisPlot, OneAxisPlot,
    TwoAxisPlot,
    View as VisualizationView
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {
    DatasetView,
    DatasetViewBasic, isDatasetView,
    isTopicsDatasetView,
    TopicsDatasetView
} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {CurvePlotContent} from "@/components/visualizations/curve-plot";
import {useTooltip, useTooltipInPortal} from "@visx/tooltip";
import {AxesPlotter, Plotter, ValueType} from "@/components/visualizations/editor/plotter";
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
import {ScatterplotContent} from "@/components/visualizations/scatterplot";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {PlotCaption, PlotTitle} from "@/components/visualizations/title";


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
    maxWidth?: number
    maxHeight?: number
}


function validColumn(column: string, dataset: DatasetView | DatasetViewBasic | TopicsDatasetView) {
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


function getScaleFactor(width: number, height: number, aspectRatio: number, title: boolean, caption: boolean) {
    const referenceMaxWidth = 700 - (title ? 30 : 0) - (caption ? 50 : 0)
    const referenceMaxHeight = 500 - (title ? 30 : 0) - (caption ? 50 : 0)

    let referenceWidth = referenceMaxWidth
    let referenceHeight = referenceWidth / aspectRatio
    if (referenceHeight > referenceMaxHeight) {
        referenceHeight = referenceMaxHeight
        referenceWidth = referenceHeight * aspectRatio
    }

    return {scaleFactorX: width / referenceWidth, scaleFactorY: height / referenceHeight}
}


export const TwoAxisPlotPlot = ({spec, visualization, maxWidth, maxHeight}: TwoAxisPlotProps) => {
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
        if (isDatasetView(visualization.dataset) || isTopicsDatasetView(visualization.dataset)) {
            const plotter = AxesPlotter.create(visualization.dataset.data, spec)
            plotter.prepareForPlot()
            return plotter
        } else {
            return null
        }
    }, [visualization.dataset, spec])

    if (!plotter) return <div>
        Configurá el conjunto de datos.
    </div>

    const data = plotter.getDataPoints()

    const aspectRatio = parseFloat(visualization.aspectRatio ?? "1.33")

    const totalWidth = maxWidth ?? bounds.width
    const totalHeight = maxHeight ?? Math.max(bounds.height, 400)

    if (!bounds.width || !bounds.height) return <div className={"w-full h-full"} ref={containerRef}><LoadingSpinner/>
    </div>

    const titleHeight = visualization.title ? 30 : 0
    const captionHeight = visualization.caption ? 50 : 0
    const reservedHeight = titleHeight + captionHeight

    const availableHeight = totalHeight - reservedHeight
    let svgWidth = totalWidth
    let svgHeight = totalWidth / aspectRatio

    if (svgHeight > availableHeight) {
        svgHeight = availableHeight
        svgWidth = availableHeight * aspectRatio
    }

    const {
        scaleFactorX,
        scaleFactorY
    } = getScaleFactor(svgWidth, svgHeight, aspectRatio, Boolean(visualization.title), Boolean(visualization.caption))

    const margin = {
        top: 10 * scaleFactorY,
        right: 0,
        left: (spec.dimensions?.marginLeft ?? 55) * scaleFactorX,
        bottom: (spec.dimensions?.marginBottom ?? 55) * scaleFactorY
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
        <div
            className="relative w-full h-full flex flex-col justify-center items-center space-y-2"
            ref={containerRef}
        >
            <PlotTitle
                title={visualization.title}
                fontSize={18 * Math.min(scaleFactorX, scaleFactorY)}
            />
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
                                    scaleFactorX={scaleFactorX}
                                    scaleFactorY={scaleFactorY}
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
                                    scaleFactorX={scaleFactorX}
                                    scaleFactorY={scaleFactorY}
                                />}
                            </Group>
                            <AxisLeft
                                scale={axisLeftScale}
                                stroke="var(--text-light)"
                                tickStroke="var(--text-light)"
                                label={yLabel}
                                labelOffset={(spec.dimensions?.yLabelOffset ?? 36) * Math.min(scaleFactorX, scaleFactorY)}
                                labelProps={{
                                    fontSize: (spec.dimensions?.yLabelFontSize ?? 14) * scaleFactorY,
                                    fill: 'var(--text)'
                                }}
                                tickLabelProps={() => ({
                                    fill: 'var(--text)',
                                    fontSize: (spec.dimensions?.yTickLabelsFontSize ?? 12) * scaleFactorY,
                                    textAnchor: 'end',
                                    dx: '-0.25em',
                                    dy: '0.25em',
                                })}
                                tickLength={3 * scaleFactorX}
                            />
                            <AxisBottom
                                top={plotInnerHeight}
                                scale={axisBottomScale}
                                stroke="var(--text-light)"
                                tickStroke="var(--text-light)"
                                label={spec.xLabel ?? spec.xAxis}
                                numTicks={(plotter.isBarplot() || plotter.isHistogram()) ? 1000000 : undefined}
                                labelOffset={(spec.dimensions?.xLabelOffset ?? 8) * Math.min(scaleFactorX, scaleFactorY)}
                                labelProps={{
                                    fontSize: (spec.dimensions?.xLabelFontSize ?? 14) * scaleFactorX,
                                    fill: 'var(--text)'
                                }}
                                tickLabelProps={() => ({
                                    fill: 'var(--text)',
                                    fontSize: (spec.dimensions?.xTickLabelsFontSize ?? 12) * scaleFactorX,
                                    textAnchor: spec.dimensions?.xTickLabelsAngle != 0 ? 'end' : 'middle',
                                    angle: -spec.dimensions?.xTickLabelsAngle,
                                    dx: spec.dimensions?.xTickLabelsAngle != 0 ? '0.25em' : '0.0em',
                                })}
                                tickLength={3 * scaleFactorY}
                            />
                        </Group>
                    </svg>
                }}
            </Zoom>
            <PlotCaption caption={visualization.caption} fontSize={14 * Math.min(scaleFactorX, scaleFactorY)}/>
        </div>
    );
}


const TwoAxisPlotComp = ({spec, visualization, maxWidth, maxHeight}: TwoAxisPlotProps) => {

    if (!spec.xAxis || spec.xAxis.length == 0) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Elegí un eje x.
        </div>
    }

    if (!isDatasetView(visualization.dataset) && !isTopicsDatasetView(visualization.dataset)) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Configurá el conjunto de datos.
        </div>
    }

    if (isOneAxisPlot(spec) && !validColumn(spec.xAxis, visualization.dataset)) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            No se encontró la columna especificada en los datos.
        </div>
    }

    if (isTwoAxisPlot(spec)) {
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


    return <TwoAxisPlotPlot spec={spec} visualization={visualization} maxWidth={maxWidth} maxHeight={maxHeight}/>
}


export default TwoAxisPlotComp