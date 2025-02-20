import {ProfilePic} from "../feed/profile-pic";
import {ContentTopRowAuthor} from "../content-top-row-author";
import {EngagementProps, VisualizationProps} from "../../app/lib/definitions";
import {DatasetTitle} from "../datasets/dataset-title";
import {EngagementIcons} from "../feed/engagement-icons";
import {VegaPlot} from "./vega-plot";


export const VisualizationOnThread = ({visualization}: {visualization: VisualizationProps & EngagementProps}) => {

    return <div className={"mt-4 space-y-2 pb-2 border-b w-full"}>
        <div className={"flex justify-between items-center"}>
            <div className={"font-bold text-xl"}>
                Visualización
            </div>
        </div>
        <div className={"flex items-center space-x-2 text-sm"}>
            <ProfilePic user={visualization.author} className={"w-5 h-5 rounded-full"}/>
            <ContentTopRowAuthor author={visualization.author}/>
        </div>
        <div className={"flex space-x-1 text-sm items-end"}>
            <div className={"text-[var(--text-light)]"}>Datos:</div>
            <DatasetTitle dataset={visualization.visualization.dataset}/>
        </div>
        <div className={"flex justify-center mt-4"}>
            <VegaPlot visualization={visualization}/>
        </div>
        <div className={"border-t pt-2 px-2"}>
            <EngagementIcons record={visualization} counters={visualization}/>
        </div>
    </div>
}