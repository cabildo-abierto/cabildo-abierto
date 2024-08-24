"use client"

import React, { ReactNode, useState } from "react"
import { addLike, removeLike } from "@/actions/likes";
import { stopPropagation } from "./utils";
import { ContentProps } from '@/app/lib/definitions';
import { useUser } from "@/app/hooks/user";
import { useSWRConfig } from "swr";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { ReactionButton } from "./reaction-button";

export const LikeCounter: React.FC<{content: ContentProps, disabled: boolean}> = ({content, disabled}) => {
    const {user} = useUser()
    const [likeCount, setLikeCount] = useState(content._count.reactions)
    const wasLiked = user?.reactions.some((c: any) => (c.contentId == content.id))
    const [liked, setLiked] = useState(wasLiked)
    const {mutate} = useSWRConfig()

    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            setLikeCount(likeCount-1)
            setLiked(false)
            await removeLike(content.id, user.id);
            mutate("/api/content/"+content.id)
            mutate("/api/user/"+user.id)
        } else {
            setLikeCount(likeCount+1)
            setLiked(true)
            await addLike(content.id, user.id);
            mutate("/api/content/"+content.id)
            mutate("/api/user/"+user.id)
        }
    }

    return <ReactionButton
        onClick={onLikeClick}
        active={liked}
        icon1={<ThumbUpAltIcon fontSize="small"/>}
        icon2={<ThumbUpOffAltIcon fontSize="small"/>}
        disabled={!user || disabled}
        count={likeCount}
    />
}