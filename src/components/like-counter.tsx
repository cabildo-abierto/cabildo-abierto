"use client"

import React, { useState } from "react"
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { addDislike, addLike, removeLike, removeDislike } from "@/actions/likes";
import { stopPropagation } from "./utils";
import { ContentProps } from '@/app/lib/definitions';
import { useUser } from "@/app/hooks/user";

export const LikeCounter: React.FC<{content: ContentProps}> = ({content}) => {
    const {user} = useUser()
    const [likeCount, setLikeCount] = useState(content._count.likedBy)
    const [dislikeCount, setDislikeCount] = useState(content._count.dislikedBy)
    const wasLiked = user?.likes.some((c: any) => (c.id == content.id))
    const wasDisliked = user?.dislikes.some((c: any) => (c.id == content.id))
    const [liked, setLiked] = useState(wasLiked)
    const [disliked, setDisliked] = useState(wasDisliked)
    
    const like_icon = <ThumbUpOutlinedIcon sx={{ fontSize: 18 }}/>
    const dislike_icon = <ThumbDownOutlinedIcon sx={{ fontSize: 18 }}/>

    const onLikeClick = async () => {
        if(!user) return
        if(liked){
            setLikeCount(likeCount-1)
            setLiked(false)
            await removeLike(content.id, user.id);
        } else {
            setLikeCount(likeCount+1)
            setLiked(true)
            if(disliked){
                setDisliked(false)
                setDislikeCount(dislikeCount-1)
            }
            await addLike(content.id, user.id);
        }
    }

    const onDislikeClick = async () => {
        if(!user) return
        if(disliked){
            setDislikeCount(dislikeCount-1)
            setDisliked(false)
            await removeDislike(content.id, user.id);
        } else {
            setDislikeCount(dislikeCount+1)
            setDisliked(true)
            if(liked){
                setLiked(false)
                setLikeCount(likeCount-1)
            }
            await addDislike(content.id, user.id);
        }
    }

    return <div className="flex">
        <div className="px-3">
            <button onClick={stopPropagation(onLikeClick)}
                disabled={!user}
                className={liked ? "reaction-btn-selected" : "reaction-btn"}
            >
                <span className="px-1">{like_icon}</span>             
                <span>{likeCount}</span>  
            </button>
        </div>
        <div className="px-3">
            <button onClick={stopPropagation(onDislikeClick)}
                disabled={!user}
                className={disliked ? "reaction-btn-selected" : "reaction-btn"}
            >
                <span className="px-1">{dislike_icon}</span>             
                <span>{dislikeCount}</span>
            </button>
        </div>
    </div>
}