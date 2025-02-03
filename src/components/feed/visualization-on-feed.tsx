import {VisualizationProps} from "../../app/lib/definitions";
import {FastPostPreviewFrame} from "./fast-post-preview-frame";
import dynamic from "next/dynamic";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});
import Image from 'next/image'

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
                    src={"/visual/" + visualization.author.did + "/preview/" + previewCid}
                    alt={"visualization"}
                    width={400}
                    height={300}
                    className={"w-full h-auto"}
                />
            </div>
        }
    </FastPostPreviewFrame>
}