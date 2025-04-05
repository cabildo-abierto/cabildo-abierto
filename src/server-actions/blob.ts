"use server"
import {DidResolver} from "@atproto/identity";
import {revalidateTag, unstable_cache} from "next/cache";
import {revalidateEverythingTime} from "./utils";


export async function getServiceEndpointForDidNoCache(did: string){
    try {
        const didres: DidResolver = new DidResolver({})
        const doc = await didres.resolve(did)
        if(doc && doc.service && doc.service.length > 0 && doc.service[0].serviceEndpoint){
            return doc.service[0].serviceEndpoint
        }
    } catch (e) {
        console.error("Error getting service endpoint", e)
        return null
    }
    return null
}


export async function getServiceEndpointForDid(did: string){
    const endpoint = await unstable_cache(async () => {
            return await getServiceEndpointForDidNoCache(did)
        },
        ["serviceendpoint:"+did],
        {
            tags: ["serviceendpoint:"+did, "serviceendpoint"],
            revalidate: revalidateEverythingTime
    })()
    if(!endpoint){
        revalidateTag("serviceendpoint:"+did)
        return await getServiceEndpointForDidNoCache(did)
    }
    return endpoint
}


export async function getBlobUrl(blob: {cid: string, authorId: string}){
    let serviceEndpoint = await getServiceEndpointForDid(blob.authorId)

    if(serviceEndpoint && serviceEndpoint.toString() != "undefined"){
        return serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid
    }
    return null
}


export async function fetchBlob(blob: {cid: string, authorId: string}, cache: boolean = true) {
    let serviceEndpoint = await getServiceEndpointForDid(blob.authorId)

    if (serviceEndpoint) {
        const url = serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid
        try {
            return await fetch(url, cache ? undefined : {cache: "no-store"})
        } catch (e) {
            console.error("Couldn't fetch blob", blob.cid, blob.authorId)
            return null
        }
    }
    return null
}


