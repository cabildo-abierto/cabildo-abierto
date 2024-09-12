import { SmallContentProps } from "../app/lib/definitions"
import Feed, { LoadingFeed } from "./feed"
import { useSearch } from "./search-context"



export const RouteFeed = ({feed}: {feed: LoadingFeed}) => {
    const {searchValue} = useSearch()

    // TO DO: Debería ser la versión parseada del texto y no diferencias mayus y min
    if(feed.feed && searchValue.length > 0)
        feed.feed = feed.feed.filter((content) => (content.text.includes(searchValue) || (content.title && content.title.includes(searchValue))))

    return <Feed feed={feed}/>
}