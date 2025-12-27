import {FeedView, GetFeedOutput} from "@cabildo-abierto/api";
import { useState} from "react";
import { useDebounce } from "../utils/react/debounce";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {FeedPreview} from "@/components/feeds/feed-preview";
import {get, setSearchParams} from "../utils/react/fetch";
import Feed from "@/components/feed/feed/feed";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";


async function searchCustomFeeds(query: string, cursor: string | undefined) {
    const route = setSearchParams("/custom-feeds", {q: query.length > 0 ? query : undefined, cursor})

    return await get<GetFeedOutput<FeedView>>(route)
}


export const CustomFeeds = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedQuery = useDebounce(searchQuery, 300)
    const {isMobile} = useLayoutConfig()

    return <div className={"space-y-2 pt-2"}>
        <BaseTextField
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value)
            }}
            placeholder={"Buscar..."}
            className={isMobile ? "px-2" : "px-4"}
        />
        <Feed<FeedView>
            noResultsText={debouncedQuery.length > 0 ? "No se encontraron resultados." : "Ocurrió un error al obtener los muros."}
            endText={"No tenemos más muros para mostrarte."}
            getFeed={async (cursor) => {
                return await searchCustomFeeds(debouncedQuery, cursor)
            }}
            FeedElement={(e) => {
                return <FeedPreview
                    feed={e.content}
                />
            }}
            queryKey={["custom-feeds", "search", debouncedQuery]}
            getFeedElementKey={f => {
                if(f.type == "custom") {
                    return f.feed.cid
                }
                return null
            }}
            estimateSize={300}
        />
    </div>
}