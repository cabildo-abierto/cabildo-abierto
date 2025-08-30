import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import UserSearchResult from "@/components/buscar/user-search-result";
import Feed from "@/components/feed/feed/feed";
import {get} from "@/utils/fetch";
import {splitUri} from "@/utils/uri";

export type DetailType = "likes" | "reposts"

export const DetailsContent = ({detail, uri}: {detail: DetailType, uri:string}) => {
    const text = detail === "likes" ? "me gustas" : "republicaciones"

    async function getDetails(cursor: string): Promise<{error?: string, data?: {feed: ProfileViewBasic[], cursor: string | null}}> {
        const {did, collection, rkey} = splitUri(uri)
        const {error, data} = await get<ProfileViewBasic[]>(`/${detail}/${did}/${collection}/${rkey}/25/${cursor ?? 0}`)
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
        getFeed={getDetails}
        noResultsText={"La publicación no recibió " + text + "."}
        endText={undefined}
    />
}