import {VisualizationProps} from "@/lib/types";
import {PostPreviewFrame} from "../frame/post-preview-frame";
import {VegaPlotPreview} from "../../visualizations/vega-plot-preview";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";


export const VisualizationOnFeed = ({visualization}: {visualization: VisualizationProps}) => {

    return <PostPreviewFrame
        postView={visualization as unknown as PostView} // TO DO
    >
        <div className={"mt-1"}>
            <VegaPlotPreview visualization={visualization}/>
        </div>
    </PostPreviewFrame>
}