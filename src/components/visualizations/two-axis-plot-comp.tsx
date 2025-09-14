import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {
    DatasetView,
    DatasetViewBasic, isDatasetView,
    isTopicsDatasetView,
    TopicsDatasetView
} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {CurvePlotContent} from "@/components/visualizations/curve-plot";
import {useTooltip, useTooltipInPortal} from "@visx/tooltip";
import {DataPoint, ValueType} from "@/components/visualizations/editor/plotter/plotter";
import useMeasure from "react-use-measure";
import {useCallback, useMemo} from "react";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {Zoom} from "@visx/zoom";
import {Group} from "@visx/group";
import {localPoint} from "@visx/event";
import {AxisBottom, AxisLeft} from "@visx/axis";
import {zoomIdentity, ZoomTransform} from 'd3-zoom';
import {BarplotContent} from "@/components/visualizations/barplot"
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale"
import {$Typed} from "@/lex-api/util";
import {ScatterplotContent} from "@/components/visualizations/scatterplot";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {PlotCaption, PlotTitle} from "@/components/visualizations/title";
import {createAxesPlotter} from "@/components/visualizations/editor/plotter/plotter-factory";
import {AxesPlotter} from "@/components/visualizations/editor/plotter/axes-plotter";
import {isTwoAxisPlotter} from "@/components/visualizations/editor/plotter/two-axis-plotter";


