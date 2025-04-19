"use client"
import {FastPostProps} from "@/lib/definitions";
import {PlotFromUri} from "./plot-from-uri";
import {getUri, shortCollectionToCollection} from "@/utils/uri";


export const PlotInPost = ({
    post,
    interactive=true
}: {
    post: FastPostProps
    interactive?: boolean
}) => {
    if (!post.content.post.embed) {
        return null
    }
    const embed = JSON.parse(post.content.post.embed)
    if (embed.$type != "app.bsky.embed.external" || !embed.external.uri) {
        return null
    }
    const url = embed.external.uri

    let did, rkey: string

    if (url.startsWith("https://www.cabildoabierto.com.ar/visual/")) {
        [did, rkey] = url.replace("https://www.cabildoabierto.com.ar/visual/", "").split("/");
    } else if(url.startsWith("https://www.cabildoabierto.com.ar/c")){
        let collection: string
        [did, collection, rkey] = url.replace("https://www.cabildoabierto.com.ar/c/", "").split("/")
        if(shortCollectionToCollection(collection) != "ar.com.cabildoabierto.visualization"){
            return null
        }
    } else {
        return null
    }

    return <div className={"mt-2 border rounded-lg p-2 hover:bg-[var(--background-dark2)]"}>
        <PlotFromUri uri={getUri(did, "ar.com.cabildoabierto.visualization", rkey)} interactive={interactive}/>
    </div>
}