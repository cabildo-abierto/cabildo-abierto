import {VisualizationProps} from "../../app/lib/definitions";
import {FastPostPreviewFrame} from "./fast-post-preview-frame";
import dynamic from "next/dynamic";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});

export const VisualizationOnFeed = ({visualization}: {visualization: VisualizationProps}) => {
    return <FastPostPreviewFrame post={visualization}>
        <div className={"flex justify-center py-2"}>
            <VegaLite spec={JSON.parse(visualization.visualization.spec)} actions={false}/>
        </div>
    </FastPostPreviewFrame>
}