import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import UserSearchResult from "@/components/buscar/user-search-result";
import Feed from "@/components/feed/feed/feed";
import {get} from "@/utils/fetch";
import {splitUri} from "@/utils/uri";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {PostPreview} from "@/components/feed/post/post-preview";

export type DetailType = "likes" | "reposts"

export const DetailsContent = ({detail, uri}: {detail: DetailType, uri:string}) => {
    const text = detail === "likes" ? "me gustas" : (detail === "reposts" ? "republicaciones" : "citas")

    async function getDetails(cursor: string): Promise<{error?: string, data?: {feed: ProfileViewBasic[], cursor: string | null}}> {
        const {did, collection, rkey} = splitUri(uri)
        const {error, data} = await get<{ profiles: ProfileViewBasic[], cursor: string }>(`/${detail}/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`)
        console.log("details", data.profiles.length, error)
        if(error) return {error}

        return {data: {feed: data.profiles, cursor: data.cursor}}
    }

    return <Feed<ProfileViewBasic>
        queryKey={["get-details", detail, uri]}
        FeedElement={({content}) => {
            return <div key={content.did}>
                <UserSearchResult user={content}/>
            </div>
        }}
        getFeedElementKey={u => u.did}
        getFeed={getDetails}
        noResultsText={"La publicación no recibió " + text + "."}
        endText={undefined}
    />
}

export const QuotesDetailsContent = ({uri}: { uri: string }) => {
    async function getQuotesDetails(cursor: string): Promise<{error?: string, data?: {feed: PostView[], cursor: string | null}}> {
        const {did, collection, rkey} = splitUri(uri)
        const {error, data} = await get<{ posts: PostView[], cursor: string }>(`/quotes/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`)
        if(error) return {error}

        return {data: {feed: data.posts, cursor: data.cursor}}
    }

    return <Feed<PostView>
        queryKey={["get-details-quotes", uri]}
        FeedElement={({content}) => {
            return <div key={content.uri}>
                <PostPreview postView={content}/>
            </div>
        }}
        getFeedElementKey={u => u.uri}
        getFeed={getQuotesDetails}
        noResultsText={"La publicación no recibió citas."}
        endText={undefined}
    />
}