"use client"
import {useVisualization} from "../../hooks/contents";
import {VisualizationNodeComp} from "../editor/nodes/visualization-node-comp";
import LoadingSpinner from "../loading-spinner";

export const PlotFromUri = ({uri}: {uri: string}) => {
    const {visualization, isLoading, error} = useVisualization(uri)

    if(isLoading){
        return <div className={"py-4"}><LoadingSpinner/></div>
    }

    if(!visualization || error) return <div className={"text-center text-sm text-[var(--text-light)]"}>
        No se encontró la visualización
    </div>

    return <VisualizationNodeComp visualization={visualization}/>
}
