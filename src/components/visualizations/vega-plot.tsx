import {VisualizationProps} from "../../app/lib/definitions";
import {useEffect, useState} from "react";
import {useDataset} from "../../hooks/contents";
import Image from "next/image";
import {localizeDataset} from "../editor/nodes/visualization-node-comp";
import dynamic from "next/dynamic";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});


export const VegaPlotPreview = ({visualization} : {visualization: VisualizationProps}) => {
    const previewCid = visualization.visualization.previewBlobCid;
    const cdnUrl = "https://cdn.bsky.app/img/feed_thumbnail/plain/"+visualization.author.did+"/"+previewCid+"@jpeg"

    return <Image
        src={cdnUrl}
        alt={""}
        width={400}
        height={300}
        className={"w-full h-auto"}
    />
}


export const VegaPlot = ({visualization, width}: {
    visualization: VisualizationProps, width?: number, previewOnly?: boolean}) => {
    const [isVegaLoading, setIsVegaLoading] = useState(true);
    const {dataset} = useDataset(visualization.visualization.dataset.uri)

    const [jsonSpec, setJsonSpec] = useState(null);
    useEffect(() => {
        let json;

        json = JSON.parse(visualization.visualization.spec);
        json = localizeDataset(json);

        if(dataset){
            json.data = {
                values: dataset.data
            }
            setJsonSpec(json);
        }
    }, [visualization, dataset]);

    if(!jsonSpec) return null;

    return <>
        {isVegaLoading && <VegaPlotPreview visualization={visualization} />}

        <div style={{ display: isVegaLoading ? 'none' : 'block' }} onClick={(e) => {e.stopPropagation()}}>
            <VegaLite
                spec={jsonSpec}
                width={width}
                actions={false}
                onNewView={() => {
                    setIsVegaLoading(false);
                }}
            />
        </div>
    </>
}