"use client"
import { useProfileFeed } from "../hooks/contents"
import Feed from "./feed/feed"


export const ProfileFeed = ({profileUser, showingFakeNews}: {profileUser: {did: string, handle: string, displayName?: string}, showingFakeNews: boolean}) => {
    let feed = useProfileFeed(profileUser.did, "main")

    const name = profileUser.displayName ? profileUser.displayName : profileUser.handle

    return <Feed feed={feed} noResultsText={name + " todavía no publicó nada."}/>
}