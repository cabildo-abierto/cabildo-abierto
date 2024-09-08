import { useRouteFeed, useRouteFollowingFeed } from "src/app/hooks/contents"
import { useUser } from "src/app/hooks/user"
import LoadingSpinner from "./loading-spinner"
import Feed, { FeedProps } from "./feed"
import { searchContents } from "./search"
import { useSearch } from "./search-context"



export const RouteFeed = ({route, following}: {route: string[], following: boolean}) => {
    let feed = useRouteFeed(route)
    let followingFeed = useRouteFollowingFeed(route)
    const {searchValue} = useSearch()

    let selectedFeed = !following ? feed : followingFeed
    
    if(selectedFeed.isLoading){
        return <LoadingSpinner/>
    }

    if(!selectedFeed){
        return <></>
    }

    // TO DO: Debería ser la versión parseada del texto y no diferencias mayus y min
    if(searchValue.length > 0)
        selectedFeed.feed = selectedFeed.feed.filter((content) => (content.text.includes(searchValue) || (content.title && content.title.includes(searchValue))))

    return <Feed feed={selectedFeed}/>
}