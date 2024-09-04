"use client"
import { useProfileFeed } from "src/app/hooks/contents"
import { UserProps } from "src/app/lib/definitions"
import Feed from "src/components/feed"



export const ProfileFeed = ({profileUser}: {profileUser: UserProps}) => {
    let feed = useProfileFeed(profileUser.id)
    return <Feed feed={feed} noResultsText={profileUser.name + " todavía no publicó nada."}/>
}