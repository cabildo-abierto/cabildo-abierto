"use client"

import React, { ReactNode, useState } from "react"
import { ReactionButton } from "./reaction-button";
import { useUser } from "../app/hooks/user";
import { addLike, removeLike } from "../actions/contents";
import { ActiveLikeIcon } from "./icons/active-like-icon";
import { InactiveLikeIcon } from "./icons/inactive-like-icon";
import { IconButton } from "@mui/material";

type LikeCounterProps = {
    content: {
        likeCount: number,
        uri: string
        cid: string
        viewer: {like?: any}
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
    const initiallyLiked = content.viewer.like != undefined
    const [liked, setLiked] = useState(initiallyLiked)

    console.log("content", content)

    let delta = 0
    if(initiallyLiked && !liked) delta = -1
    if(!initiallyLiked && liked) delta = 1

    const likeCount = content.likeCount + delta
    
    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            /*removeLike(content.id, user.id, entityId)*/
            setLiked(false)
        } else {
            addLike(content.uri, content.cid)
            setLiked(true)
        }
    }

    if(!user){
        title = "Necesitás una cuenta para reaccionar."
    }
    
    return <ReactionButton
        onClick={onLikeClick}
        active={liked}
        icon1={icon1}
        icon2={icon2}
        disabled={!user || disabled}
        count={likeCount}
        title={title}
        className="mt-1 reaction-btn"
    />
}


export const FixedCounter = ({count, icon, title}: {count: number, icon: ReactNode, title?: string}) => {
    
    return <div className="text-[var(--text-light)]">
        <IconButton
        title={title}
    >
        {icon} <span className="text-sm flex items-end">{count}</span>
    </IconButton></div>
}