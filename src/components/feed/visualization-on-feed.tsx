import {VisualizationProps} from "../../app/lib/definitions";
import {FastPostPreviewFrame} from "./fast-post-preview-frame";
import {VegaPlotPreview} from "../visualizations/vega-plot-preview";


export const VisualizationOnFeed = ({visualization}: {visualization: VisualizationProps}) => {

    return <FastPostPreviewFrame
        post={visualization}
    >
        <div className={"mt-1"}>
        <VegaPlotPreview visualization={visualization}/>
        </div>
    </FastPostPreviewFrame>
}