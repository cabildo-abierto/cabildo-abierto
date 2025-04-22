import {VisualizationProps} from "@/lib/types";
import {PostPreviewFrame} from "./post-preview-frame";
import {VegaPlotPreview} from "../visualizations/vega-plot-preview";


export const VisualizationOnFeed = ({visualization}: {visualization: VisualizationProps}) => {

    return <PostPreviewFrame
        post={visualization}
    >
        <div className={"mt-1"}>
            <VegaPlotPreview visualization={visualization}/>
        </div>
    </PostPreviewFrame>
}