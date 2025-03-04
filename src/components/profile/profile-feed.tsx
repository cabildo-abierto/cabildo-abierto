"use client"
import { useProfileFeed } from "../../hooks/contents"
import Feed from "../feed/feed"


export const ProfileFeed = ({did, profileUser}: {
    profileUser: {did: string, handle: string, displayName?: string}
    did: string
}) => {
    let feed = useProfileFeed(did, "main")

    const name = profileUser ? (profileUser.displayName ? profileUser.displayName : profileUser.handle) : did

    return <Feed
        feed={feed}
        noResultsText={name + " todavía no publicó nada."}
    />
}