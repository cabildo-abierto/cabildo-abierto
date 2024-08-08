import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { ContentProps } from "@/actions/get-content";
import { UserProps } from "@/actions/get-user";


export function feedFromContents(contents: Record<string, ContentProps>){
    const feed: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(!content.isDraft){
            if(content.type == "Post" || content.type == "FastPost"){
                feed.push(content)
            }
        }
    })
    return feed
}


export function followingFeedFromContents(contents: Record<string, ContentProps>, user: UserProps){
    const feed: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(!content.isDraft){
            if(content.type == "Post" || content.type == "FastPost"){
                if(user.following.some((u) => u.id == content.author?.id))
                    feed.push(content)
            }
        }
    })
    return feed
}


export function profileFeedFromContents(contents: Record<string, ContentProps>, user: UserProps){
    const feed: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(!content.isDraft){
            if(content.type == "Post" || content.type == "FastPost"){
                if(content.author?.id == user.id)
                    feed.push(content)
            }
        }
    })
    return feed
}


const Feed: React.FC<any> = ({contents, user, following=false, userProfile=null}) => {

    let feed: ContentProps[] = []
    if(following){
        feed = followingFeedFromContents(contents, user)
    } else if(userProfile) {
        feed = profileFeedFromContents(contents, userProfile)
    } else {
        feed = feedFromContents(contents)
    }
    
    return <div className="h-full w-full">
        {feed.map((content: ContentProps, index: number) => {
            return <div key={index} className="py-1">
                <ContentWithComments
                    user={user}
                    content={content}
                    contents={contents}
                />
            </div>
        })}
    </div>
}

export default Feed