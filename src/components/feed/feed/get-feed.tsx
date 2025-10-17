import {get} from "@/utils/fetch";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {FeedFormatOption, FollowingFeedFilterOption, GetFeedOutput, GetFeedProps} from "@/lib/types";


function setSearchParams(baseUrl: string, params: {[key: string]: string | undefined}): string {
    const keyValues = Array.from(Object.entries(params))
    if(keyValues.length == 0) {
        return baseUrl
    }
    return baseUrl + "?" + keyValues.filter(([_, value]) => value != undefined).map(([key, value]) => `${key}=${value}`).join("&")
}


function getFeedRoute(type: string, handleOrDid?: string, cursor?: string, params?: {metric?: string, time?: string, filter?: FollowingFeedFilterOption, format?: FeedFormatOption}) {
    let base: string
    if (["publicaciones", "respuestas", "ediciones", "articulos"].includes(type) && handleOrDid) {
        base = `/profile-feed/${handleOrDid}/${type}`
    } else if (["siguiendo", "discusion", "descubrir"].includes(type)) {
        base = `/feed/${type}`
    } else {
        throw new Error(`Tipo de feed inválido: ${type}`)
    }
    if(params){
        return setSearchParams(base, {...params, cursor})
    }
    return setSearchParams(base, {cursor})
}


export function getFeed<T = ArCabildoabiertoFeedDefs.FeedViewContent>({handleOrDid, type, params}: {
    handleOrDid?: string
    type: string
    params?: {metric?: string, time?: string, filter?: FollowingFeedFilterOption, format?: FeedFormatOption}
}): GetFeedProps<T> {
    return async (cursor) => {
        const {
            error,
            data
        } = await get<GetFeedOutput<T>>(getFeedRoute(type, handleOrDid, cursor, params))
        if (error) return {error}
        return {
            data: data
        }
    }
}