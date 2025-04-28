import {PostPreviewFrame} from "../frame/post-preview-frame";
import {VegaPlotPreview} from "../../visualizations/vega-plot-preview";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {$Typed} from "@atproto/api";


export const VisualizationOnFeed = ({visualization}: {visualization: any}) => {

    return <PostPreviewFrame
        postView={visualization as unknown as $Typed<PostView>} // TO DO
    >
        <div className={"mt-1"}>
            <VegaPlotPreview visualization={visualization}/>
        </div>
    </PostPreviewFrame>
}