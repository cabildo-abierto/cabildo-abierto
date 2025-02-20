import {useDataset, useVisualization} from "../../../hooks/contents";
import {DatasetTitle} from "../../datasets/dataset-title";
import {Authorship} from "../../content-top-row-author";
import LoadingSpinner from "../../loading-spinner";
import {EngagementProps, VisualizationProps} from "../../../app/lib/definitions";
import {EngagementIcons} from "../../feed/engagement-icons";
import {VegaPlot} from "../../visualizations/vega-plot";



export function localizeDataset(spec: any){
    if(spec.data && spec.data.url){
        const url = spec.data.url
        if(url.startsWith("https://www.cabildoabierto.com.ar")){
            spec.data.url = url.replace("https://www.cabildoabierto.com.ar","")
        }
    }
    return spec
}

export const VisualizationNodeCompFromSpec = ({spec, uri}: {spec: string, uri: string}) => {
    const {visualization, isLoading, error} = useVisualization(uri)

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    } else if(error){
        return <div className={"p-4 border rounded-lg text-[var(--text-light)] text-center"}>
            Ocurrió un error al obtener la visualización. Quizás haya sido borrada.
        </div>
    }

    return <VisualizationNodeComp visualization={visualization}/>
}


export const VisualizationNodeComp = ({visualization, showEngagement=true}: {
    visualization: VisualizationProps & EngagementProps, showEngagement?: boolean}) => {
    const {dataset} = useDataset(visualization.visualization.dataset.uri)

    return (
        <div className={"flex flex-col items-center w-full"} onClick={(e) => {e.stopPropagation()}}>

            <VegaPlot visualization={visualization}/>

            {visualization && (
                <div className={"flex items-center justify-between w-full px-4"}>
                    <div className={"exclude-links text-sm text-[var(--text-light)] flex flex-col items-center"}>
                        {dataset && (
                            <div className={""}>
                                <span className={"text-sm text-[var(--text-light)]"}>Datos:</span> <DatasetTitle
                                dataset={dataset.dataset}/>
                            </div>
                        )}
                        <Authorship content={visualization} text={"Por"}/>
                    </div>
                    {showEngagement && (
                        <div>
                            <EngagementIcons record={visualization} counters={visualization} className={"space-x-2"}/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}