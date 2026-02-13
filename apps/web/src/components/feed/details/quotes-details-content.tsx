import Feed from "../feed/feed";
import {get} from "../../utils/react/fetch";
import {splitUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoFeedDefs, GetFeedOutput} from "@cabildo-abierto/api"
import dynamic from "next/dynamic";

const PostPreview = dynamic(() => import("../post/post-preview").then(mod => mod.PostPreview), {ssr: false})

export const QuotesDetailsContent = ({uri}: { uri: string }) => {
    async function getQuotesDetails(cursor: string) {
        const {did, collection, rkey} = splitUri(uri)
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.PostView>>(`/quotes/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`)
    }

    return <Feed<ArCabildoabiertoFeedDefs.PostView>
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