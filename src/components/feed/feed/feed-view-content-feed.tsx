import Feed, {FeedProps} from "@/components/feed/feed/feed";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import LoadingFeedViewContent from "@/components/feed/feed/loading-feed-view-content"
import dynamic from "next/dynamic";
import StaticFeed from "@/components/feed/feed/static-feed";
import {GetFeedProps} from "@/lib/types";

const FeedElement = dynamic(() => import('@/components/feed/feed/feed-element'));


type FeedViewContentFeedProps =
    Omit<FeedProps<FeedViewContent>, "initialContents" | "FeedElement" | "LoadingFeedContent" | "getFeed">
    & {
    initialContents?: FeedViewContent[]
    isThreadFeed?: boolean
    onClickQuote?: (cid: string) => void
    queryKey: string[]
    getFeed?: GetFeedProps<FeedViewContent>
}

const FeedViewContentFeed = ({
                                 initialContents,
                                 isThreadFeed,
                                 onClickQuote,
                                 queryKey,
                                 getFeed,
                                 ...props
                             }: FeedViewContentFeedProps) => {

    if (initialContents) {
        return <StaticFeed
            queryKey={queryKey}
            initialContents={initialContents}
            FeedElement={({content}) => <FeedElement
                elem={content}
                inThreadFeed={isThreadFeed}
                onClickQuote={onClickQuote}
            />}
            {...props}
        />
    } else if (getFeed) {
        return <Feed
            queryKey={queryKey}
            FeedElement={({content}) => <FeedElement
                elem={content}
                inThreadFeed={isThreadFeed}
                onClickQuote={onClickQuote}
            />}
            LoadingFeedContent={<LoadingFeedViewContent/>}
            getFeed={getFeed}
            {...props}
        />
    }

}


export default FeedViewContentFeed