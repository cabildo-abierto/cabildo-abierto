"use client"

import {useProfileFeed} from "../hooks/contents"
import Feed from "./feed/feed"


export const WikiFeed = ({profileUser}: {profileUser: {did: string, handle: string, displayName?: string}}) => {
    const feed = useProfileFeed(profileUser.did, "edits")

    const name = profileUser.displayName ? profileUser.displayName : profileUser.handle

    return <Feed feed={feed} noResultsText={name + " todavía no hizo ninguna edición."}/>
}