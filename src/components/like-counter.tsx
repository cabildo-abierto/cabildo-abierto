"use client"

import React, { ReactNode, useOptimistic, useState } from "react"
import { stopPropagation } from "./utils";
import { ContentProps } from 'src/app/lib/definitions';
import { useUser, useUserLikesContent } from "src/app/hooks/user";
import useSWR, { useSWRConfig } from "swr";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { ReactionButton } from "./reaction-button";
import { fetcher } from "src/app/hooks/utils";
import { addLike, removeLike } from "src/actions/actions";

type LikeCounterProps = {
    contentId: string
    disabled?: boolean
    isEntity?: boolean
    icon1?: ReactNode
    icon2?: ReactNode
}


export const LikeCounter: React.FC<LikeCounterProps> = ({
    contentId,
    disabled=false,
    isEntity=false,
    icon1=<ThumbUpAltIcon fontSize="small"/>,
    icon2=<ThumbUpOffAltIcon fontSize="small"/>
}) => {
    const {user} = useUser()
    const userLikesContent = useSWR("/api/user-like-content/"+contentId+"/"+user.id, fetcher)
    
    if(userLikesContent.isLoading){
        return <></>
    }
    
    const [liked, likeCount] = userLikesContent.data

    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            await userLikesContent.mutate(removeLike(contentId, user.id), {
                optimisticData: [false, likeCount-1],
                rollbackOnError: true,
                populateCache: true,
                revalidate: false
            });
        } else {
            await userLikesContent.mutate(addLike(contentId, user.id), {
                optimisticData: [true, likeCount+1],
                rollbackOnError: true,
                populateCache: true,
                revalidate: false
            });
        }
    }

    return <ReactionButton
        onClick={onLikeClick}
        active={liked}
        icon1={icon1}
        icon2={icon2}
        disabled={!user || disabled}
        count={likeCount}
    />
}