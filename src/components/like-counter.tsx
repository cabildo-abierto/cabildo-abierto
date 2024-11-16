"use client"

import React, { ReactNode, useState } from "react"
import { ReactionButton } from "./reaction-button";
import { ActiveLikeIcon, InactiveLikeIcon } from "./icons";
import { useUser } from "../app/hooks/user";
import { addLike, removeLike } from "../actions/contents";

type LikeCounterProps = {
    content: {
        parentEntityId?: string
        reactions?: {id: string}[]
        _count: {
            reactions: number
        }
        id: string
        author: {id: string}
    }
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
    const initiallyLiked = content.reactions && content.reactions.length > 0
    const [liked, setLiked] = useState(initiallyLiked)

    let delta = 0
    if(initiallyLiked && !liked) delta = -1
    if(!initiallyLiked && liked) delta = 1

    const likeCount = content._count.reactions + delta
    
    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            removeLike(content.id, user.id, entityId)
            setLiked(false)
        } else {
            addLike(content.id, user.id, entityId)
            setLiked(true)
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
        className="mt-1 reaction-btn"
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