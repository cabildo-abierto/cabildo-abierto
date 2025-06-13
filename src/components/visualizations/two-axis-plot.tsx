import {$Typed} from "@atproto/api";
import {
    Barplot as BarplotSpec, isBarplot, isLines,
    Lines,
    Scatterplot,
    View as VisualizationView
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {Barplot} from "@/components/visualizations/barplot";
import {CurvePlot} from "@/components/visualizations/curve-plot";

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

    if (isLines(spec)) {
        return <CurvePlot spec={spec} visualization={visualization}/>
    }
}