import Feed, {FeedProps} from "@/components/feed/feed/feed";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import LoadingFeedViewContent from "@/components/feed/feed/loading-feed-view-content"
import StaticFeed from "@/components/feed/feed/static-feed";
import {GetFeedProps} from "@/lib/types";
import FeedElement from "@/components/feed/feed/feed-element";



type FeedViewContentFeedProps =
    Omit<FeedProps<ArCabildoabiertoFeedDefs.FeedViewContent>, "initialContents" | "FeedElement" | "LoadingFeedContent" | "getFeed" | "getFeedElementKey">
    & {
    initialContents?: ArCabildoabiertoFeedDefs.FeedViewContent[]
    onClickQuote?: (cid: string) => void
    queryKey: string[]
    getFeed?: GetFeedProps<ArCabildoabiertoFeedDefs.FeedViewContent>
    pageRootUri?: string
}

const FeedViewContentFeed = ({
                                 initialContents,
                                 onClickQuote,
                                 queryKey,
                                 getFeed,
                                 pageRootUri,
                                 ...props
                             }: FeedViewContentFeedProps) => {

    const getFeedElementKey = (e: ArCabildoabiertoFeedDefs.FeedViewContent) => {
        if (ArCabildoabiertoFeedDefs.isPostView(e.content) || ArCabildoabiertoFeedDefs.isArticleView(e.content)) {
            return e.content.uri
        } else {
            return null
        }
    }

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