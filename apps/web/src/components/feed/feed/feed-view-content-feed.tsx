import Feed from "./feed";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import LoadingFeedViewContent from "./loading-feed-view-content"
import StaticFeed from "./static-feed";
import {GetFeedProps} from "@/lib/types";
import {FeedMerger, FeedProps} from "./types";
import dynamic from "next/dynamic";


const FeedElement = dynamic(() => import("./feed-element"), {
    ssr: false
})


type FeedViewContentFeedProps =
    Omit<FeedProps<ArCabildoabiertoFeedDefs.FeedViewContent>, "queryKey" | "initialContents" | "FeedElement" | "LoadingFeedContent" | "getFeed" | "getFeedElementKey">
    & {
    initialContents?: ArCabildoabiertoFeedDefs.FeedViewContent[]
    onClickQuote?: (cid: string) => void
    queryKey?: string[]
    getFeed?: GetFeedProps<ArCabildoabiertoFeedDefs.FeedViewContent>
    pageRootUri?: string
    feedMerger?: FeedMerger<ArCabildoabiertoFeedDefs.FeedViewContent>
}


export const getFeedElementKey = (e: ArCabildoabiertoFeedDefs.FeedViewContent) => {
    if (!e) return null
    if (ArCabildoabiertoFeedDefs.isPostView(e.content) ||
        ArCabildoabiertoFeedDefs.isArticleView(e.content)
    ) {
        return e.content.uri
    } else if (ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(e.content)) {
        return e.content.versionRef?.uri ?? null
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
                                 feedMerger,
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
            feedMerger={feedMerger}
            {...props}
        />
    }

}


export default FeedViewContentFeed