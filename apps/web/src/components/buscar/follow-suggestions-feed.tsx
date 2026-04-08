import UserSearchResult from "./user-search-result";
import Feed from "../feed/feed/feed";
import {ArCabildoabiertoActorDefs, FollowSuggestionsOutput} from "@cabildo-abierto/api";
import { get } from "@/components/utils/react/fetch";


export const FollowSuggestionsFeed = () => {
    async function getFollowSuggestions(cursor: string) {
        const limit = 25
        return get<FollowSuggestionsOutput>(`/follow-suggestions/${limit}/${cursor ?? 0}`)
    }

    return <Feed<ArCabildoabiertoActorDefs.ProfileView>
        queryKey={["follow-suggestions-feed"]}
        FeedElement={({content: user}) => {
            return <div key={user.did}>
                <UserSearchResult user={{...user, $type: "ar.cabildoabierto.actor.defs#profileView"}} isSuggestion={true}/>
            </div>
        }}
        getFeedElementKey={u => u.did}
        getFeed={getFollowSuggestions}
        noResultsText={"No se pudieron obtener sugerencias."}
        endText={"No tenemos más sugerencias por ahora."}
        estimateSize={100}
    />
}