import {ArCabildoabiertoFeedDefs, GetFeedOutput} from "@cabildo-abierto/api"
import {GetFeedProps} from "@/lib/types";
import {get, setSearchParams} from "@/components/utils/react/fetch";
import {FeedConfig} from "@cabildo-abierto/api/dist/types/feed";
import {getDidFromUri, getRkeyFromUri} from "@cabildo-abierto/utils";


function getFeedRoute(config: FeedConfig, cursor?: string) {
    let base: string
    if (config.type == "profile") {
        base = `/profile-feed/${config.handleOrDid}/${config.subtype}`
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
        return setSearchParams(subtype == "mentions" ? "/topic-feed" : "/topic-discussion", {
            i: config.id,
            cursor,
            ...params
        })
    }
    return setSearchParams(base, {cursor})
}

export function useGetFeed() {

    function getFeed<T = ArCabildoabiertoFeedDefs.FeedViewContent>(config: FeedConfig): GetFeedProps<T> {
        return (cursor) => {
            const route = getFeedRoute(config, cursor)
            return get<GetFeedOutput<T>>(route)
        }
    }

    return {getFeed}
}