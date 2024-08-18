"use client"
import { UserProps } from "@/actions/get-user"
import { useProfileFeed } from "@/app/hooks/contents"
import Feed from "@/components/feed"



export const ProfileFeed = ({profileUser, user}: {profileUser: UserProps, user?: UserProps}) => {
    let feed = useProfileFeed(profileUser.id)
    return <Feed feed={feed}/>
}