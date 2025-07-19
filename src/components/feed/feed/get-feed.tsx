import {get} from "@/utils/fetch";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {GetFeedOutput, GetFeedProps} from "@/lib/types";
import {FeedFormatOption, FollowingFeedFilterOption} from "@/components/inicio/main-page";


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


export const getFeed = ({handleOrDid, type, params}: {
    handleOrDid?: string
    type: string
    params?: {metric?: string, time?: string, filter?: FollowingFeedFilterOption, format?: FeedFormatOption}
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