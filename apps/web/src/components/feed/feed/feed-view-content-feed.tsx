import Feed from "./feed";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import LoadingFeedViewContent from "./loading-feed-view-content"
import StaticFeed from "./static-feed";
import {GetFeedProps} from "@/lib/types";
import FeedElement from "./feed-element";
import {FeedProps} from "./types";


type FeedViewContentFeedProps =
    Omit<FeedProps<ArCabildoabiertoFeedDefs.FeedViewContent>, "queryKey" | "initialContents" | "FeedElement" | "LoadingFeedContent" | "getFeed" | "getFeedElementKey">
    & {
    initialContents?: ArCabildoabiertoFeedDefs.FeedViewContent[]
    onClickQuote?: (cid: string) => void
    queryKey?: string[]
    getFeed?: GetFeedProps<ArCabildoabiertoFeedDefs.FeedViewContent>
    pageRootUri?: string
}


export const getFeedElementKey = (e: ArCabildoabiertoFeedDefs.FeedViewContent) => {
    if(!e) return null
    if (ArCabildoabiertoFeedDefs.isPostView(e.content) ||
        ArCabildoabiertoFeedDefs.isArticleView(e.content)
    ) {
        return e.content.uri
    } else if(ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(e.content)) {
        return e.content.id
    } else {
        return null
    }
}

const FeedViewContentFeed = ({
                                 initialContents,
                                 onClickQuote,
                                 queryKey,
                                 getFeed,
                                 pageRootUri,
                                 ...props
                             }: FeedViewContentFeedProps) => {
    if (initialContents) {
        return <StaticFeed
            initialContents={initialContents}
            FeedElement={({content}) => <FeedElement
                elem={content}
                onClickQuote={onClickQuote}
                pageRootUri={pageRootUri}
            />}
            getFeedElementKey={getFeedElementKey}
            {...props}
        />
    } else if (getFeed) {
        return <Feed
            queryKey={queryKey}
            FeedElement={({content}) => <FeedElement
                elem={content}
                onClickQuote={onClickQuote}
                pageRootUri={pageRootUri}
            />}
            LoadingFeedContent={<LoadingFeedViewContent/>}
            getFeedElementKey={getFeedElementKey}
            getFeed={getFeed}
            {...props}
        />
    }

}


export default FeedViewContentFeed