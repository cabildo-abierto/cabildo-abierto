"use client"
import {FastPostProps} from "../../app/lib/definitions";
import {getUri} from "../utils";
import {PlotFromUri} from "./plot-from-uri";


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

    const [did, rkey] = url.replace("https://www.cabildoabierto.com.ar/visual/", "").split("/");

    return <div className={"mt-2"}>
        <PlotFromUri uri={getUri(did, "ar.com.cabildoabierto.visualization", rkey)}/>
    </div>
}