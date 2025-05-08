import {Feed, FeedProps} from "@/components/feed/feed/feed";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {FeedElement} from "@/components/feed/feed/feed-element";


type FeedViewContentFeedProps = Omit<FeedProps, "initialContents"> & {
    initialContents: FeedViewContent[]
    isThreadFeed?: boolean
    onDeleteFeedElem?: () => Promise<void>
    onClickQuote?: (cid: string) => void
}

export const FeedViewContentFeed = ({
    initialContents,
    isThreadFeed,
    onDeleteFeedElem,
    onClickQuote,
    ...props
}: FeedViewContentFeedProps) => {
    const nodes = initialContents.map((c, i) => {
        return <div key={i}>
            <FeedElement
                elem={c}
                inThreadFeed={isThreadFeed}
                onDeleteFeedElem={onDeleteFeedElem}
                onClickQuote={onClickQuote}
            />
        </div>
    })
    return <Feed
        initialContents={nodes}
        {...props}
    />
}