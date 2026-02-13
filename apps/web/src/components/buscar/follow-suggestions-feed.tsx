import UserSearchResult from "./user-search-result";
import Feed from "../feed/feed/feed";
import {ArCabildoabiertoActorDefs, GetFeedOutput} from "@cabildo-abierto/api";
import { get } from "@/components/utils/react/fetch";


export const FollowSuggestionsFeed = () => {
    async function getFollowSuggestions(cursor: string) {
        const limit = 25
        return get<GetFeedOutput<ArCabildoabiertoActorDefs.ProfileViewBasic>>(`/follow-suggestions/${limit}/${cursor ?? 0}`)
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