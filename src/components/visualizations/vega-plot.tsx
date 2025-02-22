import {VisualizationProps} from "../../app/lib/definitions";
import {useEffect, useState} from "react";
import {useDataset} from "../../hooks/contents";
import Image from "next/image";
import {localizeDataset} from "../editor/nodes/visualization-node-comp";
import dynamic from "next/dynamic";
import {pxToNumber} from "../utils";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});


export const VegaPlotPreview = ({visualization, width} : {
    visualization: VisualizationProps
    width?: number | string
}) => {
    const previewCid = visualization.visualization.previewBlobCid;
    const cdnUrl = "https://cdn.bsky.app/img/feed_thumbnail/plain/"+visualization.author.did+"/"+previewCid+"@jpeg"

    return <div style={{width}}>
        <Image
            src={cdnUrl}
            alt={""}
            width={400}
            height={300}
            className={"w-full h-auto"}
        />
    </div>
}


export const VegaPlot = ({
     visualization,
     width
}: {
    visualization: VisualizationProps
    width?: number | string
    previewOnly?: boolean
}) => {
    const [isVegaLoading, setIsVegaLoading] = useState(true);
    const {dataset} = useDataset(visualization.visualization.dataset.uri)

    const [jsonSpec, setJsonSpec] = useState(null);
    useEffect(() => {
        let json = JSON.parse(visualization.visualization.spec);
        json = localizeDataset(json);

        if (dataset) {

            if(width){
                const parsedWidth = pxToNumber(width) * 0.85

                const originalWidth = json.width || 400;
                const originalHeight = json.height || 300;
                const aspectRatio = originalHeight / originalWidth;

                json.width = parsedWidth;
                json.height = parsedWidth * aspectRatio;
            }

            json.data = { values: dataset.data };

            setJsonSpec(json);
        }
    }, [visualization, dataset, width]);


    if(!jsonSpec) return null;

    return <>
        {isVegaLoading && <VegaPlotPreview visualization={visualization} width={width}/>}
        <div
            style={{ display: isVegaLoading ? 'none' : 'block' }}
            onClick={(e) => {e.stopPropagation()}}
        >
            <VegaLite
                spec={jsonSpec}
                actions={false}
                onNewView={() => {
                    setIsVegaLoading(false);
                }}
            />
        </div>
    </>
}