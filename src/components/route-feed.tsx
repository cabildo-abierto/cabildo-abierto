import { useFeed, useFollowingFeed } from "@/app/hooks/contents"
import { useUser } from "@/app/hooks/user"
import LoadingSpinner from "./loading-spinner"
import { entityInRoute } from "./wiki-categories"
import Feed from "./feed"



export const RouteFeed = ({route, following}: {route: string[], following: boolean}) => {
    let {user} = useUser()
    let feed = useFeed()
    let followingFeed = useFollowingFeed(user.id)

    let selectedFeed = !following ? feed : followingFeed
    
    if(selectedFeed.isLoading){
        return <LoadingSpinner/>
    }

    if(!selectedFeed){
        return <></>
    }

    selectedFeed.feed = selectedFeed.feed.filter(({entityReferences}) => {
        return route.length == 0 || entityReferences.some((entity) => {
            return entityInRoute(entity, route)
        })
    })

    return <Feed feed={selectedFeed}/>
}