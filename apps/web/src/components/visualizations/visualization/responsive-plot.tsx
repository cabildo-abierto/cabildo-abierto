import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"

import dynamic from "next/dynamic";

const TwoAxisPlotComp = dynamic(() => import("./axes/two-axis/two-axis-plot-comp"))
const TableVisualizationComp = dynamic(() => import("./table/table-visualization-comp"))
const ElectionVisualizationComp = dynamic(() => import("./election/election-visualization-comp"))

export const ResponsivePlot = ({
                                   visualization,
                                   maxWidth,
                                   maxHeight
                               }: {
    visualization: ArCabildoabiertoEmbedVisualization.View
    maxWidth?: number
    maxHeight?: number
}) => {
    if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(visualization.visualization.spec) || ArCabildoabiertoEmbedVisualization.isOneAxisPlot(visualization.visualization.spec)) {
        return <TwoAxisPlotComp
            spec={visualization.visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isTable(visualization.visualization.spec)) {
        return <TableVisualizationComp
            spec={visualization.visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    } else if (ArCabildoabiertoEmbedVisualization.isEleccion(visualization.visualization.spec)) {
        return <ElectionVisualizationComp
            spec={visualization.visualization.spec}
            visualization={visualization}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        />
    }

    return <div className={"text-[var(--text-light)]"}>
        Esta configuración por ahora no está soportada.
    </div>
}