"use client"
import { useProfileFeed } from "@/app/hooks/contents"
import { UserProps } from "@/app/lib/definitions"
import Feed from "@/components/feed"



export const ProfileFeed = ({profileUser}: {profileUser: UserProps}) => {
    let feed = useProfileFeed(profileUser.id)
    console.log(feed)
    return <Feed feed={feed}/>
}