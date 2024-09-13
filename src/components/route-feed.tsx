import { LoadingFeed, LoadingFeedWithData } from "./feed"
import { useSearch } from "./search-context"
import { FeedWithConfig } from "./sorted-feed"



export const RouteFeed = ({feed, defaultOrder="Populares"}: {feed: LoadingFeedWithData, defaultOrder?: string}) => {
    const {searchValue} = useSearch()

    if(feed.feed && searchValue.length > 0){
        feed.feed = feed.feed.filter((content) => (content.text.includes(searchValue) || (content.title && content.title.includes(searchValue))))
    }
    return <FeedWithConfig feed={feed} defaultOrder={defaultOrder}/>
}