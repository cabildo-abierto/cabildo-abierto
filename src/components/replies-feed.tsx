"use client"

import { useRepliesFeed } from "../app/hooks/contents"
import { UserProps } from "../app/lib/definitions"
import Feed from "./feed"



export const RepliesFeed = ({profileUser}: {profileUser: UserProps}) => {
    const feed = useRepliesFeed(profileUser.id)

    return <Feed feed={feed} noResultsText={profileUser.name + " todavía no escribió ninguna respuesta."}/>
}