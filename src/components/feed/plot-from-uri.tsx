"use client"
import {useVisualization} from "../../hooks/contents";
import {VisualizationSpec} from "react-vega";
import dynamic from "next/dynamic";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});

export const PlotFromUri = ({uri}: {uri: string}) => {
    const {visualization, isLoading} = useVisualization(uri)

    if(!visualization) return null

    const spec: VisualizationSpec = JSON.parse(visualization.visualization.spec)
    return <div className={"flex justify-center border rounded bg-[var(--background)]"}>
        <VegaLite spec={spec} actions={false}/>
    </div>
}
