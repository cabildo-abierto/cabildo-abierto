import {$Typed} from "@atproto/api";
import {
    Barplot as BarplotSpec, isBarplot, isLines,
    Lines,
    Scatterplot,
    View as VisualizationView
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {Barplot} from "@/components/visualizations/barplot";
import {CurvePlot, CurvePlotContent} from "@/components/visualizations/curve-plot";
import {defaultStyles, useTooltip, useTooltipInPortal} from "@visx/tooltip";
import {Plotter, ValueType} from "@/components/visualizations/editor/plotter";
import useMeasure from "react-use-measure";
import {useEffect, useMemo, useRef} from "react";
import {TransformMatrix} from "@visx/zoom/lib/types";
import {Zoom} from "@visx/zoom";
import {Group} from "@visx/group";
import {localPoint} from "@visx/event";
import {LinePath} from "@visx/shape";
import {curveMonotoneX} from "d3-shape";
import {AxisBottom, AxisLeft} from "@visx/axis";
import { zoomIdentity, ZoomTransform } from 'd3-zoom';
import {BarplotContent} from "@/components/visualizations/barplot"

export function TwoAxisTooltip({xLabel, yLabel, xValue, yValue}: {
    xLabel: string,
    yLabel: string,
    xValue: string,
    yValue: string
}) {
    return <>
        <div>
            <strong>
                {yLabel}: {yValue}
            </strong>
        </div>
        <div>
            {xLabel}: {xValue}
        </div>
    </>
}


type TwoAxisPlotSpec = $Typed<BarplotSpec> | $Typed<Lines> | $Typed<Scatterplot>


type TwoAxisPlotProps = {
    spec: TwoAxisPlotSpec
    visualization: VisualizationView
}


function validColumn(column: string, dataset: DatasetView | DatasetViewBasic) {
    return dataset.columns.some(c => c.name === column)
}


export const TwoAxisPlotOld = ({spec, visualization}: TwoAxisPlotProps) => {
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

    if (isBarplot(spec)) {
        return <Barplot spec={spec} visualization={visualization}/>
    }

    if (isLines(spec)) {
        return <CurvePlot spec={spec} visualization={visualization}/>
    }
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
            if(handleWheelRef.current){
                handleWheelRef.current?.(e);
            }
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

    const plotter = useMemo(() => new Plotter(visualization.dataset.data, spec.xAxis, spec.yAxis, spec.$type), [visualization.dataset.data, spec.xAxis, spec.yAxis, spec.$type]);
    const data = useMemo(() => plotter.prepareForPlot(), [plotter]);

    const xScale = plotter.getScale('x', innerWidth)
    const yScale = plotter.getScale('y', innerHeight)

    console.log("xScale", xScale)
    console.log(plotter.xAxis, plotter.yAxis)
    console.log("yScale", yScale)
    console.log("bandwidth in plotplot", xScale.bandwidth())

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
                                {isLines(spec) && <CurvePlotContent
                                    xScale={transformedXScale}
                                    yScale={transformedYScale}
                                    data={data}
                                />}
                                {isBarplot(spec) && <BarplotContent
                                    xScale={xScale}
                                    yScale={yScale}
                                    data={data}
                                    innerHeight={innerHeight}
                                    hideTooltip={hideTooltip}
                                    showTooltip={showTooltip}
                                />}
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