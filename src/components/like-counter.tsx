"use client"

import React, { useState } from "react"
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { addDislike, addLike, removeLike, removeDislike } from "@/actions/likes";
import { stopPropagation } from "./utils";
import { useUser } from "./user-provider";

export const LikeCounter: React.FC<any> = ({content}) => {
    const [likeCount, setLikeCount] = useState(content._count.likedBy)
    const [dislikeCount, setDislikeCount] = useState(content._count.dislikedBy)
    const {user} = useUser()

    const wasLiked = content.likedBy.length > 0
    const wasDisliked = content.dislikedBy.length > 0
    const [liked, setLiked] = useState(wasLiked)
    const [disliked, setDisliked] = useState(wasDisliked)
    
    const like_icon = <ThumbUpOutlinedIcon sx={{ fontSize: 18 }}/>
    const dislike_icon = <ThumbDownOutlinedIcon sx={{ fontSize: 18 }}/>

    const onLikeClick = async () => {
        if(liked){
            setLikeCount(likeCount-1)
            setLiked(false)
            await removeLike(content.id);
        } else {
            setLikeCount(likeCount+1)
            setLiked(true)
            if(disliked){
                setDisliked(false)
                setDislikeCount(dislikeCount-1)
            }
            await addLike(content.id);
        }
    }

    const onDislikeClick = async () => {
        if(disliked){
            setDislikeCount(dislikeCount-1)
            setDisliked(false)
            await removeDislike(content.id);
        } else {
            setDislikeCount(dislikeCount+1)
            setDisliked(true)
            if(liked){
                setLiked(false)
                setLikeCount(likeCount-1)
            }
            await addDislike(content.id);
        }
    }

    return <div className="flex">
        <div className="flex items-center px-3">
            <button onClick={stopPropagation(onLikeClick)} disabled={!user} className="text-sm mr-1 text-gray-600 hover:text-gray-800">
                {like_icon}               
            </button>
            <div className="text-gray-600 text-sm">{likeCount}</div>
        </div>
        <div className="flex items-center px-3">
            <button onClick={stopPropagation(onDislikeClick)} disabled={!user} className="text-sm mr-1 text-gray-600 hover:text-gray-800">
                {dislike_icon}               
            </button>
            <div className="text-gray-600 text-sm">{dislikeCount}</div>
        </div>
    </div>
}