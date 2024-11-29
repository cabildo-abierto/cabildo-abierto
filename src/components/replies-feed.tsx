"use client"

import { useRepliesFeed } from "../app/hooks/contents"
import Feed from "./feed"



export const RepliesFeed = ({profileUser}: {profileUser: {id: string, displayName: string}}) => {
    const feed = useRepliesFeed(profileUser.id)

    return <Feed feed={feed} noResultsText={profileUser.displayName + " todavía no escribió ninguna respuesta."}/>
}