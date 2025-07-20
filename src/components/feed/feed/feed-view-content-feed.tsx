import Feed, {FeedProps} from "@/components/feed/feed/feed";
import {FeedViewContent, isArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import LoadingFeedViewContent from "@/components/feed/feed/loading-feed-view-content"
import dynamic from "next/dynamic";
import StaticFeed from "@/components/feed/feed/static-feed";
import {GetFeedProps} from "@/lib/types";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";

const FeedElement = dynamic(() => import('@/components/feed/feed/feed-element'));


type FeedViewContentFeedProps =
    Omit<FeedProps<FeedViewContent>, "initialContents" | "FeedElement" | "LoadingFeedContent" | "getFeed" | "getFeedElementKey">
    & {
    initialContents?: FeedViewContent[]
    onClickQuote?: (cid: string) => void
    queryKey: string[]
    getFeed?: GetFeedProps<FeedViewContent>
}

const FeedViewContentFeed = ({
                                 initialContents,
                                 onClickQuote,
                                 queryKey,
                                 getFeed,
                                 ...props
                             }: FeedViewContentFeedProps) => {

    const getFeedElementKey = (e: FeedViewContent) => {
        if(isPostView(e.content) || isArticleView(e.content)){
            return e.content.uri
        } else {
            return null
        }
    }

    if (initialContents) {
        return <StaticFeed
            queryKey={queryKey}
            initialContents={initialContents}
            FeedElement={({content}) => <FeedElement
                elem={content}
                onClickQuote={onClickQuote}
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
            />}
            LoadingFeedContent={<LoadingFeedViewContent/>}
            getFeedElementKey={getFeedElementKey}
            getFeed={getFeed}
            {...props}
        />
    }

}


export default FeedViewContentFeed