
import dynamic from "next/dynamic";
import Link from "next/link";
import {contentUrl, editVisualizationUrl, getUri} from "../../utils";
import {useDataset, useVisualization} from "../../../hooks/contents";
import {DatasetTitle} from "../../datasets/dataset-title";
import {FixedCounter, LikeCounter} from "../../like-counter";
import {InactiveCommentIcon} from "../../icons/inactive-comment-icon";
import CreateIcon from "@mui/icons-material/Create";
import {ActiveLikeIcon} from "../../icons/active-like-icon";
import {InactiveLikeIcon} from "../../icons/inactive-like-icon";
import {addLike, removeLike} from "../../../actions/contents";
import {Authorship} from "../../content-top-row-author";
import LoadingSpinner from "../../loading-spinner";
import {EngagementProps, VisualizationProps} from "../../../app/lib/definitions";
import {useEffect, useState} from "react";
import Image from "next/image";
import {EngagementIcons} from "../../feed/engagement-icons";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});

function getDatasetFromSpec(spec: any): string | null {
    if(spec.data && spec.data.url){
        const url = spec.data.url
        if(url.startsWith("/dataset/")){
            const s = url.split("/")
            if(s.length == 4){
                return getUri(s[2], "ar.com.cabildoabierto.dataset", s[3])
            }
        }
    }
    return null
}


export function localizeDataset(spec: any){
    if(spec.data && spec.data.url){
        const url = spec.data.url
        if(url.startsWith("https://www.cabildoabierto.com.ar")){
            spec.data.url = url.replace("https://www.cabildoabierto.com.ar","")
        }
    }
    return spec
}

export const VisualizationNodeCompFromSpec = ({spec, uri}: {spec: string, uri: string}) => {
    const {visualization, isLoading} = useVisualization(uri)

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <VisualizationNodeComp visualization={visualization}/>
}


export const VisualizationNodeComp = ({visualization, showEngagement=true}: {
    visualization: VisualizationProps & EngagementProps, showEngagement?: boolean}) => {
    const {dataset} = useDataset(visualization.visualization.dataset.uri)

    return (
        <div className={"flex flex-col items-center w-full"} onClick={(e) => {e.stopPropagation()}}>

            <VegaPlot visualization={visualization}/>

            {visualization && (
                <div className={"flex items-center justify-between w-full px-4"}>
                    <div className={"exclude-links text-sm text-[var(--text-light)] flex flex-col items-center"}>
                        {dataset && (
                            <div className={""}>
                                <span className={"text-sm text-[var(--text-light)]"}>Datos:</span> <DatasetTitle
                                dataset={dataset.dataset}/>
                            </div>
                        )}
                        <Authorship content={visualization} text={"Por"}/>
                    </div>
                    {showEngagement && (
                        <div>
                            <EngagementIcons record={visualization} counters={visualization} className={"space-x-2"}/>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export const VegaPlot = ({visualization}: {visualization: VisualizationProps}) => {
    const [isVegaLoading, setIsVegaLoading] = useState(true);
    const previewCid = visualization.visualization.previewBlobCid;
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

    const preview = <Image
        src={"https://cdn.bsky.app/img/feed_thumbnail/plain/"+visualization.author.did+"/"+previewCid+"@jpeg"}
        alt={""}
        width={400}
        height={300}
        className={"w-full h-auto"}
    />;
    return <>
        {isVegaLoading && preview}

        <div style={{ display: isVegaLoading ? 'none' : 'block' }} onClick={(e) => {e.stopPropagation()}}>
            <VegaLite
                spec={jsonSpec}
                actions={false}
                onNewView={() => {
                    setIsVegaLoading(false);
                }}
                config={{background: null}}
            />
        </div>
    </>
}