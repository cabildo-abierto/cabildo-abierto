import {useVisualization} from "../../../hooks/contents";
import {DatasetTitle} from "../../datasets/dataset-title";
import {UserHandle} from "../../feed/content-top-row-author";
import LoadingSpinner from "../../ui-utils/loading-spinner";
import {EngagementProps, VisualizationProps} from "../../../app/lib/definitions";
import {EngagementIcons} from "../../reactions/engagement-icons";
import {VegaPlot} from "../../visualizations/vega-plot";
import {VegaPlotPreview} from "../../visualizations/vega-plot-preview";
import {useLayoutConfig} from "../../layout/layout-config-context";

import {pxToNumber} from "../../utils/strings";



export function localizeDataset(spec: any){
    if(spec.data && spec.data.url){
        const url = spec.data.url
        if(url.startsWith("https://www.cabildoabierto.com.ar")){
            spec.data.url = url.replace("https://www.cabildoabierto.com.ar","")
        }
    }
    return spec
}

export const VisualizationNodeCompFromSpec = ({uri}: {uri: string}) => {
    const {visualization, isLoading, error} = useVisualization(uri)
    const {layoutConfig} = useLayoutConfig()

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    } else if(error){
        return <div className={"p-4 border rounded-lg text-center"}>
            Ocurrió un error al obtener la visualización. Quizás haya sido borrada.
            <div className={"text-xs text-center text-[var(--text-light)] break-all"}>
                Id: {uri}
            </div>
        </div>
    }

    return <VisualizationNodeComp
        visualization={visualization}
        interactive={pxToNumber(layoutConfig.maxWidthCenter) > 600}
    />
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
    const {layoutConfig} = useLayoutConfig()

    return <div>
        <div
            className={"flex flex-col items-center not-article-content w-full"}
            onClick={(e) => {e.stopPropagation()}}
        >
            {interactive ? <VegaPlot
                visualization={visualization}
                width={width}
            /> : <VegaPlotPreview
                visualization={visualization}
                width={width}
            />}
        </div>

        <div
            className={"flex mt-2 " + (pxToNumber(layoutConfig.maxWidthCenter) <= 600 ? "flex-col items-center" : "justify-between w-full")}
        >
            <div className={"exclude-links text-sm text-[var(--text-light)] flex flex-col items-center"}>
                <DatasetTitle
                    dataset={visualization.visualization.dataset}
                />
                <UserHandle content={visualization}/>
            </div>
            {showEngagement && (
                <EngagementIcons record={visualization} counters={visualization} className={"space-x-2"}/>
            )}
        </div>
    </div>
}