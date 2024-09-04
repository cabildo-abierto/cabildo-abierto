import { useFeed, useFollowingFeed } from "src/app/hooks/contents"
import { useUser } from "src/app/hooks/user"
import LoadingSpinner from "./loading-spinner"
import { entityInRoute } from "./wiki-categories"
import Feed, { FeedProps } from "./feed"
import { searchContents } from "./search"
import { useSearch } from "./search-context"



export const RouteFeed = ({route, following}: {route: string[], following: boolean}) => {
    let {user} = useUser()
    let feed = useFeed()
    let followingFeed = useFollowingFeed()
    const {searchValue} = useSearch()

    let selectedFeed = !following ? feed : followingFeed
    
    if(selectedFeed.isLoading){
        return <LoadingSpinner/>
    }

    if(!selectedFeed){
        return <></>
    }

    let filteredFeed: {id: string}[] = selectedFeed.feed.filter(({entityReferences}) => {
        return route.length == 0 || entityReferences.some((entity) => {
            return entityInRoute(entity, route)
        })
    })

    if(searchValue.length > 0)
        filteredFeed = searchContents(searchValue, selectedFeed.feed)

    return <Feed feed={{feed: filteredFeed, isLoading: false, isError: false}}/>
}