"use client"
import {useVisualization} from "../../hooks/contents";
import {VisualizationNodeComp} from "../editor/nodes/visualization-node-comp";

export const PlotFromUri = ({uri}: {uri: string}) => {
    const {visualization} = useVisualization(uri)

    if(!visualization) return null

    return <VisualizationNodeComp visualization={visualization}/>
}
