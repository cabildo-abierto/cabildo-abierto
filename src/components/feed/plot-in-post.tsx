import {FastPostProps} from "../../app/lib/definitions";
import {VegaLite} from "react-vega";
import {getSpecForConfig} from "../visualizations/spec";
import {getUri} from "../utils";
import {useDataset, useVisualization} from "../../hooks/contents";


export const PlotFromUri = ({uri}: {uri: string}) => {
    const {visualization, isLoading} = useVisualization(uri)

    if(!visualization) return null

    return <div className={"flex justify-center border rounded bg-[var(--background)]"}>
        <VegaLite spec={JSON.parse(visualization.visualization.spec)} actions={false}/>
    </div>
}


export const PlotInPost = ({post}: {post: FastPostProps}) => {
    if (!post.content.post.embed) {
        return null
    }
    const embed = JSON.parse(post.content.post.embed)
    if (embed.$type != "app.bsky.embed.external" || !embed.external.uri) {
        return null
    }

    const url = embed.external.uri
    if (!url.startsWith("https://www.cabildoabierto.com.ar/visual/")) {
        return null
    }

    console.log("Showing plot")

    const [did, rkey] = url.replace("https://www.cabildoabierto.com.ar/visual/", "").split("/");

    return <div className={"mt-2"}>
        <PlotFromUri uri={getUri(did, "ar.com.cabildoabierto.visualization", rkey)}/>
    </div>
}