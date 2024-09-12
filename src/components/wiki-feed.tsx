"use client"

import { useEditsFeed } from "../app/hooks/contents"
import { UserProps } from "../app/lib/definitions"
import Feed from "./feed"


export const WikiFeed = ({profileUser}: {profileUser: UserProps}) => {
    const feed = useEditsFeed(profileUser.id)
    
    return <Feed feed={feed} maxSize={10} noResultsText={profileUser.name + " todavía no hizo ninguna edición."}/>
}