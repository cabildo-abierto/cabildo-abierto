import { useRouteFeed, useRouteFollowingFeed } from "src/app/hooks/contents"
import { useUser } from "src/app/hooks/user"
import LoadingSpinner from "./loading-spinner"
import Feed, { FeedProps } from "./feed"
import { searchContents } from "./search"
import { useSearch } from "./search-context"
import { SmallContentProps } from "src/app/lib/definitions"



export const RouteFeed = ({feed}: {feed: SmallContentProps[]}) => {
    const {searchValue} = useSearch()

    // TO DO: Debería ser la versión parseada del texto y no diferencias mayus y min
    if(searchValue.length > 0)
        feed = feed.filter((content) => (content.text.includes(searchValue) || (content.title && content.title.includes(searchValue))))

    return <Feed feed={{feed: feed, isLoading: false, isError: false}}/>
}