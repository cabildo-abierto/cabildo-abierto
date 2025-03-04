import {useDataset, useVisualization} from "../../../hooks/contents";
import {DatasetTitle} from "../../datasets/dataset-title";
import {UserHandle} from "../../feed/content-top-row-author";
import LoadingSpinner from "../../ui-utils/loading-spinner";
import {EngagementProps, VisualizationProps} from "../../../app/lib/definitions";
import {EngagementIcons} from "../../reactions/engagement-icons";
import {VegaPlot, VegaPlotPreview} from "../../visualizations/vega-plot";
import {useLayoutConfig} from "../../layout/layout-config-context";
import {PrettyJSON, pxToNumber} from "../../utils/utils";



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


export const VisualizationNodeComp = ({
    visualization,
    showEngagement=true,
    interactive=true,
    width
}: {
    visualization: VisualizationProps & EngagementProps
    showEngagement?: boolean
    interactive?: boolean
    width?: number | string
}) => {

    return (
        <div
            className={"flex flex-col items-center w-full not-article-content"}
            onClick={(e) => {e.stopPropagation()}}
        >

            {interactive ? <VegaPlot visualization={visualization} width={width}/> :
                <div className={"mb-1"}>
                    <VegaPlotPreview
                        visualization={visualization}
                    />
                </div>
            }

            {visualization && (
                <div className={"flex items-center justify-between w-full px-4"}>
                    <div className={"exclude-links text-sm text-[var(--text-light)] flex flex-col items-center"}>
                        <DatasetTitle
                            dataset={visualization.visualization.dataset}
                        />
                        <UserHandle content={visualization}/>
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