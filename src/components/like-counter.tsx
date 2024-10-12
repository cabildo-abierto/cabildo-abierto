"use client"

import React, { ReactNode, useOptimistic, useState } from "react"
import { ReactionButton } from "./reaction-button";
import { ActiveLikeIcon, InactiveCommentIcon, InactiveLikeIcon, ViewsIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";
import { useUser } from "../app/hooks/user";
import { addLike, removeLike } from "../actions/contents";

type LikeCounterProps = {
    content: ContentProps
    disabled?: boolean
    icon1?: ReactNode
    icon2?: ReactNode
    title?: string
}


export const LikeCounter: React.FC<LikeCounterProps> = ({
    content,
    disabled=false,
    icon1=<ActiveLikeIcon/>,
    icon2=<InactiveLikeIcon/>,
    title
}) => {
    const {user} = useUser()
    const entityId = content.parentEntityId
    const [liked, setLiked] = useState(content.reactions.length > 0)
    const [likeCount, setLikeCount] = useState(content._count.reactions)
    
    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            removeLike(content.id, user.id, entityId)
            setLiked(false)
            setLikeCount(likeCount-1)
        } else {
            addLike(content.id, user.id, entityId)
            setLiked(true)
            setLikeCount(likeCount+1)
        }
    }

    const isAuthor = user && user.id == content.author.id

    if(!title){
        if(isAuthor){
            title = "No podés reaccionar a tus propias publicaciones."
        } else if(!user){
            title = "Necesitás una cuenta para reaccionar."
        }
    }
    
    return <ReactionButton
        onClick={onLikeClick}
        active={liked}
        icon1={icon1}
        icon2={icon2}
        disabled={!user || disabled || isAuthor}
        count={likeCount}
        title={title}
    />
}


export const FixedCounter = ({count, icon, title}: {count: number, icon: ReactNode, title?: string}) => {
    
    return <ReactionButton
        onClick={() => {}}
        active={true}
        icon1={icon}
        disabled={true}
        count={count}
        title={title}
    />
}
