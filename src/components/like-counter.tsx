"use client"

import React, { ReactNode, useOptimistic, useState } from "react"
import { stopPropagation } from "./utils";
import { ContentProps } from 'src/app/lib/definitions';
import { useUser } from "src/app/hooks/user";
import useSWR, { useSWRConfig } from "swr";
import { ReactionButton } from "./reaction-button";
import { fetcher } from "src/app/hooks/utils";
import { addLike, removeLike } from "src/actions/actions";
import { ActiveLikeIcon, InactiveLikeIcon } from "./icons";
import { useContent } from "src/app/hooks/contents";

type LikeCounterProps = {
    contentId: string
    disabled?: boolean
    icon1?: ReactNode
    icon2?: ReactNode
    title?: string
}


export const LikeCounter: React.FC<LikeCounterProps> = ({
    contentId,
    disabled=false,
    icon1=<ActiveLikeIcon/>,
    icon2=<InactiveLikeIcon/>,
    title
}) => {
    const {user} = useUser()
    const userLikesContent = useSWR("/api/user-like-content/"+contentId, fetcher)
    const content = useContent(contentId)

    if(userLikesContent.isLoading || content.isLoading){
        return <></>
    }

    const entityId = content.content.parentEntityId
    
    const [liked, likeCount] = userLikesContent.data
    
    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            await userLikesContent.mutate(removeLike(contentId, user.id, entityId), {
                optimisticData: [false, likeCount-1],
                rollbackOnError: true,
                populateCache: true,
                revalidate: false
            });
        } else {
            await userLikesContent.mutate(addLike(contentId, user.id, entityId), {
                optimisticData: [true, likeCount+1],
                rollbackOnError: true,
                populateCache: true,
                revalidate: false
            });
        }
    }

    const isAuthor = user.id == content.content.author.id

    if(!title){
        if(isAuthor){
            title = "No podés reaccionar a tus propias publicaciones."
        } else if(!user){
            title = "Necesitás una cuenta para poder reaccionar."
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


export const FixedLikeCounter = ({count}: {count: number}) => {
    
    return <ReactionButton
        onClick={() => {}}
        active={true}
        icon1={<ActiveLikeIcon/>}
        icon2={<InactiveLikeIcon/>}
        disabled={true}
        count={count}
    />
}