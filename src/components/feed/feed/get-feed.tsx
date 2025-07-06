import {get} from "@/utils/fetch";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {GetFeedOutput, GetFeedProps} from "@/lib/types";


function getFeedRoute(type: string, handleOrDid?: string, cursor?: string, params?: {metric: string, time: string}) {
    let base: string
    if (["siguiendo", "discusion", "descubrir"].includes(type)) {
        base = `/feed/${type}`
    } else if (["publicaciones", "respuestas", "ediciones"].includes(type)) {
        base = `/profile-feed/${handleOrDid}/${type}`
    } else {
        throw new Error(`Tipo de feed inválido: ${type}`)
    }
    if(params){
        return base + `?metric=${params.metric}&time=${params.time}` + (cursor ? `&cursor=${cursor}` : "")
    }
    return base + (cursor ? `?cursor=${cursor}` : "")
}


export const getFeed = ({handleOrDid, type, params}: {
    handleOrDid?: string
    type: string
    params?: {metric: string, time: string}
}): GetFeedProps<FeedViewContent> =>
    async (cursor) => {
        const {
            error,
            data
        } = await get<GetFeedOutput<FeedViewContent>>(getFeedRoute(type, handleOrDid, cursor, params))

        if (error) return {error}
        return {
            data: data
        }
    }