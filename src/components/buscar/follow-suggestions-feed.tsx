import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import UserSearchResult from "@/components/buscar/user-search-result";
import Feed from "@/components/feed/feed/feed";
import {get} from "@/utils/fetch";


export const FollowSuggestionsFeed = () => {

    async function getFollowSuggestions(cursor: string): Promise<{error?: string, data?: {feed: ProfileViewBasic[], cursor: string | null}}> {
        const {error, data} = await get<ProfileViewBasic[]>(`/follow-suggestions/25/${cursor ?? 0}`)
        if(error) return {error}
        return {data: {feed: data, cursor: (parseInt(cursor ?? "0") + data.length).toString()}}
    }

    return <Feed<ProfileViewBasic>
        queryKey={["follow-suggestions-feed"]}
        FeedElement={({content}) => {
            return <div key={content.did}>
                <UserSearchResult user={content} isSuggestion={true}/>
            </div>
        }}
        getFeedElementKey={u => u.did}
        getFeed={getFollowSuggestions}
        noResultsText={"No se pudieron obtener sugerencias."}
        endText={"Llegaste al final de las sugerencias."}
    />
}