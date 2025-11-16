import UserSearchResult from "./user-search-result";
import Feed from "../feed/feed/feed";
import { ArCabildoabiertoActorDefs } from "@cabildo-abierto/api";
import { get } from "@/components/utils/react/fetch";


export const FollowSuggestionsFeed = () => {
    async function getFollowSuggestions(cursor: string): Promise<{error?: string, data?: {feed: ArCabildoabiertoActorDefs.ProfileViewBasic[], cursor: string | null}}> {
        const limit = 25
        const {error, data} = await get<{profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[], cursor?: string}>(`/follow-suggestions/${limit}/${cursor ?? 0}`)
        if(error) return {error}
        return {data: {feed: data.profiles, cursor: data.cursor}}
    }

    return <Feed<ArCabildoabiertoActorDefs.ProfileViewBasic>
        queryKey={["follow-suggestions-feed"]}
        FeedElement={({content}) => {
            return <div key={content.did}>
                <UserSearchResult user={content} isSuggestion={true}/>
            </div>
        }}
        getFeedElementKey={u => u.did}
        getFeed={getFollowSuggestions}
        noResultsText={"No se pudieron obtener sugerencias."}
        endText={"No tenemos más sugerencias por ahora."}
        estimateSize={100}
    />
}