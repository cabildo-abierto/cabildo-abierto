import {VisualizationProps} from "../../app/lib/definitions";
import {FastPostPreviewFrame} from "./fast-post-preview-frame";
import dynamic from "next/dynamic";
import Image from "next/image";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});

export const VisualizationOnFeed = ({visualization}: {visualization: VisualizationProps}) => {
    const previewCid = visualization.visualization.previewBlobCid

    return <FastPostPreviewFrame
        post={visualization}
    >
        {!previewCid ? <div className={"flex justify-center my-2"} onClick={(e) => {
                e.stopPropagation();
                e.preventDefault()
            }}>
                <VegaLite spec={JSON.parse(visualization.visualization.spec)} actions={false}/>
            </div> :
            <div className={"flex justify-center my-2"}>
                <Image
                    src={"https://cdn.bsky.app/img/feed_thumbnail/plain/"+visualization.author.did+"/"+previewCid+"@jpeg"}
                    alt={""}
                    width={400}
                    height={300}
                    className={"w-full h-auto"}
                />
            </div>
        }
    </FastPostPreviewFrame>
}