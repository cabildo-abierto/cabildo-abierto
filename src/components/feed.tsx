import React from "react"
import { ContentWithComments } from "./content-with-comments";
import { ContentProps } from "@/actions/get-content";
import { UserProps } from "@/actions/get-user";
import { useContent } from "@/app/hooks/contents";
import { useUser } from "@/app/hooks/user";


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

function getOnlyFollowing(feed: {id: string}[], user: UserProps){
    return feed.filter(({id}) => {
        const {content, isLoading, isError} = useContent(id)
        return content && user.following.some((u) => u.id == content.author?.id)
    })
}


type FeedProps = {
    feed: {id: string}[],
    isLoading: boolean,
    isError: boolean
}


const Feed: React.FC<{feed: FeedProps, following?: boolean}> = ({feed, following=false}) => {
    const user = useUser()
    if(feed.isLoading || user.isLoading){
        return <>Cargando...</>
    }
    if(feed.isError){
        return <>Error al cargar el feed :(</>
    }
    if(following){
        if(!user.user){
            return <>Creá una cuenta y empezá a seguir a otras personas.</>
        }
        feed.feed = getOnlyFollowing(feed.feed, user.user)
    }
    
    return <div className="h-full w-full">
        {feed.feed.map(({id}, index: number) => {
            return <div key={index} className="py-1">
                <ContentWithComments
                    contentId={id}
                />
            </div>
        })}
    </div>
}

export default Feed