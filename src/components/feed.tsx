"use client"
import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { ContentAndChildrenProps, ContentProps } from "@/actions/get-content";
import { useContents } from "./use-contents";
import { useUser } from "./user-provider";
import { UserProps } from "@/actions/get-user";


export function feedFromContents(contents: Record<string, ContentProps>){
    const feed: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(content.type == "Post" || content.type == "FastPost"){
            feed.push(content)
        }
    })
    return feed
}


export function followingFeedFromContents(contents: Record<string, ContentProps>, user: UserProps){
    const feed: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(content.type == "Post" || content.type == "FastPost"){
            if(user.following.some((u) => u.id == content.author?.id))
                feed.push(content)
        }
    })
    return feed
}


export function profileFeedFromContents(contents: Record<string, ContentProps>, user: UserProps){
    const feed: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(content.type == "Post" || content.type == "FastPost" || content.type == "Comment"){
            if(content.author?.id == user.id)
                feed.push(content)
        }
    })
    return feed
}


const Feed: React.FC<any> = ({onlyFollowing=false, userProfile=null}) => {
    const {contents, setContents} = useContents()
    const {user, setUser} = useUser()

    if(!contents || (!user && onlyFollowing)){
        return <div className="h-full w-full flex items-center justify-center">
            Cargando...
        </div>
    }

    let feed: ContentProps[] = []
    if(onlyFollowing){
        feed = followingFeedFromContents(contents, user as UserProps)
    } else if(userProfile) {
        feed = profileFeedFromContents(contents, userProfile)
    } else {
        feed = feedFromContents(contents)
    }
    
    return <div className="h-full w-full">
        {feed.map((content: ContentProps, index: number) => {
            return <div key={index} className="py-1">
                <ContentWithComments
                    content={content}
                />
            </div>
        })}
    </div>
}

export default Feed