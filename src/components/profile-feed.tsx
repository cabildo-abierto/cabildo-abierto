"use client"
import { useProfileFeed } from "../app/hooks/contents"
import { UserProps } from "../app/lib/definitions"
import Feed from "./feed"
import LoadingSpinner from "./loading-spinner"


export const ProfileFeed = ({profileUser, showingFakeNews}: {profileUser: UserProps, showingFakeNews: boolean}) => {
    let feed = useProfileFeed(profileUser.id)

    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    if(!feed.feed){
        return <></>
    }

    const fakeNews = feed.feed.filter((content) => (content.fakeReportsCount > 0))

    const fakeNewsFeed = <Feed feed={{feed: fakeNews, isLoading: false, isError: false}} noResultsText={profileUser.displayName + " no recibió reportes de información falsa."}/>

    const normalFeed = <Feed feed={feed} noResultsText={profileUser.displayName + " todavía no publicó nada."}/>
    
    return showingFakeNews ? fakeNewsFeed : normalFeed
}