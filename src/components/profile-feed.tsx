"use client"
import { useProfileFeed } from "../app/hooks/contents"
import { UserProps, SmallContentProps } from "../app/lib/definitions"
import Feed, { LoadingFeed } from "./feed"


export const ProfileFeed = ({profileUser}: {profileUser: UserProps}) => {
    const feed = useProfileFeed(profileUser.id)

    return <Feed feed={feed} noResultsText={profileUser.name + " todavía no publicó nada."}/>
}