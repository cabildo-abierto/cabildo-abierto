"use client"

import { useRepliesFeed } from "../hooks/contents"
import Feed from "./feed/feed"



export const RepliesFeed = ({profileUser}: {profileUser: {did: string, handle: string, displayName?: string}}) => {
    const feed = useRepliesFeed(profileUser.did)

    const name = profileUser.displayName ? profileUser.displayName : profileUser.handle
    return <Feed feed={feed} noResultsText={name + " todavía no escribió ninguna respuesta."} showReplies={true}/>
}