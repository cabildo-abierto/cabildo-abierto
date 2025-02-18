"use client"

import React, { ReactNode, useState } from "react"
import { ReactionButton } from "./reaction-button";
import { useUser } from "../hooks/user";
import { ActiveLikeIcon } from "./icons/active-like-icon";
import { InactiveLikeIcon } from "./icons/inactive-like-icon";

type LikeCounterProps = {
    disabled?: boolean
    icon1?: ReactNode
    icon2?: ReactNode
    title?: string
    onLike: () => Promise<{error?: string, uri?: string}>
    onDislike: (likeUri: string) => Promise<{error?: string}>
    likeUri?: string
    initialCount: number
}


export const LikeCounter: React.FC<LikeCounterProps> = ({
    disabled=false,
    icon1=<ActiveLikeIcon/>,
    icon2=<InactiveLikeIcon/>,
    onLike,
    onDislike,
    title,
    likeUri,
    initialCount
}) => {
    const {user} = useUser()
    const [newLikeUri, setNewLikeUri] = useState(likeUri)

    let delta = 0
    if(likeUri != undefined && newLikeUri == undefined) delta = -1
    if(likeUri == undefined && newLikeUri != undefined) delta = 1

    const likeCount = initialCount + delta
    
    const onLikeClick = async () => {
        if(!user) return

        if(newLikeUri != undefined){
            if(newLikeUri != "temporary"){
                onDislike(newLikeUri) // TO DO: Qué pasa si saca el like antes de que termine de agregarse el like?
            }
            setNewLikeUri(undefined)
        } else {
            setNewLikeUri("temporary")
            const {uri} = await onLike()
            if(uri){
                setNewLikeUri(uri)
            } else {
                setNewLikeUri(undefined)
            }
        }
    }

    if(!user){
        title = "Necesitás una cuenta para reaccionar."
    }
    
    return <ReactionButton
        onClick={onLikeClick}
        active={newLikeUri != undefined}
        icon1={icon1}
        icon2={icon2}
        disabled={!user || disabled}
        count={likeCount}
        title={title}
    />
}


export const FixedCounter = ({count, icon, title}: {count: number, icon: ReactNode, title?: string}) => {
    
    return <div className={"text-[var(--text-light)]"}>
        <button
            className={"rounded-lg hover:bg-[var(--background-dark2)] py-1 px-1 flex items-center space-x-1"}
            title={title}
        >
            <div>{icon}</div>
            <div className="text-sm mt-1">{count}</div>
        </button>
    </div>
}