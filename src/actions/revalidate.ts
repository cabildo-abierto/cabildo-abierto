"use server"

import {revalidateTag} from "next/cache";
import {splitUri} from "../components/utils/uri";

export async function revalidateUri(uri: string){
    const {did, collection: c, rkey} = splitUri(uri)

    revalidateTag("thread:"+did+":"+rkey)

    if(["app.bsky.feed.post", "ar.com.cabildoabierto.quotePost"].includes(c)){
        revalidateTag("feedCA")
    } else if(c == "ar.com.cabildoabierto.visualization"){
        revalidateTag("visualizations")
    } else if(c == "ar.com.cabildoabierto.dataset"){
        revalidateTag("datasets")
    }
}