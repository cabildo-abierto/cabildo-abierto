"use client"

import {useProfileFeed} from "../../hooks/contents"
import Feed from "../feed/feed"



export const RepliesFeed = ({
    profileUser,
    did
}: {
    profileUser: {did: string, handle: string, displayName?: string}
    did: string
}) => {
    const feed = useProfileFeed(did, "replies")

    const name = profileUser ? (profileUser.displayName ? profileUser.displayName : profileUser.handle) : ""

    return <Feed
        feed={feed}
        noResultsText={name + " todavía no escribió ninguna respuesta."}
    />
}