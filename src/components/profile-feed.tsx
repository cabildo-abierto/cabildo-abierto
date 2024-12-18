"use client"
import { useProfileFeed } from "../hooks/contents"
import Feed from "./feed/feed"
import LoadingSpinner from "./loading-spinner"


export const ProfileFeed = ({profileUser, showingFakeNews}: {profileUser: {did: string, handle: string, displayName?: string}, showingFakeNews: boolean}) => {
    let feed = useProfileFeed(profileUser.did)

    if(feed.isLoading){
        return <LoadingSpinner/>
    }

    if(!feed.feed){
        return <></>
    }

    /*const fakeNews = feed.feed.filter((content) => (content.fakeReportsCount > 0))

    const fakeNewsFeed = <Feed feed={{feed: fakeNews, isLoading: false, isError: false}} noResultsText={profileUser.displayName + " no recibió reportes de información falsa."}/>*/

    const name = profileUser.displayName ? profileUser.displayName : profileUser.handle

    const normalFeed = <Feed feed={feed} noResultsText={name + " todavía no publicó nada."}/>
    
    return normalFeed

    //return showingFakeNews ? fakeNewsFeed : normalFeed
}