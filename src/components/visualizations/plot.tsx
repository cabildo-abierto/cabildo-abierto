import {
    Barplot as BarplotSpec,
    isBarplot, isDatasetDataSource,
    Lines,
    View as VisualizationView,
    Main as Visualization,
    Scatterplot, DatasetDataSource
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset"
import {Bar} from '@visx/shape';
import {scaleBand, scaleLinear} from '@visx/scale';
import {Group} from '@visx/group';
import {AxisBottom, AxisLeft} from '@visx/axis';
import {isTwoAxisPlot} from "@/components/visualizations/editor/plot-specific-config";
import {$Typed} from "@atproto/api";
import {useTooltip, useTooltipInPortal, defaultStyles} from '@visx/tooltip';
import {localPoint} from '@visx/event';
import useMeasure from "react-use-measure";
import {useDataset} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {Button} from "../../../modules/ui-utils/src/button";
import {WriteButtonIcon} from "@/components/icons/write-button-icon";
import {InsertVisualizationModal} from "@/components/writing/write-panel/insert-visualization-modal";
import {useState} from "react";
import {visualizationViewToMain} from "@/components/writing/write-panel/write-post";
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";


function validColumn(column: string, dataset: DatasetView | DatasetViewBasic) {
    return dataset.columns.some(c => c.name === column)
}


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
    } = useTooltip<{ x: string; y: number }>();

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

    const data = groupSameX(JSON.parse(visualization.dataset.data), spec.xAxis, spec.yAxis);

    const xScale = scaleBand<string>({
        domain: data.map((d) => d.x),
        range: [0, innerWidth],
        padding: 0.2,
    });

    const yMax = Math.max(...data.map((d) => d.y), 0);
    const yScale = scaleLinear<number>({
        domain: [0, yMax],
        range: [innerHeight, 0],
        nice: true,
    });

    return (
        <div className="relative w-full h-full" ref={ref}>
            {visualization.title && (
                <div className="text-center font-semibold text-lg h-[30px] pt-2 items-baseline flex justify-center">
                    {visualization.title}
                </div>
            )}
            {tooltipOpen && tooltipData && (
                <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={{...defaultStyles, zIndex: 2000}}>
                    <div><strong>{spec.yLabel ?? spec.yAxis}: {Number(tooltipData.y.toFixed(2))}</strong></div>
                    <div>{spec.xLabel ?? spec.xAxis}: {Number(parseFloat(tooltipData.x).toFixed(2))}</div>
                </TooltipInPortal>
            )}
            <svg ref={containerRef} width={svgWidth} height={svgHeight}>
                <Group left={margin.left} top={margin.top}>
                    {data.map((d, i) => {
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
    );
};


type TwoAxisPlotSpec = $Typed<BarplotSpec> | $Typed<Lines> | $Typed<Scatterplot>


type TwoAxisPlotProps = {
    spec: TwoAxisPlotSpec
    visualization: VisualizationView
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

    if (isBarplot(spec)) {
        return <Barplot spec={spec} visualization={visualization}/>
    }
}


export const ResponsivePlot = ({
                                   visualization,
                               }: {
    visualization: VisualizationView
}) => {
    if (isDatasetDataSource(visualization.dataSource)) {
        if (isTwoAxisPlot(visualization.spec)) {
            return <TwoAxisPlot
                spec={visualization.spec}
                visualization={visualization}
            />
        }
    }

    return <div className={"text-[var(--text-light)]"}>
        Esta configuración por ahora no está soportada
    </div>
};


export const Plot = ({
                         visualization,
                         height = 400,
                         width,
                         onEdit,
                         onDelete
                     }: {
    visualization: VisualizationView
    height?: number | string
    width?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    const [editing, setEditing] = useState(false)

    return <div style={{height, width}} className={"relative"}>
        {(onEdit != null || onDelete != null) && <div
            className={"absolute top-2 right-2 z-10 space-x-2"}
        >
            {onEdit && <Button
                size={"small"}
                startIcon={<WriteButtonIcon/>}
                color={"background-dark2"}
                onClick={() => {
                    setEditing(true)
                }}
                sx={{height: "28px"}}
            >
                Editar
            </Button>}
            {onDelete && <IconButton
                size={"small"}
                color={"background-dark2"}
                onClick={() => {
                    onDelete()
                }}
                sx={{height: "28px"}}
            >
                <DeleteOutlineIcon fontSize={"inherit"}/>
            </IconButton>}
        </div>}
        <ResponsivePlot visualization={visualization}/>
        <InsertVisualizationModal
            open={editing}
            onClose={() => {
                setEditing(false)
            }}
            onSave={onEdit}
            initialConfig={visualizationViewToMain(visualization)}
        />
    </div>
};


function getDatasetVisualizationView(visualization: Visualization, dataset: DatasetView): VisualizationView {
    if (isDatasetDataSource(visualization.dataSource)) {
        return {
            ...visualization,
            $type: "ar.cabildoabierto.embed.visualization#view",
            dataset
        }
    }
}


const DatasetPlotFromMain = ({visualization, dataSource, height, width, onEdit, onDelete}: {
    visualization: Visualization
    dataSource: DatasetDataSource
    width?: number | string
    height?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    const {data: dataset, isLoading} = useDataset(dataSource.dataset)

    if (isLoading || !dataset) {
        return <div className={"py-4"}><LoadingSpinner/></div>
    }

    const view = getDatasetVisualizationView(visualization, dataset)

    return <Plot visualization={view} width={width} height={height} onEdit={onEdit} onDelete={onDelete}/>
}


export const PlotFromVisualizationMain = ({visualization, height, width, onEdit, onDelete}: {
    visualization: Visualization
    height?: number | string
    width?: number | string
    onEdit?: (v: Visualization) => void
    onDelete?: () => void
}) => {
    if (isDatasetDataSource(visualization.dataSource)) {
        return <DatasetPlotFromMain
            visualization={visualization}
            dataSource={visualization.dataSource}
            height={height}
            width={width}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    } else {
        return <div>
            <PrettyJSON data={visualization}/>
        </div>
    }
}