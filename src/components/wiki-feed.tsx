"use client"

import { useEditsFeed } from "../app/hooks/contents"
import Feed from "./feed"


export const WikiFeed = ({profileUser}: {profileUser: {did: string, handle: string, displayName?: string}}) => {
    const feed = useEditsFeed(profileUser.did)
    
    const name = profileUser.displayName ? profileUser.displayName : profileUser.handle

    return <Feed feed={feed} noResultsText={name + " todavía no hizo ninguna edición."}/>
}