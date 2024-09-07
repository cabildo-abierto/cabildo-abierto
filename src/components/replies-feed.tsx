"use client"
import {useRepliesFeed} from "src/app/hooks/contents"
import { UserProps } from "src/app/lib/definitions"
import Feed from "src/components/feed"



export const RepliesFeed = ({profileUser}: {profileUser: UserProps}) => {
    let feed = useRepliesFeed(profileUser.id)
    
    return <Feed feed={feed} noResultsText={profileUser.name + " todavía no escribió ninguna respuesta."}/>
}