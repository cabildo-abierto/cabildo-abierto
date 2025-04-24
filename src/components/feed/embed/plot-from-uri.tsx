"use client"
import {useVisualization} from "../../../hooks/api";
import {VisualizationNodeComp} from "../../../../modules/ca-lexical-editor/src/nodes/visualization-node-comp";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";

export const PlotFromUri = ({uri, interactive=true}: {
    uri: string
    interactive?: boolean
}) => {
    const {visualization, isLoading, error} = useVisualization(uri)

    if(isLoading){
        return <div className={"py-4"}><LoadingSpinner/></div>
    }

    if(!visualization || error) return <div className={"text-center text-sm text-[var(--text-light)]"}>
        No se encontró la visualización
    </div>

    return <VisualizationNodeComp visualization={visualization} interactive={interactive}/>
}
