import {CAHandler} from "#/utils/handler.js";
import {getServiceEndpointForDid} from "#/services/blob.js";
import {allCollections, getUserRepo} from "#/services/sync/sync-user.js";

type UserRepoCounts = {
    counts: {
        collection: string
        count: number
    }[]
}

export const getRepoCounts: CAHandler<{params: {handleOrDid: string}}, UserRepoCounts> = async (ctx, agent, {params}) => {
    const {handleOrDid} = params
    const did = await ctx.resolver.resolveHandleToDid(handleOrDid)
    if(!did){
        return {error: "No se encontró el usuario"}
    }

    const doc = await getServiceEndpointForDid(ctx, did)
    if(typeof doc != "string"){
        return {error: "No se encontró el repositorio."}
    }

    let {repo, error} = await getUserRepo(ctx, did, doc, allCollections)
    if(!repo){
        return {error}
    }

    const counts = new Map<string, number>()
    for(const [c, r] of repo.entries()){
        counts.set(c, r.length)
    }

    return {
        data: {
            counts: Array.from(counts.entries()).map(c => {
                return {
                    collection: c[0],
                    count: c[1]
                }
            })
        }
    }
}