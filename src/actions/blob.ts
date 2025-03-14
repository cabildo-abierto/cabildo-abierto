import {getSessionAgent} from "./auth";
import {DidResolver} from "@atproto/identity";
import {unstable_cache} from "next/cache";
import {revalidateEverythingTime} from "./utils";


export async function createBlobFromFile(f: File){
    const {agent, did} = await getSessionAgent()
    const headers: Record<string, string> = {
        "Content-Length": f.size.toString()
    }
    const res = await agent.uploadBlob(f, {headers})
}


export async function getServiceEndpointForDidNoCache(did: string){
    const didres: DidResolver = new DidResolver({})
    const doc = await didres.resolve(did)
    if(doc && doc.service && doc.service.length > 0 && doc.service[0].serviceEndpoint){
        return doc.service[0].serviceEndpoint
    }
    return null
}


export async function getServiceEndpointForDid(did: string){
    return unstable_cache(async () => {
            return await getServiceEndpointForDidNoCache(did)
        },
        ["serviceendpoint:"+did],
        {
            tags: ["serviceendpoint:"+did],
            revalidate: revalidateEverythingTime
        })()
}


export async function fetchBlob(blob: {cid: string, authorId: string}, cache: boolean = true) {
    const t1 = new Date().getTime()
    let serviceEndpoint = await getServiceEndpointForDid(blob.authorId)
    const t2 = new Date().getTime()

    if (serviceEndpoint) {
        const url = serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid
        try {
            return await fetch(url, cache ? undefined : {cache: "no-store"})
        } catch (e) {
            console.error("Couldn't fetch blob", blob.cid, blob.authorId)
            return null
        }
    }
    //console.log("couldn't resolve did doc", blob.authorId)
    return null
}


