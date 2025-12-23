import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {GetFeedOutput, GetFeedProps} from "@/lib/types";
import {get} from "@/components/utils/react/fetch";
import {FeedConfig} from "@cabildo-abierto/api/dist/types/feed";
import {getDidFromUri, getRkeyFromUri} from "@cabildo-abierto/utils";


function setSearchParams(baseUrl: string, params: {[key: string]: string | undefined}): string {
    const keyValues = Array.from(Object.entries(params))
    if(keyValues.length == 0) {
        return baseUrl
    }
    return baseUrl + "?" + keyValues.filter(([_, value]) => value != undefined).map(([key, value]) => `${key}=${value}`).join("&")
}


function getFeedRoute(config: FeedConfig, cursor?: string) {
    let base: string
    if (config.type == "profile") {
        base = `/profile-feed/${config.did}/${config.subtype}`
    } else if (config.type == "main") {
        const {type, subtype, ...params} = config
        void type
        return setSearchParams(`/feed/${subtype}`, {
            cursor,
            ...params
        })
    } else if (config.type == "custom") {
        base = `/custom-feed/${getDidFromUri(config.uri)}/${getRkeyFromUri(config.uri)}`
    } else {
        const {type, subtype, ...params} = config
        void type
        return setSearchParams(`/topic-feed/${subtype}`, {
            i: config.id,
            cursor,
            ...params
        })
    }
    return setSearchParams(base, {cursor})
}

export function useGetFeed() {

    function getFeed<T = ArCabildoabiertoFeedDefs.FeedViewContent>(config: FeedConfig):  GetFeedProps<T> {
        return async (cursor) => {
            const {
                error,
                data
            } = await get<GetFeedOutput<T>>(getFeedRoute(config, cursor))
            if (error) return {error}

            return {
                data: data
            }
        }
    }

    return {getFeed}
}