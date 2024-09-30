import { LoadingFeed, LoadingFeedWithData } from "./feed"
import { useSearch } from "./search-context"
import { FeedWithConfig } from "./sorted-feed"



export const RouteFeed = ({feed, order, filter}: {feed: LoadingFeedWithData, order: string, filter: string}) => {
    const {searchValue} = useSearch()

    if(feed.feed && searchValue.length > 0){
        feed.feed = feed.feed.filter((content) => (content.plainText.toLowerCase().includes(searchValue.toLowerCase()) || (content.title && content.title.toLowerCase().includes(searchValue.toLowerCase()))))
    }
    return <FeedWithConfig feed={feed} order={order} filter={filter}/>
}