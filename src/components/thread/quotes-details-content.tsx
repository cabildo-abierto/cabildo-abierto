import Feed from "@/components/feed/feed/feed";
import {get} from "@/utils/fetch";
import {splitUri} from "@/utils/uri";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {PostPreview} from "@/components/feed/post/post-preview";


export const QuotesDetailsContent = ({uri}: { uri: string }) => {
    async function getQuotesDetails(cursor: string): Promise<{error?: string, data?: {feed: PostView[], cursor: string | null}}> {
        const {did, collection, rkey} = splitUri(uri)
        const {error, data} = await get<{ posts: PostView[], cursor: string }>(`/quotes/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`)
        if(error) return {error}

        return {data: {feed: data.posts, cursor: data.cursor}}
    }

    return <Feed<PostView>
        queryKey={["details-content", "quotes", uri]}
        FeedElement={({content}) => {
            return <div key={content.uri}>
                <PostPreview postView={content}/>
            </div>
        }}
        getFeedElementKey={u => u.uri}
        getFeed={getQuotesDetails}
        noResultsText={"La publicación no recibió citas."}
        endText={undefined}
        estimateSize={500}
    />
}