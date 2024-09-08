"use client"
import { useEditsFeed } from "src/app/hooks/contents"
import { UserProps } from "src/app/lib/definitions"
import Feed from "src/components/feed"



export const WikiFeed = ({profileUser}: {profileUser: UserProps}) => {
    let feed = useEditsFeed(profileUser.id)
    return <Feed feed={feed} maxSize={10} noResultsText={profileUser.name + " todavía no hizo ninguna edición."}/>
}