export function TwoAxisTooltip({plotter, xLabel, yLabel, xValue, yValues}: {
    plotter: AxesPlotter
    xLabel: string
    yLabel: string
    xValue: string
    yValues: { value: string, label: string, selected: boolean }[]
}) {
    return (
        <div className={"bg-[var(--background)] border-2 border-[var(--text)] p-1 text-sm"}>
            <div className={"flex justify-between space-x-2"}>
                <span className={"font-bold"}>{xLabel}</span>
                <div className={"font-bold"}>{xValue}</div>
            </div>
            <div>
                {yValues.map((v, index) => {
                    return <div key={index} className={"flex justify-between items-center space-x-2"}>
                        <div className={"flex space-x-1 items-center"}>
                            <div
                                className={"w-3 h-3 rounded-full"}
                                 style={{backgroundColor: plotter.getLabelColor(v.label)}}
                            />
                            <div className={v.selected ? "font-bold" : "text-[var(--text-light)]"}>
                                {v.label ?? yLabel}
                            </div>
                        </div>
                        <div className={v.selected ? "font-bold" : "text-[var(--text-light)]"}>
                            {v.value}
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}


type TwoAxisPlotProps = {
    spec: $Typed<ArCabildoabiertoEmbedVisualization.TwoAxisPlot> | $Typed<ArCabildoabiertoEmbedVisualization.OneAxisPlot>
    visualization: ArCabildoabiertoEmbedVisualization.View
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
    } = useTooltip<{ x: ValueType; y: ValueType }>()
    const {containerRef: tooltipContainerRef, TooltipInPortal} = useTooltipInPortal({scroll: true})
    const [measureRef, bounds] = useMeasure()

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        tooltipContainerRef(node)
        measureRef(node)
    }, [tooltipContainerRef, measureRef])

    const {plotter, error} = useMemo(() => {
        if (isDatasetView(visualization.dataset) || isTopicsDatasetView(visualization.dataset)) {
            try {
                const plotter = createAxesPlotter(spec, visualization.dataset, visualization.visualization.filters)
                const {error} = plotter.prepareForPlot()
                if (error) {
                    return {error}
                }
                return {plotter}
            } catch (err) {
                if (err instanceof Error) {
                    console.log("error plotting", err)
                    return {error: err.message}
                } else {
                    return {error: "Ocurrió un error intentando crear el gráfico."}
                }
            }
        } else {
            return {error: "Configurá el conjunto de datos."}
        }
    }, [visualization.dataset, spec])

    if (!plotter) return <div className={"w-full h-full flex justify-center items-center text-[var(--text-light)]"}>
        {error}
    </div>

    const data = plotter.getDataPoints()

    const vis = visualization.visualization

    const aspectRatio = parseFloat(vis.aspectRatio ?? "1.33")

    const totalWidth = maxWidth ?? bounds.width
    const totalHeight = maxHeight ?? Math.max(bounds.height, 400)

    if (!bounds.width || !bounds.height) return <div className={"w-full h-full"} ref={containerRef}>
        <LoadingSpinner/>
    </div>

    const titleHeight = vis.title ? 30 : 0
    const captionHeight = vis.caption ? 50 : 0
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
    } = getScaleFactor(svgWidth, svgHeight, aspectRatio, Boolean(vis.title), Boolean(vis.caption))

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

    const yLabel = ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(spec) ? spec.yLabel ?? (spec.yAxis ?? "") : "Cantidad"

    return (
        <div
            className="relative w-full h-full flex flex-col justify-center items-center space-y-2 overflow-clip"
            ref={containerRef}
        >
            <div style={{height: titleHeight, maxWidth: svgWidth}}>
                <PlotTitle
                    title={vis.title}
                    fontSize={18 * Math.min(scaleFactorX, scaleFactorY)}
                />
            </div>
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
                        plotter={plotter}
                        xLabel={spec.xLabel ?? spec.xAxis}
                        yLabel={yLabel}
                        xValue={plotter.xValueToString(tooltipData.x)}
                        yValues={plotter.getTooltipYValues(tooltipData)}
                    />
                </TooltipInPortal>
            )}

            <Zoom<SVGSVGElement>
                width={plotInnerWidth}
                height={plotInnerHeight}
                scaleXMin={0.5}
                scaleXMax={10}
                scaleYMin={0.5}
                scaleYMax={10}
                initialTransformMatrix={initialTransform}
            >
                {zoom => {
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

                    return <svg
                        width={svgWidth}
                        height={svgHeight}
                        style={{cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none'}}
                        ref={zoom.containerRef}
                    >
                        <defs>
                            <clipPath id={`zoom-clip-${randId}`}>
                                <rect width={plotInnerWidth} height={plotInnerHeight}/>
                            </clipPath>
                        </defs>
                        <Group top={margin.top} left={margin.left}>
                            <rect
                                width={plotInnerWidth}
                                height={plotInnerHeight}
                                fill={"transparent"}
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
                                {ArCabildoabiertoEmbedVisualization.isLines(spec.plot) && isTwoAxisPlotter(plotter) && <CurvePlotContent
                                    plotter={plotter}
                                    xScale={axisBottomScale as ScaleLinear<number, number> | ScaleTime<number, number>}
                                    yScale={axisLeftScale as ScaleLinear<number, number>}
                                    data={data as DataPoint<number, number>[]}
                                    showTooltip={showTooltip}
                                    hideTooltip={hideTooltip}
                                    scaleFactorX={scaleFactorX}
                                    scaleFactorY={scaleFactorY}
                                    margin={margin}
                                />}
                                {(ArCabildoabiertoEmbedVisualization.isBarplot(spec.plot) || ArCabildoabiertoEmbedVisualization.isHistogram(spec.plot)) && <BarplotContent
                                    xScale={axisBottomScale as ScaleBand<string>}
                                    yScale={axisLeftScale as ScaleLinear<number, number>}
                                    data={data}
                                    innerHeight={plotInnerHeight}
                                    hideTooltip={hideTooltip}
                                    showTooltip={showTooltip}
                                />}
                                {ArCabildoabiertoEmbedVisualization.isScatterplot(spec.plot) && <ScatterplotContent
                                    xScale={axisBottomScale as ScaleLinear<number, number> | ScaleTime<number, number>}
                                    yScale={axisLeftScale as ScaleLinear<number, number>}
                                    data={data as DataPoint<number, number>[]}
                                    innerHeight={plotInnerHeight}
                                    hideTooltip={hideTooltip}
                                    showTooltip={showTooltip}
                                    scaleFactorX={scaleFactorX}
                                    scaleFactorY={scaleFactorY}
                                    margin={margin}
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
                                tickFormat={plotter.getXTicksFormat()}
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
            <div style={{maxWidth: svgWidth, height: captionHeight}}>
                <PlotCaption caption={vis.caption} fontSize={Math.min(15, 16 * Math.min(scaleFactorX, scaleFactorY))}/>
            </div>
        </div>
    );
}


const TwoAxisPlotComp = ({spec, visualization, maxWidth, maxHeight}: TwoAxisPlotProps) => {

    if (!spec.xAxis || spec.xAxis.length == 0) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Elegí un eje x.
        </div>
    }

    const dataset = visualization.dataset

    if (!isDatasetView(dataset) && !isTopicsDatasetView(dataset)) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            Configurá el conjunto de datos.
        </div>
    }

    if (ArCabildoabiertoEmbedVisualization.isOneAxisPlot(spec) && !validColumn(spec.xAxis, dataset)) {
        return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
            No se encontró la columna especificada en los datos.
        </div>
    }

    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(spec)) {
        if ((!spec.yAxis || spec.yAxis.length == 0) && (!spec.yAxes || spec.yAxes.length == 0)) {
            return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
                Elegí un eje y.
            </div>
        }

        const invalidY = spec.yAxis && !validColumn(spec.yAxis, dataset) ||
            spec.yAxes && spec.yAxes.some(a => !validColumn(a.column, dataset))

        if (!validColumn(spec.xAxis, dataset) || invalidY) {
            return <div className={"text-[var(--text-light)] w-full h-full flex justify-center items-center"}>
                No se encontraron las columnas especificadas en los datos.
            </div>
        }
    }

    return <TwoAxisPlotPlot
        spec={spec}
        visualization={visualization}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
    />
}


export default TwoAxisPlotComp